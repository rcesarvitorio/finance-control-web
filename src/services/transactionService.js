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

const TRANSACTIONS_COLLECTION = 'transactions';

export const addTransaction = async (transaction) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const getTransactions = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteTransaction = async (id) => {
  return deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
};
