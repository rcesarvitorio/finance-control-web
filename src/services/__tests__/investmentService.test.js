import { addInvestment, getInvestments, deleteInvestment } from '../investmentService';

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

describe('investmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addInvestment', () => {
    it('deve adicionar um investimento com sucesso quando usuário está autenticado', async () => {
      // Mock do usuário autenticado
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      // Mock do addDoc
      addDoc.mockResolvedValue({ id: 'investment123' });

      const investmentData = {
        description: 'Teste Ação',
        amount: 1000,
        dueDay: '2024-01-15',
        category: 'acao',
      };

      const result = await addInvestment(investmentData);

      expect(getCurrentUser).toHaveBeenCalled();
      expect(collection).toHaveBeenCalled();
      expect(addDoc).toHaveBeenCalled();
      expect(result).toEqual({ id: 'investment123' });
    });

    it('deve lançar erro quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const investmentData = {
        description: 'Teste Ação',
        amount: 1000,
      };

      await expect(addInvestment(investmentData)).rejects.toThrow('User not authenticated');
    });

    it('deve incluir userId e createdAt nos dados do investimento', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      addDoc.mockResolvedValue({ id: 'investment123' });

      const investmentData = {
        description: 'Teste Ação',
        amount: 1000,
        dueDay: '2024-01-15',
        category: 'acao',
      };

      await addInvestment(investmentData);

      const addDocCalls = addDoc.mock.calls;
      expect(addDocCalls).toHaveLength(1);
      
      const [, actualData] = addDocCalls[0];
      expect(actualData).toEqual(expect.objectContaining({
        ...investmentData,
        userId: 'user123',
        createdAt: expect.any(Date),
      }));
    });
  });

  describe('getInvestments', () => {
    it('deve retornar array vazio quando usuário não está autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue(null);

      const result = await getInvestments();

      expect(result).toEqual([]);
      expect(query).not.toHaveBeenCalled();
    });

    it('deve retornar investimentos do usuário quando autenticado', async () => {
      const { getCurrentUser } = require('../authService');
      getCurrentUser.mockReturnValue({ uid: 'user123' });

      const mockDocs = [
        { id: 'investment1', data: () => ({ description: 'Ação PETR4', amount: 1000 }) },
        { id: 'investment2', data: () => ({ description: 'Tesouro Selic', amount: 2000 }) },
      ];

      getDocs.mockResolvedValue({
        docs: mockDocs,
      });

      const result = await getInvestments();

      expect(getCurrentUser).toHaveBeenCalled();
      expect(query).toHaveBeenCalled();
      expect(getDocs).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 'investment1', description: 'Ação PETR4', amount: 1000 },
        { id: 'investment2', description: 'Tesouro Selic', amount: 2000 },
      ]);
    });
  });

  describe('deleteInvestment', () => {
    it('deve deletar investimento com sucesso', async () => {
      deleteDoc.mockResolvedValue();

      await deleteInvestment('investment123');

      expect(doc).toHaveBeenCalled();
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});