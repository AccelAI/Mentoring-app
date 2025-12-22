import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
import { getMessaging } from 'firebase/messaging'
import { getAnalytics } from 'firebase/analytics'

const isTest = process.env.NODE_ENV === 'test'
const isBrowser = typeof window !== 'undefined'

const firebaseConfig = {
  // Provide safe defaults in Jest so importing the app doesn't crash.
  // These values are only used in tests; runtime uses REACT_APP_FIREBASE_* env vars.
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || (isTest ? 'test-api-key' : undefined),
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || (isTest ? 'test.firebaseapp.com' : undefined),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || (isTest ? 'test-project' : undefined),
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || (isTest ? 'test.appspot.com' : undefined),
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || (isTest ? '000000000000' : undefined),
  appId: process.env.REACT_APP_FIREBASE_APP_ID || (isTest ? '1:000000000000:web:test' : undefined),
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// Analytics breaks in Jest/Node (and isn't needed for tests). Only init in real browser builds.
let analytics = null
try {
  if (
    !isTest &&
    isBrowser &&
    firebaseConfig.measurementId &&
    firebaseConfig.projectId
  ) {
    analytics = getAnalytics(app)
  }
} catch (e) {
  analytics = null
}

const auth = getAuth(app)
const storage = getStorage(app)

const db = getFirestore(app)

// Messaging also breaks in Jest/Node and requires browser APIs.
let messaging = null
try {
  if (!isTest && isBrowser && firebaseConfig.messagingSenderId) {
    messaging = getMessaging(app)
  }
} catch (e) {
  messaging = null
}

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()

export { auth, storage, db, messaging, googleProvider, githubProvider, analytics }
