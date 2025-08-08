import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth'
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { getToken } from 'firebase/messaging'
import {
  auth,
  db,
  messaging,
  googleProvider,
  githubProvider
} from './firebaseConfig'

const saveNotificationToken = (userId) => {
  getToken(messaging, {
    vapidKey: process.env.REACT_APP_VAPID_KEY
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log(currentToken)
        const userDoc = doc(db, 'users', userId)
        return updateDoc(userDoc, {
          token: currentToken
        })
      }
    })
    .catch((err) => {
      console.log('An error occurred while retrieving token. ', err)
    })
}

const handleSignInWithProvider = async (user, provider) => {
  const userDocRef = doc(db, 'users', user.uid)
  const userDoc = await getDoc(userDocRef)

  if (!userDoc.exists()) {
    const username = user.email.split('@')[0]
    await setDoc(userDocRef, {
      displayName: user.displayName || user.email.split('@')[0],
      email: user.email,
      username,
      createdTime: new Date()
    })
  }

  saveNotificationToken(user.uid)

  return { ok: true }
}

export const logIn = async ({ email, password }) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)

    saveNotificationToken(user.uid)

    return { ok: true }
  } catch (err) {
    let error

    switch (err.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        error = 'Incorrect email or password'
        break
      case 'auth/too-many-requests':
        error =
          'Account blocked temporarily due to multiple failed login attempts'
        break
      default:
        error = 'Unknown error occurred'
        break
    }

    return { ok: false, error }
  }
}

export const signUp = async ({ name, email, password, username }) => {
  console.log(name, email, password, username)
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    await setDoc(doc(db, 'users', user.uid), {
      displayName: name,
      email,
      username,
      createdTime: new Date()
    })

    saveNotificationToken(user.uid)

    return { ok: true }
  } catch (err) {
    let error

    if (err.code === 'auth/email-already-in-use') {
      error = 'A user with this email already exists'
    } else {
      error = 'Unknown error occurred'
    }

    return { ok: false, error }
  }
}

export const signInWithOrcid = async (orcidData, accessToken) => {
  try {
    const {
      orcidId,
      firstName,
      lastName,
      fullName,
      email,
      currentAffiliation,
      country
    } = orcidData

    // Check if user already exists by ORCID ID
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('orcidId', '==', orcidId))
    const querySnapshot = await getDocs(q)

    let firebaseUser
    let isNewUser = querySnapshot.empty

    if (isNewUser) {
      // Create new Firebase Auth user for new ORCID user
      const authResult = await signInAnonymously(auth)
      firebaseUser = authResult.user
      console.log(
        'New ORCID user will be created with Firebase Auth ID:',
        firebaseUser.uid
      )
    } else {
      // For existing users, create new anonymous auth (since we can't reuse anonymous users)
      const authResult = await signInAnonymously(auth)
      firebaseUser = authResult.user
      console.log(
        'Existing ORCID user signed in with new Firebase Auth ID:',
        firebaseUser.uid
      )
    }

    let userData

    if (isNewUser) {
      // For new users, create full profile with ORCID data
      userData = {
        displayName: fullName || `${firstName} ${lastName}`.trim(),
        email: email || '',
        orcidId,
        affiliation: currentAffiliation || '',
        location: country || '',
        authProvider: 'orcid',
        orcidToken: accessToken,
        createdTime: new Date(),
        updatedTime: new Date(),
        username: email
          ? email.split('@')[0]
          : `orcid_${orcidId.replace(/-/g, '')}`
      }

      // Create user document with Firebase Auth UID
      await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    } else {
      // For existing users, get their existing data and update it
      const existingUserDoc = querySnapshot.docs[0]
      const existingData = existingUserDoc.data()

      // Update the existing user document to use the new Firebase Auth UID
      const updateData = {
        ...existingData,
        orcidToken: accessToken, // Always update token
        updatedTime: new Date(),
        // Only update these if ORCID provides better data
        ...(fullName && { displayName: fullName }),
        ...(email && { email: email })
        // Note: affiliation and location are preserved from existing data
      }

      // Create new document with current Firebase Auth UID
      await setDoc(doc(db, 'users', firebaseUser.uid), updateData)
      userData = updateData
    }

    console.log('ORCID user data:', userData)

    // Save notification token for the Firebase Auth user
    saveNotificationToken(firebaseUser.uid)

    return {
      ok: true,
      userId: firebaseUser.uid,
      isNewUser,
      userData: {
        uid: firebaseUser.uid,
        ...userData
      }
    }
  } catch (err) {
    console.error('Error signing in with ORCID:', err)
    return {
      ok: false,
      error: err.message || 'Failed to sign in with ORCID'
    }
  }
}

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return await handleSignInWithProvider(result.user, GoogleAuthProvider)
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message

    // The email of the user's account used.
    const email = error.customData ? error.customData.email : null
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error)

    console.log(errorCode, errorMessage, email, credential)
    return { ok: false, errorCode, errorMessage, email, credential }
  }
}

export const signInWithGithub = async () => {
  try {
    return await signInWithPopup(auth, githubProvider)
    // return await handleSignInWithProvider(result.user, githubProvider)
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code
    const errorMessage = error.message

    // The email of the user's account used.
    const email = error.customData ? error.customData.email : null
    // The AuthCredential type that was used.
    const credential = GithubAuthProvider.credentialFromError(error)

    console.log(errorCode, errorMessage, email, credential)
    return { ok: false, errorCode, errorMessage, email, credential }
  }
}

export const signOut = async () => {
  try {
    // Clear ORCID session data
    sessionStorage.removeItem('orcidUser')

    // Sign out from Firebase Auth (if user is signed in)
    await firebaseSignOut(auth)
    console.log('Sign-out successful')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}
