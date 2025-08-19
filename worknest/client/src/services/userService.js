import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const saveUserProfileMeta = async (userId, meta) => {
  if (!userId) throw new Error('User ID is required');
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, meta, { merge: true });
};

export default { saveUserProfileMeta };
