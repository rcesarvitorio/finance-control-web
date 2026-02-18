import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { getCurrentUser } from './authService';

const CHECKLIST_COLLECTION = 'checklists';

export const saveChecklistItems = async (monthKey, items) => {
  const user = getCurrentUser();
  if (!user) throw new Error('User not authenticated');
  
  const docId = `${user.uid}_${monthKey}`;
  
  return setDoc(doc(db, CHECKLIST_COLLECTION, docId), {
    userId: user.uid,
    monthKey,
    items,
    updatedAt: new Date()
  });
};

export const getChecklistItems = async (monthKey) => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const docId = `${user.uid}_${monthKey}`;
  
  try {
    const q = query(
      collection(db, CHECKLIST_COLLECTION),
      where('userId', '==', user.uid),
      where('monthKey', '==', monthKey)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.docs.length > 0) {
      return snapshot.docs[0].data().items;
    }
    return null;
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    return null;
  }
};

export const getAllChecklistItems = async () => {
  const user = getCurrentUser();
  if (!user) return [];
  
  try {
    const q = query(
      collection(db, CHECKLIST_COLLECTION),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
    const result = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      result[data.monthKey] = data.items;
    });
    
    return result;
  } catch (error) {
    console.error('Error fetching all checklist items:', error);
    return {};
  }
};
