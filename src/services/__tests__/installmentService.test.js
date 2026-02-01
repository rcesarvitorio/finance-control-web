import { addInstallment, getInstallments, deleteInstallment } from '../installmentService';

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

describe('installmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addInstallment', () => {
    it('deve adicionar um parcelamento com sucesso quando usuário está autenticado', async () => {
      // Mock do usuário autenticado
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      // Mock do addDoc
      addDoc.mockResolvedValue({ id: 'installment123' });

      const installmentData = {
        description: 'Notebook Dell',
        installmentAmount: 500,
        totalInstallments: 10,
        paymentMethod: 'card',
        purchaseDate: '2024-01-10',
      };

      const result = await addInstallment(installmentData);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: 'installment123' });
    });

    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const installmentData = {
        description: 'Notebook Dell',
        installmentAmount: 500,
      };

      await expect(addInstallment(installmentData)).rejects.toThrow('User not authenticated');
    });

    it('deve incluir userId e createdAt nos dados do parcelamento', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      addDoc.mockResolvedValue({ id: 'installment123' });

      const installmentData = {
        description: 'Notebook Dell',
        installmentAmount: 500,
        totalInstallments: 10,
        paymentMethod: 'card',
        purchaseDate: '2024-01-10',
      };

      await addInstallment(installmentData);

      const addDocCalls = addDoc.mock.calls;
      expect(addDocCalls).toHaveLength(1);
      
      const [, actualData] = addDocCalls[0];
      expect(actualData).toEqual(expect.objectContaining({
        ...installmentData,
        userId: 'user123',
        createdAt: expect.any(Date),
      }));
    });
  });

  describe('getInstallments', () => {
    it('deve retornar array vazio quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const result = await getInstallments();

      expect(result).toEqual([]);
      expect(query).not.toHaveBeenCalled();
    });

    it('deve retornar parcelamentos do usuário quando autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      const mockDocs = [
        { 
          id: 'installment1', 
          data: () => ({ 
            description: 'Notebook Dell', 
            installmentAmount: 500,
            totalInstallments: 10 
          }) 
        },
        { 
          id: 'installment2', 
          data: () => ({ 
            description: 'iPhone 15', 
            installmentAmount: 300,
            totalInstallments: 12 
          }) 
        },
      ];

      getDocs.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await getInstallments();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([
        { 
          id: 'installment1', 
          description: 'Notebook Dell', 
          installmentAmount: 500,
          totalInstallments: 10 
        },
        { 
          id: 'installment2', 
          description: 'iPhone 15', 
          installmentAmount: 300,
          totalInstallments: 12 
        },
      ]);
    });
  });

  describe('deleteInstallment', () => {
    it('deve deletar parcelamento com sucesso', async () => {
      deleteDoc.mockResolvedValue();

      await deleteInstallment('installment123');

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});