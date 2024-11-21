import { doc, updateDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'

const updateUserProfile = async (user, values) => {
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

export default updateUserProfile
