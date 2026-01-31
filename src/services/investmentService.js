import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getCurrentUser } from './authService';

const INVESTMENTS_COLLECTION = 'investments';

export const addInvestment = async (investment) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDoc(collection(db, INVESTMENTS_COLLECTION), {
    ...investment,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const getInvestments = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const q = query(
    collection(db, INVESTMENTS_COLLECTION),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteInvestment = async (id) => {
  return deleteDoc(doc(db, INVESTMENTS_COLLECTION, id));
};