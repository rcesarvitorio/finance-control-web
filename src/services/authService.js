import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export const register = (email, password) => 
  createUserWithEmailAndPassword(auth, email, password);

export const login = (email, password) => 
  signInWithEmailAndPassword(auth, email, password);

export const logout = () => signOut(auth);

export const getCurrentUser = () => auth.currentUser;
