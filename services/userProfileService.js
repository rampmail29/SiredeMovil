// services/userProfileService.js
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function getInitialSetupCompleted(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return !!data?.initialSetupCompleted;
}

export async function ensureEmailInProfile() {
  const u = auth.currentUser;
  if (!u) return;
  await getDoc(doc(db, "users", u.uid), { email: u.email }, { merge: true });
}
