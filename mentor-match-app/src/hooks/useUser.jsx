import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../api/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
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
      const userDoc = doc(db, 'users', uid)
      const userSnap = await getDoc(userDoc)
      // Determine admin via Firestore collection `admins/{uid}`
      let isAdmin = false
      try {
        const adminDoc = doc(db, 'admins', uid)
        const adminSnap = await getDoc(adminDoc)
        isAdmin = adminSnap.exists()
      } catch (adminError) {
        console.warn('Failed to check admin membership', adminError)
      }
      if (userSnap.exists()) {
        const userData = {
          uid,
          ...userSnap.data(),
          isAdmin
        }
        setUser(userData)
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
  const refreshUser = async (oricidUid) => {
    if (user?.uid) {
      await fetchLoggedUser(user.uid)
    } else if (oricidUid) {
      await fetchLoggedUser(oricidUid)
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
      const usersList = await getUsers({ includePrivate: !!user?.isAdmin })
      console.log('usersList', usersList)
      setUserList(usersList)
    }
    fetchUsers()
  }, [user?.isAdmin])

  useEffect(() => {
    const fetchMenteeList = async () => {
      if (user && user.menteesId) {
        const menteeArr = await getUserArrayByIds(user.menteesId)
        setMentees(menteeArr)
      }
    }
    fetchMenteeList()
  }, [user])

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        userList,
        refreshUser,
        mentees,
        isAdmin: user?.isAdmin
      }}
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
