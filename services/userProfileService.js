// services/userProfileService.js
import { db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getInitialSetupCompleted(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return !!data?.initialSetupCompleted;
}
