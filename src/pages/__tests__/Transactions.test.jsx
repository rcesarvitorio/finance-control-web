import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Transactions from '../Transactions';

// Mock dos serviços
jest.mock('../../services/transactionService', () => ({
  addTransaction: jest.fn(),
  getTransactions: jest.fn(),
  deleteTransaction: jest.fn(),
}));

// Mock do window.confirm e alert
global.confirm = jest.fn();
global.alert = jest.fn();

import { addTransaction, getTransactions, deleteTransaction } from '../../services/transactionService';

describe('Transactions Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock padrão para getTransactions
    getTransactions.mockResolvedValue([
      { id: '1', description: 'Salário', amount: 5000 },
      { id: '2', description: 'Aluguel', amount: -1500 },
    ]);
    
    // Mock padrão para window.confirm
    global.confirm.mockReturnValue(true);
  });

  const renderTransactions = () => {
    return render(<Transactions />);
  };

  describe('renderização inicial', () => {
    it('deve renderizar o título "Transações"', () => {
      renderTransactions();
      
      expect(screen.getByText('Transações')).toBeInTheDocument();
    });

    it('deve renderizar botão "Voltar"', () => {
      renderTransactions();
      
      expect(screen.getByText('Voltar')).toBeInTheDocument();
    });

    it('deve renderizar campos do formulário', () => {
      renderTransactions();
      
      expect(screen.getByPlaceholderText('Descrição')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Valor')).toBeInTheDocument();
    });

    it('deve renderizar botão "Adicionar"', () => {
      renderTransactions();
      
      expect(screen.getByRole('button', { name: 'Adicionar' })).toBeInTheDocument();
    });
  });

  describe('carregamento de dados', () => {
    it('deve chamar getTransactions ao montar o componente', () => {
      renderTransactions();
      
      expect(getTransactions).toHaveBeenCalledTimes(1);
    });

    it('deve exibir transações carregadas', async () => {
      const mockTransactions = [
        { id: '1', description: 'Salário', amount: 5000 },
        { id: '2', description: 'Aluguel', amount: -1500 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      
      renderTransactions();
      
      await waitFor(() => {
        expect(screen.getByText('Salário')).toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
      });
    });

    it('deve exibir mensagem quando não há transações', async () => {
      getTransactions.mockResolvedValue([]);
      
      renderTransactions();
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma transação registrada')).toBeInTheDocument();
      });
    });
  });

  describe('interação com formulário', () => {
    it('deve atualizar campo de descrição ao digitar', () => {
      renderTransactions();
      
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      fireEvent.change(descriptionInput, { target: { value: 'Teste' } });
      
      expect(descriptionInput.value).toBe('Teste');
    });

    it('deve atualizar campo de valor ao digitar', () => {
      renderTransactions();
      
      const amountInput = screen.getByPlaceholderText('Valor');
      fireEvent.change(amountInput, { target: { value: '100' } });
      
      expect(amountInput.value).toBe('100');
    });
  });

  describe('adição de transação', () => {
    it('deve chamar addTransaction com dados corretos', async () => {
      addTransaction.mockResolvedValue({ id: '3' });
      
      renderTransactions();
      
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const amountInput = screen.getByPlaceholderText('Valor');
      const addButton = screen.getByRole('button', { name: 'Adicionar' });

      fireEvent.change(descriptionInput, { target: { value: 'Venda' } });
      fireEvent.change(amountInput, { target: { value: '200' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(addTransaction).toHaveBeenCalledWith({
          description: 'Venda',
          amount: 200,
        });
      });
    });

    it('deve limpar campos após adicionar com sucesso', async () => {
      addTransaction.mockResolvedValue({ id: '3' });
      
      renderTransactions();
      
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const amountInput = screen.getByPlaceholderText('Valor');
      const addButton = screen.getByRole('button', { name: 'Adicionar' });

      fireEvent.change(descriptionInput, { target: { value: 'Venda' } });
      fireEvent.change(amountInput, { target: { value: '200' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(descriptionInput.value).toBe('');
        expect(amountInput.value).toBe('');
      });
    });

    it('deve recarregar transações após adicionar', async () => {
      addTransaction.mockResolvedValue({ id: '3' });
      
      renderTransactions();
      
      const descriptionInput = screen.getByPlaceholderText('Descrição');
      const amountInput = screen.getByPlaceholderText('Valor');
      const addButton = screen.getByRole('button', { name: 'Adicionar' });
      fireEvent.change(descriptionInput, { target: { value: 'Venda' } });
      fireEvent.change(amountInput, { target: { value: '200' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(getTransactions).toHaveBeenCalledTimes(2); // inicial + após adicionar
      });
    });

    it('deve mostrar alerta com campos vazios', async () => {
      const mockAlert = jest.fn();
      global.alert = mockAlert;
      
      renderTransactions();
      
      const addButton = screen.getByRole('button', { name: 'Adicionar' });
      fireEvent.click(addButton);

      expect(mockAlert).toHaveBeenCalledWith('Preencha todos os campos');
      expect(addTransaction).not.toHaveBeenCalled();
    });
  });

  describe('exclusão de transação', () => {
    it('deve chamar deleteTransaction ao confirmar exclusão', async () => {
      const mockTransactions = [
        { id: '1', description: 'Salário', amount: 5000 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      deleteTransaction.mockResolvedValue();
      
      renderTransactions();
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Deletar');
        fireEvent.click(deleteButton);
      });

      expect(global.confirm).toHaveBeenCalledWith('Tem certeza que deseja deletar?');
      expect(deleteTransaction).toHaveBeenCalledWith('1');
    });

    it('não deve deletar se usuário cancelar confirmação', async () => {
      global.confirm.mockReturnValue(false);
      
      const mockTransactions = [
        { id: '1', description: 'Salário', amount: 5000 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      
      renderTransactions();
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Deletar');
        fireEvent.click(deleteButton);
      });

      expect(deleteTransaction).not.toHaveBeenCalled();
    });

    it('deve recarregar transações após deletar', async () => {
      const mockTransactions = [
        { id: '1', description: 'Salário', amount: 5000 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      deleteTransaction.mockResolvedValue();
      
      renderTransactions();
      
      await waitFor(() => {
        const deleteButton = screen.getByText('Deletar');
        fireEvent.click(deleteButton);
      });

      await waitFor(() => {
        expect(getTransactions).toHaveBeenCalledTimes(2); // inicial + após deletar
      });
    });
  });

  describe('formatação de valores', () => {
    it('deve exibir valores positivos sem formatação especial', async () => {
      const mockTransactions = [
        { id: '1', description: 'Salário', amount: 5000 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      
      renderTransactions();
      
      await waitFor(() => {
        expect(screen.getByText('R$ 5000.00')).toBeInTheDocument();
      });
    });

    it('deve exibir valores negativos com formatação', async () => {
      const mockTransactions = [
        { id: '1', description: 'Aluguel', amount: -1500 },
      ];
      getTransactions.mockResolvedValue(mockTransactions);
      
      renderTransactions();
      
      await waitFor(() => {
        expect(screen.getByText('R$ -1500.00')).toBeInTheDocument();
      });
    });
  });

  describe('navegação', () => {
    it('deve ter link correto para dashboard', () => {
      renderTransactions();
      
      const backButton = screen.getByText('Voltar');
      expect(backButton.closest('a')).toHaveAttribute('href', '/dashboard');
    });
  });
});