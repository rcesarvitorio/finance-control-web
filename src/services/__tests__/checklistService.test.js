import { saveChecklistItems, getAllChecklistItems } from '../checklistService';
import { db } from '../firebaseConfig';
import { getCurrentUser } from '../authService';

// Mocks
jest.mock('../firebaseConfig', () => ({
  db: {}
}));

jest.mock('../authService', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

import { setDoc, doc, query, where, getDocs, collection } from 'firebase/firestore';

describe('ChecklistService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getCurrentUser.mockReturnValue({ uid: 'test-user-123' });
    // Mock doc para retornar um objeto que representa a referência do documento
    doc.mockImplementation((db, collection, docId) => ({
      _key: { path: { segments: [collection, docId] } }
    }));
  });

  describe('saveChecklistItems', () => {
    it('Deve salvar itens do checklist com sucesso', async () => {
      const mockItems = [
        { id: 'item-1', text: 'Item 1 - R$ 50.00', completed: true },
        { id: 'item-2', text: 'Item 2 - R$ 100.00', completed: false }
      ];
      const monthKey = '2026-02';

      setDoc.mockResolvedValue();

      await saveChecklistItems(monthKey, mockItems);

      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          userId: 'test-user-123',
          monthKey: '2026-02',
          items: mockItems
        })
      );
    });

    it('Deve lançar erro se usuário não autenticado', async () => {
      getCurrentUser.mockReturnValue(null);

      await expect(saveChecklistItems('2026-02', [])).rejects.toThrow('User not authenticated');
    });

    it('Deve incluir updatedAt timestamp', async () => {
      const mockItems = [];
      setDoc.mockResolvedValue();

      await saveChecklistItems('2026-02', mockItems);

      expect(setDoc).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          updatedAt: expect.any(Date)
        })
      );
    });

    it('Deve usar ID correto para documento (userId_monthKey)', async () => {
      const mockItems = [];
      const mockDocRef = {};
      doc.mockReturnValue(mockDocRef);
      setDoc.mockResolvedValue();

      await saveChecklistItems('2026-02', mockItems);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'checklists', 'test-user-123_2026-02');
    });
  });

  describe('getAllChecklistItems', () => {
    it('Deve retornar todos os itens do checklist do usuário', async () => {
      const mockDocs = [
        {
          data: () => ({
            monthKey: '2026-01',
            items: [
              { id: 'item-1', text: 'Item 1', completed: true }
            ]
          })
        },
        {
          data: () => ({
            monthKey: '2026-02',
            items: [
              { id: 'item-2', text: 'Item 2', completed: false }
            ]
          })
        }
      ];

      const mockSnapshot = {
        docs: mockDocs
      };

      query.mockReturnValue({});
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getAllChecklistItems();

      expect(result).toEqual({
        '2026-01': [{ id: 'item-1', text: 'Item 1', completed: true }],
        '2026-02': [{ id: 'item-2', text: 'Item 2', completed: false }]
      });
    });

    it('Deve retornar objeto vazio se usuário não autenticado', async () => {
      getCurrentUser.mockReturnValue(null);

      const result = await getAllChecklistItems();

      expect(result).toEqual([]);
    });

    it('Deve retornar objeto vazio se não houver itens', async () => {
      const mockSnapshot = {
        docs: []
      };

      query.mockReturnValue({});
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getAllChecklistItems();

      expect(result).toEqual({});
    });

    it('Deve filtrar por userId', async () => {
      const mockSnapshot = { docs: [] };

      query.mockReturnValue({});
      getDocs.mockResolvedValue(mockSnapshot);

      await getAllChecklistItems();

      expect(where).toHaveBeenCalledWith('userId', '==', 'test-user-123');
    });

    it('Deve lidar com erros ao buscar itens', async () => {
      const mockError = new Error('Firestore error');
      getDocs.mockRejectedValue(mockError);

      const result = await getAllChecklistItems();

      expect(result).toEqual({});
    });

    it('Deve organizar itens por mes (monthKey)', async () => {
      const mockDocs = [
        {
          data: () => ({
            monthKey: '2026-03',
            items: [{ id: 'item-3', text: 'Item 3', completed: true }]
          })
        },
        {
          data: () => ({
            monthKey: '2026-01',
            items: [{ id: 'item-1', text: 'Item 1', completed: false }]
          })
        }
      ];

      const mockSnapshot = { docs: mockDocs };

      query.mockReturnValue({});
      getDocs.mockResolvedValue(mockSnapshot);

      const result = await getAllChecklistItems();

      expect(Object.keys(result)).toContain('2026-01');
      expect(Object.keys(result)).toContain('2026-03');
    });
  });
});
