import { register, login, logout, getCurrentUser } from '../authService';

// Mock do Firebase Auth
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

// Mock do Firebase Config
jest.mock('../firebaseConfig', () => ({
  auth: {
    currentUser: null,
  },
}));

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('deve chamar createUserWithEmailAndPassword com os parâmetros corretos', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResult = { user: { uid: 'user123' } };
      
      createUserWithEmailAndPassword.mockResolvedValue(mockResult);

      const result = await register(email, password);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
      expect(result).toBe(mockResult);
    });

    it('deve propagar erros do Firebase', async () => {
      const email = 'test@example.com';
      const password = 'weak';
      const mockError = new Error('Password should be at least 6 characters');
      
      createUserWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(register(email, password)).rejects.toThrow('Password should be at least 6 characters');
    });
  });

  describe('login', () => {
    it('deve chamar signInWithEmailAndPassword com os parâmetros corretos', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockResult = { user: { uid: 'user123' } };
      
      signInWithEmailAndPassword.mockResolvedValue(mockResult);

      const result = await login(email, password);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
      expect(result).toBe(mockResult);
    });

    it('deve propagar erros do Firebase', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockError = new Error('Invalid credentials');
      
      signInWithEmailAndPassword.mockRejectedValue(mockError);

      await expect(login(email, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('deve chamar signOut com o auth', async () => {
      signOut.mockResolvedValue();

      await logout();

      expect(signOut).toHaveBeenCalledWith(auth);
    });

    it('deve propagar erros do Firebase', async () => {
      const mockError = new Error('Logout failed');
      signOut.mockRejectedValue(mockError);

      await expect(logout()).rejects.toThrow('Logout failed');
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar o usuário atual do auth', () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };
      auth.currentUser = mockUser;

      const result = getCurrentUser();

      expect(result).toBe(mockUser);
    });

    it('deve retornar null quando não há usuário autenticado', () => {
      auth.currentUser = null;

      const result = getCurrentUser();

      expect(result).toBeNull();
    });
  });
});