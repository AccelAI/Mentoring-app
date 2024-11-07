import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

export const setMentorForm = async (user, formData) => {
  console.log("user", user);
  if (!user || !user.uid) {
    return { ok: false, error: "Invalid user object" };
  }
  try {
    const mentorDoc = doc(db, "mentors", user.uid);
    await setDoc(mentorDoc, formData, { merge: true });
    return { ok: true };
  } catch (err) {
    console.error("Error updating mentor form:", err);
    return { ok: false, error: err.message };
  }
};
