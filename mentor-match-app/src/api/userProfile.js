import { getAuth } from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { auth, db, messaging } from "./firebaseConfig";

export const setUpProfile = async ({
  user,
  title,
  affiliation,
  location,
  identifyAs,
  profilePicture,
  profileDescription,
  websiteUrl,
  publicProfile,
}) => {
  console.log("user", user);
  if (!user || !user.uid) {
    return { ok: false, error: "Invalid user object" };
  }
  const userDoc = doc(db, "users", user.uid);

  try {
    await updateDoc(userDoc, {
      title,
      affiliation,
      location,
      identifyAs,
      profilePicture,
      profileDescription,
      websiteUrl,
      publicProfile,
    });
    return { ok: true };
  } catch (err) {
    console.error("Error updating profile:", err);
    return { ok: false, error: err.message };
  }
};
