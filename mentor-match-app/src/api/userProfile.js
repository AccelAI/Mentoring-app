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
    const users = querySnapshot.docs.map((doc) => doc.data())
    return users
  } catch (err) {
    console.error('Error fetching users:', err)
    return { ok: false, error: err.message }
  }
}
