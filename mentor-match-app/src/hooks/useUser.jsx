import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../api/firebaseConfig'
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { getUsers, getUserArrayByIds } from '../api/users'

// Create a UserContext
const UserContext = createContext()

// Create a provider component
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userList, setUserList] = useState([])
  const [mentees, setMentees] = useState([])

  // Function to fetch the logged-in user's data
  const fetchLoggedUser = async (uid) => {
    try {
      // First try: direct doc lookup by provided uid
      const directRef = doc(db, 'users', uid)
      const directSnap = await getDoc(directRef)
      if (directSnap.exists()) {
        const userData = { uid, ...directSnap.data() }
        setUser(userData)
        return
      }

      // Fallback: look up by authUidLast mapping (for ORCID users)
      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('authUidLast', '==', uid))
      const qs = await getDocs(q)
      if (!qs.empty) {
        const mappedDoc = qs.docs[0]
        const mappedData = mappedDoc.data()
        setUser({ uid: mappedDoc.id, ...mappedData })
        return
      }

      // No user found
      setUser(null)
    } catch (error) {
      console.error('Error fetching user data: ', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Function to refresh the logged-in user's data
  const refreshUser = async () => {
    if (user?.uid) {
      await fetchLoggedUser(user.uid)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        console.log('User is logged in: ', user.uid)
        await fetchLoggedUser(user.uid)
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const usersList = await getUsers()
      console.log('usersList', usersList)
      setUserList(usersList)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchMenteeList = async () => {
      if (user && user.mentees) {
        const menteeArr = await getUserArrayByIds(user.mentees)
        setMentees(menteeArr)
      }
    }
    fetchMenteeList()
  }, [user])

  return (
    <UserContext.Provider
      value={{ user, loading, userList, refreshUser, mentees }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Create a custom hook to use the UserContext
const useUser = () => {
  return useContext(UserContext)
}

export { UserProvider, useUser }
