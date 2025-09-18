/**
 * One-off migration: Firestore users -> Firebase Auth users.
 * DO NOT commit your service account key. Supply GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_JSON.
 *
 * Usage:
 *  GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
 *  FIREBASE_PROJECT_ID=your-project-id \
 *  node server/userMigration.js
 */
import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import crypto from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure we load env from server/.env even if running from project root
dotenv.config({ path: path.join(__dirname, '.env') })

// Prefer explicit Service Account via env, then fall back to Application Default Credentials.
function getCredential() {
  // Option B: path to JSON file (standard GOOGLE_APPLICATION_CREDENTIALS)
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    try {
      const resolved = path.isAbsolute(saPath)
        ? saPath
        : path.join(__dirname, saPath)
      const json = JSON.parse(readFileSync(resolved, 'utf8'))
      if (!process.env.FIREBASE_PROJECT_ID && json.project_id) {
        process.env.FIREBASE_PROJECT_ID = json.project_id
      }
      console.log('Using service account from', resolved)
      return admin.credential.cert(json)
    } catch (e) {
      console.error(
        'Failed to read GOOGLE_APPLICATION_CREDENTIALS file:',
        e.message
      )
      throw e
    }
  }

  // Fallback: ADC (GCE, Cloud Run, gcloud auth application-default login, etc.)
  return admin.credential.applicationDefault()
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: getCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID
    })
  } catch (e) {
    console.error('Failed to initialize Firebase Admin SDK:', e.message)
    throw e
  }
}

const db = admin.firestore()

// Copy all top-level docs from 'users-test' to 'users'. Does not copy subcollections.
async function copyUsersTestToUsers({
  source = 'users-test',
  target = 'users',
  merge = true,
  chunkSize = 450,
  userId
} = {}) {
  if (userId) {
    const doc = await db.collection(source).doc(userId).get()
    if (!doc.exists) {
      console.log(`No doc found for ${source}/${userId}`)
      return
    }
    console.log(`Copying single doc ${source}/${userId} -> ${target}/${userId}`)
    const destRef = db.collection(target).doc(doc.id)
    const data = doc.data()
    if (merge) {
      await destRef.set(data, { merge: true })
    } else {
      await destRef.set(data)
    }
    console.log(`Copied 1 doc from ${source} to ${target}`)
    return
  }

  const snap = await db.collection(source).get()
  console.log(
    `Copying ${snap.size} docs from ${source} -> ${target} (test: limited to 1)`
  )
  let processed = 0
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    const destRef = db.collection(target).doc(doc.id)
    const data = doc.data()
    if (merge) {
      batch.set(destRef, data, { merge: true })
    } else {
      batch.set(destRef, data)
    }
    ops++
    processed++
  }

  if (ops > 0) {
    await batch.commit()
  }
  console.log(`Copied ${processed} doc from ${source} to ${target}`)
}

async function copyFormsTestToForms({
  source,
  target,
  merge = true,
  chunkSize = 450
} = {}) {
  const snap = await db.collection(source).get()
  console.log(
    `Copying ${snap.size} docs from ${source} -> ${target} (test: limited to 1)`
  )

  let processed = 0
  let batch = db.batch()
  let ops = 0

  for (const doc of snap.docs) {
    const destRef = db.collection(target).doc(doc.id)
    const data = doc.data()

    if (merge) {
      batch.set(destRef, data, { merge: true })
    } else {
      batch.set(destRef, data)
    }

    const statusRef = destRef.collection('applicationStatus').doc('current')
    const statusData = {
      status: 'approved',
      submittedAt: new Date(),
      lastUpdated: new Date()
    }
    batch.set(statusRef, statusData, { merge: true })

    ops += 2
    processed++
  }

  if (ops > 0) {
    await batch.commit()
  }
  console.log(`Copied ${processed} doc from ${source} to ${target}`)
}

const randomPassword = () => crypto.randomBytes(12).toString('base64')

async function migrate() {
  const snap = await db.collection('users-test').get()
  console.log(`Found ${snap.size} user docs`)

  let created = 0
  let skipped = 0
  let updated = 0
  const resetLinks = []

  for (const doc of snap.docs) {
    const uid = doc.id
    const data = doc.data()

    if (data.authMigrated) {
      skipped++
      continue
    }

    // Check if Auth user already exists
    let exists = false
    try {
      await admin.auth().getUser(uid)
      exists = true
    } catch (e) {
      if (e.code !== 'auth/user-not-found') {
        console.error('Error fetching user', uid, e)
        continue
      }
    }

    const email = data.email && data.email.includes('@') ? data.email : null
    const displayName =
      data.displayName || data.username || (email ? email.split('@')[0] : null)

    if (!exists) {
      try {
        let pass = randomPassword()
        console.log(`Creating auth user ${uid} / ${email}  (password: ${pass})`)
        await admin.auth().createUser({
          uid,
          // If no email, omit (you can later let user add one)
          ...(email && { email }),
          displayName,
          // Only needed if you want password login. For SSO/custom-token only, you can omit.
          password: pass
        })
        created++
      } catch (err) {
        console.error('Failed to create auth user for', uid, err.message)
        continue
      }
    } /* else {
      // Optionally update display name / email if missing in Auth
      try {
        const update = {}
        if (displayName) update.displayName = displayName
        if (email) update.email = email
        if (Object.keys(update).length) {
          await admin.auth().updateUser(uid, update)
          updated++
        }
      } catch (err) {
        console.error('Failed to update auth user', uid, err.message)
      }
    } */

    // Custom claims: admin?
    try {
      const adminDoc = await db.collection('admins').doc(uid).get()
      if (adminDoc.exists) {
        await admin.auth().setCustomUserClaims(uid, { admin: true })
      }
    } catch (err) {
      console.error('Setting claims failed for', uid, err.message)
    }

    // Mark migrated
    await doc.ref.set(
      { authMigrated: true, authMigratedAt: new Date() },
      { merge: true }
    )

    // (Optional) collect password reset link (only if email present & you intend email/password login)
    if (email) {
      try {
        const link = await admin.auth().generatePasswordResetLink(email)
        resetLinks.push({ uid, email, link })
      } catch (err) {
        console.error('Could not generate reset link for', email, err.message)
      }
    }
  }

  console.log({ created, updated, skipped })
  // Write reset links to disk (optional)
  if (resetLinks.length) {
    const out = resetLinks
      .map((r) => `${r.uid},${r.email},${r.link}`)
      .join('\n')
    const file = path.join(__dirname, 'password_reset_links.csv')
    await import('fs').then((fs) => fs.writeFileSync(file, out))
    console.log(`Password reset links saved to ${file}`)
  }

  process.exit(0)
}

async function generateResetLinks() {
  const snap = await db.collection('users').get()
  console.log(`Found ${snap.size} user docs`)
  const resetLinks = []
  for (const doc of snap.docs) {
    const email = doc.data().email
    if (email) {
      try {
        const link = await admin.auth().generatePasswordResetLink(email)
        resetLinks.push({ uid: doc.id, email, link })
        console.log(`Generated reset link for ${email}: ${link}`)
      } catch (err) {
        console.error('Error generating reset link for', email, err.message)
      }
    }
  }
  // Write reset links to disk
  if (resetLinks.length) {
    const out = resetLinks
      .map((r) => `${r.uid},${r.email},${r.link}`)
      .join('\n')
    const file = path.join(__dirname, 'password_reset_links.csv')
    await import('fs').then((fs) => fs.writeFileSync(file, out))
    console.log(`Password reset links saved to ${file}`)
  }
  return resetLinks
}

/* migrate().catch((e) => {
  console.error(e)
  process.exit(1)
}) 

await copyUsersTestToUsers()

await copyFormsTestToForms({
  source: 'mentors-test',
  target: 'mentors'
})

await copyFormsTestToForms({
  source: 'mentees-test',
  target: 'mentees'
})

await generateResetLinks() */
