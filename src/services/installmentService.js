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

const INSTALLMENTS_COLLECTION = 'installments';

export const addInstallment = async (installment) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  return addDoc(collection(db, INSTALLMENTS_COLLECTION), {
    ...installment,
    userId: user.uid,
    createdAt: new Date()
  });
};

export const getInstallments = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  const q = query(
    collection(db, INSTALLMENTS_COLLECTION),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteInstallment = async (id) => {
  return deleteDoc(doc(db, INSTALLMENTS_COLLECTION, id));
};
