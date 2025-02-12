import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../api/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import { getUsers } from '../api/users'
// Create a UserContext
const UserContext = createContext()

// Create a provider component
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userList, setUserList] = useState([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        console.log('User is logged in: ', user.uid)
        try {
          const userDoc = doc(db, 'users', user.uid)
          const userSnap = await getDoc(userDoc)
          const userData = {
            uid: user.uid,
            ...userSnap.data()
          }
          setUser(userData)
        } catch (error) {
          console.error('Error fetching user data: ', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      const usersList = await getUsers()
      console.log('usersList', usersList)
      setUserList(usersList)
    }
    fetchUsers()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, userList }}>
      {children}
    </UserContext.Provider>
  )
}

// Create a custom hook to use the UserContext
const useUser = () => {
  return useContext(UserContext)
}

export { UserProvider, useUser }
