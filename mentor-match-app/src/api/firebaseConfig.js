import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD5TguQtfhMh8_OLbCviNLpejIn0s0cNHY",
  authDomain: "mentor-match-backend.firebaseapp.com",
  projectId: "mentor-match-backend",
  storageBucket: "mentor-match-backend.appspot.com",
  messagingSenderId: "161591012051",
  appId: "1:161591012051:web:527587d2b9c5b9a06c8226",
  measurementId: "G-5HFHH4PJDG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const storage = getStorage(app);

const db = getFirestore(app);

const messaging = getMessaging(app);

const googleProvider = new GoogleAuthProvider();

export { auth, storage, db, messaging, googleProvider };
