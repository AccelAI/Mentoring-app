import { doc, updateDoc, getDocs, getDoc, collection, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'

export const updateUserProfile = async (user, values) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }
  const userDoc = doc(db, 'users', user.uid)

  try {
    // Only update profile data (do NOT set profileCompleted here)
    await updateDoc(userDoc, { ...values, updatedTime: new Date() })
    // Fetch fresh snapshot so caller can update context immediately
    const snap = await getDoc(userDoc)
    return { ok: true, data: { uid: user.uid, ...snap.data() } }
  } catch (err) {
    console.error('Error updating profile:', err)
    return { ok: false, error: err.message }
  }
}

// Mark profile as completed (called after onboarding dialogs)
export const finalizeUserProfile = async (userId) => {
  if (!userId) return { ok: false, error: 'Invalid user ID' }
  try {
    const userDoc = doc(db, 'users', userId)
    await updateDoc(userDoc, { profileCompleted: true, updatedTime: new Date() })
    const snap = await getDoc(userDoc)
    return { ok: true, data: { uid: userId, ...snap.data() } }
  } catch (err) {
    console.error('Error finalizing profile:', err)
    return { ok: false, error: err.message }
  }
}

export const getUsers = async ({ includePrivate = false } = {}) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id
    }))
    return includePrivate
      ? users
      : users.filter((user) => user.publicProfile === true)
  } catch (err) {
    console.error('Error fetching users:', err)
    return { ok: false, error: err.message }
  }
}

export const getUserById = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId)
    const user = await getDoc(userDoc)
    return { ...user.data(), uid: user.id }
  } catch (err) {
    console.error('Error fetching user:', err)
    return null
  }
}

export const filterUsers = (query, users) => {
  if (!Array.isArray(users)) return []
  if (!query) return users
  const lowerCaseQuery = query.toLowerCase()
  const safe = (v) => (typeof v === 'string' ? v.toLowerCase() : '')
  return users.filter((d) => {
    if (!d) return false
    return (
      safe(d.displayName).includes(lowerCaseQuery) ||
      safe(d.location).includes(lowerCaseQuery) ||
      safe(d.affiliation).includes(lowerCaseQuery) ||
      safe(d.role).includes(lowerCaseQuery) ||
      safe(d.email).includes(lowerCaseQuery)
    )
  })
}

export const getUserArrayByIds = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return []
  }
  try {
    const users = await Promise.all(userIds.map((id) => getUserById(id)))
    console.log('Fetched users:', users)
    return users
  } catch (err) {
    console.error('Error fetching user list by IDs:', err)
    return []
  }
}

export const getAdmins = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'admins'))
    const adminIds = querySnapshot.docs.map((d) => (d.id))
    const admins = await getUserArrayByIds(adminIds)
    console.log('Fetched admins:', admins)
    return admins
  } catch (err) {
    console.error('Error fetching admins:', err)
    return { ok: false, error: err.message }
  }
}

export const setAsAdmin = async (userId, adminId) => {
  if (!userId) {
    return { ok: false, error: 'Invalid user ID' }
  }
  try {
    const adminRef = doc(db, 'admins', userId)
    const snap = await getDoc(adminRef)
    if (snap.exists()) {
      return { ok: true, alreadyAdmin: true, msg: 'User is already an admin' }
    }

    await setDoc(
      adminRef,
      { createdAt: new Date(), setBy: adminId },
      { merge: true }
    )

    return { ok: true }
  } catch (err) {
    console.error('Error setting user as admin:', err)
    return { ok: false, error: err.message }
  }
}

export const removeAdmin = async (userId) => {
  if (!userId) {
    return { ok: false, error: 'Invalid user ID' }
  }
  try {
    const adminRef = doc(db, 'admins', userId)
    const snap = await getDoc(adminRef)
    if (!snap.exists()) {
      return { ok: false, error: 'User is not an admin' }
    }
    await deleteDoc(adminRef)
    return { ok: true }
  } catch (err) {
    console.error('Error removing admin:', err)
    return { ok: false, error: err.message }
  }
}
