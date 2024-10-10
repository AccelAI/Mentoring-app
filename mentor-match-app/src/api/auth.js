import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { auth, db, messaging, googleProvider } from "./firebaseConfig";

const saveNotificationToken = (userId) => {
  getToken(messaging, {
    vapidKey: process.env.REACT_APP_VAPID_KEY,
  })
    .then((currentToken) => {
      if (currentToken) {
        console.log(currentToken);
        const userDoc = doc(db, "users", userId);
        return updateDoc(userDoc, {
          token: currentToken,
        });
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
    });
};

export const logIn = async ({ email, password }) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    saveNotificationToken(user.uid);

    return { ok: true };
  } catch (err) {
    let error;

    switch (err.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        error = "Incorrect email or passsword";
        break;
      case "auth/too-many-requests":
        error =
          "Account blocked temporarily due to multiple failed login attempts";
        break;
      default:
        error = "Unknown error occurred";
        break;
    }

    return { ok: false, error };
  }
};

export const signUp = async ({ name, email, password, username }) => {
  console.log(name, email, password, username);
  try {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await setDoc(doc(db, "users", user.uid), {
      display_name: name,
      email,
      username,
      created_time: new Date(),
    });

    saveNotificationToken(user.uid);

    return { ok: true };
  } catch (err) {
    let error;

    if (err.code === "auth/email-already-in-use") {
      error = "An user with this email already exists";
    } else {
      error = "Unknown error occurred";
    }

    return { ok: false, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const username = user.displayName.replace(/\s+/g, "").toLowerCase();
      await setDoc(userDocRef, {
        display_name: user.displayName,
        email: user.email,
        username: username,
        created_time: new Date(),
      });
    }

    saveNotificationToken(user.uid);

    return { ok: true };
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData ? error.customData.email : null;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
    console.log(errorCode, errorMessage, email, credential);
    return { ok: false, errorCode, errorMessage, email, credential };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log("Sign-out successful");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};
