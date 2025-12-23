import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
  const fetchLoggedUser = useCallback(async (uid) => {
    setLoading(true) // ensure loading true at start
    try {
      console.log(`Fetching user data for uid: ${uid}`)
      const userDoc = doc(db, 'users', uid)
      const userSnap = await getDoc(userDoc)
      let isAdmin = false
      try {
        const adminDoc = doc(db, 'admins', uid)
        const adminSnap = await getDoc(adminDoc)
        isAdmin = adminSnap.exists()
      } catch (adminError) {
        console.warn('Failed to check admin membership', adminError)
      }
      if (userSnap.exists()) {
        const userData = { uid, ...userSnap.data(), isAdmin }
        console.log('Setting user data: ', userData)
        setUser(userData)
        setLoading(false) // success path
        return
      }
      console.log('No user data found for uid:', uid)
      setUser(null)
    } catch (err) {
      console.error('Error fetching user data: ', err)
      setUser(null)
    } finally {
      setLoading(false) // guarantee completion
    }
  }, [])

  // Function to refresh the logged-in user's data
  const refreshUser = useCallback(async (uidOverride) => {
    const targetUid = uidOverride || user?.uid || auth.currentUser?.uid
    if (targetUid) {
      await fetchLoggedUser(targetUid)
    }
  }, [fetchLoggedUser, user?.uid])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        console.log('User is logged in: ', authUser.uid)
        await fetchLoggedUser(authUser.uid)
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return unsubscribe
  }, [fetchLoggedUser])

  // Listen for cross-window messages (e.g., from OAuth popup) to refresh user data
  useEffect(() => {
    const handler = async (e) => {
      try {
        if (!e || !e.data) return
        if (e.data.type === 'SLACK_OAUTH_SUCCESS') {
          console.log(
            '[useUser] Received SLACK_OAUTH_SUCCESS message, refreshing user',
            e.data.state
          )
          await refreshUser(e.data.state)
        }
      } catch (err) {
        console.warn('Error handling window message in useUser:', err)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [refreshUser])

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getUsers({ includePrivate: !!user?.isAdmin })
      // Guard: getUsers may return error object
      if (Array.isArray(usersList)) {
        setUserList(usersList)
      } else if (usersList && usersList.ok === false && usersList.error) {
        console.error('Error fetching users:', usersList.error)
        setUserList([])
      }
    }
    fetchUsers()
  }, [user?.isAdmin])

  useEffect(() => {
    const fetchMenteeList = async () => {
      if (user && user.menteesId) {
        const menteeArr = await getUserArrayByIds(user.menteesId)
        setMentees(menteeArr)
      } else {
        setMentees([])
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
