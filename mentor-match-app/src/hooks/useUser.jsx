import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../api/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
// Create a UserContext
const UserContext = createContext();

// Create a provider component
const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        console.log("User is logged in: ", user.uid);
        try {
          const userDoc = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDoc);
          const userData = {
            uid: user.uid,
            ...userSnap.data(),
          };
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUser(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
const useUser = () => {
  return useContext(UserContext);
};

export { UserProvider, useUser };
