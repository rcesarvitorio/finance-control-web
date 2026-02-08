import { addFixedBill, getFixedBills, deleteFixedBill } from '../fixedBillService';

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

describe('fixedBillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFixedBill', () => {
    it('deve adicionar uma conta fixa com sucesso quando usuário está autenticado', async () => {
      // Mock do usuário autenticado
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      // Mock do addDoc
      addDoc.mockResolvedValue({ id: 'fixedBill123' });

      const fixedBillData = {
        description: 'Conta de Luz',
        amount: 150,
        dueDay: '2024-01-15',
        category: 'luz',
      };

      const result = await addFixedBill(fixedBillData);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: 'fixedBill123' });
    });

    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const fixedBillData = {
        description: 'Conta de Luz',
        amount: 150,
      };

      await expect(addFixedBill(fixedBillData)).rejects.toThrow('User not authenticated');
    });

    it('deve incluir userId e createdAt nos dados da conta fixa', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      addDoc.mockResolvedValue({ id: 'fixedBill123' });

      const fixedBillData = {
        description: 'Conta de Luz',
        amount: 150,
        dueDay: '2024-01-15',
        category: 'luz',
      };

      await addFixedBill(fixedBillData);

      const addDocCalls = addDoc.mock.calls;
      expect(addDocCalls).toHaveLength(1);
      
      const [, actualData] = addDocCalls[0];
      expect(actualData).toEqual(expect.objectContaining({
        ...fixedBillData,
        userId: 'user123',
        createdAt: expect.any(Date),
      }));
    });
  });

  describe('getFixedBills', () => {
    it('deve retornar array vazio quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const result = await getFixedBills();

      expect(result).toEqual([]);
      expect(query).not.toHaveBeenCalled();
    });

    it('deve retornar contas fixas do usuário quando autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      const mockDocs = [
        { id: 'fixedBill1', data: () => ({ description: 'Conta de Luz', amount: 150 }) },
        { id: 'fixedBill2', data: () => ({ description: 'Conta de Água', amount: 80 }) },
      ];

      getDocs.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await getFixedBills();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'fixedBill1', description: 'Conta de Luz', amount: 150 },
        { id: 'fixedBill2', description: 'Conta de Água', amount: 80 },
      ]);
    });
  });

  describe('deleteFixedBill', () => {
    it('deve deletar conta fixa com sucesso', async () => {
      deleteDoc.mockResolvedValue();

      await deleteFixedBill('fixedBill123');

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});