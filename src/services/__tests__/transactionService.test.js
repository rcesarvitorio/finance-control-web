import { addTransaction, getTransactions, deleteTransaction } from '../transactionService';

// Mock do Firebase
jest.mock('../firebaseConfig', () => ({
  db: {},
}));

jest.mock('../authService', () => ({
  getCurrentUser: jest.fn(),
}));

import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

// Mock do firebase/firestore
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

describe('transactionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addTransaction', () => {
    it('deve adicionar uma transação com sucesso quando usuário está autenticado', async () => {
      // Mock do usuário autenticado
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      // Mock do addDoc
      addDoc.mockResolvedValue({ id: 'transaction123' });

      const transactionData = {
        description: 'Salário',
        amount: 5000,
        type: 'income',
        date: '2024-01-15',
      };

      const result = await addTransaction(transactionData);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: 'transaction123' });
    });

    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const transactionData = {
        description: 'Salário',
        amount: 5000,
      };

      await expect(addTransaction(transactionData)).rejects.toThrow('User not authenticated');
    });

    it('deve incluir userId e createdAt nos dados da transação', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      addDoc.mockResolvedValue({ id: 'transaction123' });

      const transactionData = {
        description: 'Salário',
        amount: 5000,
        type: 'income',
        date: '2024-01-15',
      };

      await addTransaction(transactionData);

      const addDocCalls = addDoc.mock.calls;
      expect(addDocCalls).toHaveLength(1);
      
      const [, actualData] = addDocCalls[0];
      expect(actualData).toEqual(expect.objectContaining({
        ...transactionData,
        userId: 'user123',
        createdAt: expect.any(Date),
      }));
    });
  });

  describe('getTransactions', () => {
    it('deve retornar array vazio quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const result = await getTransactions();

      expect(result).toEqual([]);
      expect(query).not.toHaveBeenCalled();
    });

    it('deve retornar transações do usuário quando autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      const mockDocs = [
        { 
          id: 'transaction1', 
          data: () => ({ 
            description: 'Salário', 
            amount: 5000,
            type: 'income' 
          }) 
        },
        { 
          id: 'transaction2', 
          data: () => ({ 
            description: 'Aluguel', 
            amount: 1500,
            type: 'expense' 
          }) 
        },
      ];

      getDocs.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await getTransactions();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([
        { 
          id: 'transaction1', 
          description: 'Salário', 
          amount: 5000,
          type: 'income' 
        },
        { 
          id: 'transaction2', 
          description: 'Aluguel', 
          amount: 1500,
          type: 'expense' 
        },
      ]);
    });
  });

  describe('deleteTransaction', () => {
    it('deve deletar transação com sucesso', async () => {
      deleteDoc.mockResolvedValue();

      await deleteTransaction('transaction123');

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});