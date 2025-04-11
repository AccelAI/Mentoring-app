import { doc, updateDoc, getDocs, collection } from 'firebase/firestore'
import { db } from './firebaseConfig'

export const updateUserProfile = async (user, values) => {
  console.log('user', user)
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }
  const userDoc = doc(db, 'users', user.uid)

  try {
    await updateDoc(userDoc, values)
    return { ok: true }
  } catch (err) {
    console.error('Error updating profile:', err)
    return { ok: false, error: err.message }
  }
}

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'))
    const users = querySnapshot.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .filter((user) => user.publicProfile === true)
    return users
  } catch (err) {
    console.error('Error fetching users:', err)
    return { ok: false, error: err.message }
  }
}

/* export const getUserById = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId)
    const user = await getDoc(userDoc)
    return { ...user.data(), id: user.id }
  } catch (err) {
    console.error('Error fetching user:', err)
    return { ok: false, error: err.message }
  }
} */

export const filterUsers = (query, users) => {
  if (!query) {
    return users
  } else {
    const lowerCaseQuery = query.toLowerCase()
    return users.filter(
      (d) =>
        d.displayName.toLowerCase().includes(lowerCaseQuery) ||
        d.location.toLowerCase().includes(lowerCaseQuery) ||
        d.affiliation.toLowerCase().includes(lowerCaseQuery) ||
        (d.role && d.role.toLowerCase().includes(lowerCaseQuery))
    )
  }
}
