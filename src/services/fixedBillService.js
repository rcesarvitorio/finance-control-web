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

const FIXED_BILLS_COLLECTION = 'fixedBills';

export const addFixedBill = async (fixedBill) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDoc(collection(db, FIXED_BILLS_COLLECTION), {
    ...fixedBill,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const getFixedBills = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const q = query(
    collection(db, FIXED_BILLS_COLLECTION),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteFixedBill = async (id) => {
  return deleteDoc(doc(db, FIXED_BILLS_COLLECTION, id));
};