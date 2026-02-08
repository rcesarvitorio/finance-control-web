import { useUserStore } from '../userStore';

describe('userStore', () => {
  let store;

  beforeEach(() => {
    // Limpa o store antes de cada teste
    store = useUserStore.getState();
    store.setUser(null);
  });

  describe('estado inicial', () => {
    it('deve ter user como null inicialmente', () => {
      expect(store.user).toBeNull();
    });
  });

  describe('setUser', () => {
    it('deve definir o usuário corretamente', () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };

      store.setUser(mockUser);

      // Verifica se o estado foi atualizado
      const updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(mockUser);
    });

    it('deve sobrescrever usuário existente', () => {
      const initialUser = { uid: 'user123', email: 'test@example.com' };
      const newUser = { uid: 'user456', email: 'new@example.com' };

      // Define usuário inicial
      store.setUser(initialUser);
      let updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(initialUser);

      // Sobrescreve com novo usuário
      store.setUser(newUser);
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(newUser);
    });

    it('deve aceitar usuário null', () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };

      // Define usuário
      store.setUser(mockUser);
      let updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(mockUser);

      // Define como null
      store.setUser(null);
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBeNull();
    });
  });

  describe('clearUser', () => {
    it('deve limpar o usuário (definir como null)', () => {
      const mockUser = { uid: 'user123', email: 'test@example.com' };

      // Define usuário primeiro
      store.setUser(mockUser);
      let updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(mockUser);

      // Limpa usuário
      store.clearUser();
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBeNull();
    });

    it('deve funcionar mesmo quando usuário já é null', () => {
      // Garante que está null inicialmente
      expect(store.user).toBeNull();

      // Tenta limpar novamente
      store.clearUser();
      const updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBeNull();
    });
  });

  describe('integração entre ações', () => {
    it('deve permitir sequência de setUser e clearUser', () => {
      const user1 = { uid: 'user1', email: 'user1@example.com' };
      const user2 = { uid: 'user2', email: 'user2@example.com' };

      // Sequência de ações
      store.setUser(user1);
      let updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(user1);

      store.setUser(user2);
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(user2);

      store.clearUser();
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBeNull();

      store.setUser(user1);
      updatedStore = useUserStore.getState();
      expect(updatedStore.user).toBe(user1);
    });
  });

  describe('persistência do estado', () => {
    it('deve manter estado entre chamadas do hook', () => {
      const store1 = useUserStore.getState();
      const mockUser = { uid: 'user123', email: 'test@example.com' };

      store1.setUser(mockUser);
      
      // Verifica estado atualizado
      const updatedStore1 = useUserStore.getState();
      expect(updatedStore1.user).toBe(mockUser);

      // Nova instância deve ter o mesmo estado
      const store2 = useUserStore.getState();
      expect(store2.user).toBe(mockUser);
      // Store deve ser a mesma instância (Zustand mantém singleton)
      expect(store2).toBe(updatedStore1);
    });
  });
});