import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checklist from '../Checklist';

// Mocks
jest.mock('../../services/authService', () => ({
  logout: jest.fn(),
}));

jest.mock('../../store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('../../services/fixedBillService', () => ({
  getFixedBills: jest.fn(),
}));

jest.mock('../../services/checklistService', () => ({
  saveChecklistItems: jest.fn(),
  getAllChecklistItems: jest.fn(),
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

import { getFixedBills } from '../../services/fixedBillService';
import { saveChecklistItems, getAllChecklistItems } from '../../services/checklistService';
import { useNavigate } from 'react-router-dom';

describe('Checklist Page', () => {
  let mockNavigate;
  let clearUserMock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    clearUserMock = jest.fn();

    const { useUserStore } = require('../../store/userStore');
    useUserStore.mockReturnValue({ user: { email: 'test@example.com' }, clearUser: clearUserMock });

    getFixedBills.mockResolvedValue([]);
    getAllChecklistItems.mockResolvedValue({});
    saveChecklistItems.mockResolvedValue();
  });

  const renderChecklist = () => {
    return render(
      <BrowserRouter>
        <Checklist />
      </BrowserRouter>
    );
  };

  it('Deve renderizar título e layout básico', async () => {
    renderChecklist();
    await waitFor(() => {
      expect(screen.getByText('Checklist de Pagamentos')).toBeInTheDocument();
    });
  });

  it('Deve renderizar abas de meses', async () => {
    renderChecklist();
    await waitFor(() => {
      // Deve mostrar pelo menos o mês atual
      const monthButtons = screen.getAllByRole('button');
      expect(monthButtons.length).toBeGreaterThan(0);
    });
  });

  it('Deve adicionar item com descrição e valor', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Conta de Teste' } });
    fireEvent.change(valueInput, { target: { value: '50.75' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      // O item deve aparecer com o formato "Descrição - R$ 50.75"
      expect(screen.getByText('Conta de Teste - R$ 50.75')).toBeInTheDocument();
    });
  });

  it('Não deve adicionar item sem descrição', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Valor')).toBeInTheDocument();
    });

    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(valueInput, { target: { value: '50' } });
    fireEvent.click(addBtn);

    // Item não deve ser adicionado sem descrição
    expect(screen.queryByText('- R$ 50.00')).not.toBeInTheDocument();
  });

  it('Não deve adicionar item sem valor', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Conta de Teste' } });
    fireEvent.click(addBtn);

    // Item não deve ser adicionado sem valor
    expect(screen.queryByText('Conta de Teste - R$ 0.00')).not.toBeInTheDocument();
  });

  it('Deve limpar campos após adicionar item', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Teste' } });
    fireEvent.change(valueInput, { target: { value: '100' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(descInput.value).toBe('');
      expect(valueInput.value).toBe('');
    });
  });

  it('Deve formatar valor com duas casas decimais', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Teste' } });
    fireEvent.change(valueInput, { target: { value: '10' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Teste - R$ 10.00')).toBeInTheDocument();
    });
  });

  it('Deve adicionar item ao pressionar Enter', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');

    fireEvent.change(descInput, { target: { value: 'Teste Enter' } });
    fireEvent.change(valueInput, { target: { value: '75.50' } });
    fireEvent.keyPress(valueInput, { key: 'Enter', code: 'Enter', charCode: 13 });

    await waitFor(() => {
      expect(screen.getByText('Teste Enter - R$ 75.50')).toBeInTheDocument();
    });
  });

  it('Deve marcar e desmarcar item como completo', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Item Teste' } });
    fireEvent.change(valueInput, { target: { value: '45' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      const lastCheckbox = checkboxes[checkboxes.length - 1];
      fireEvent.click(lastCheckbox);
    });

    // O texto deve ficar riscado
    const itemText = screen.getByText('Item Teste - R$ 45.00');
    expect(itemText).toHaveClass('line-through');
  });

  it('Deve salvar checklist com sucesso', async () => {
    renderChecklist();

    await waitFor(() => {
      const saveBtn = screen.getByText('💾 Salvar Checklist');
      expect(saveBtn).toBeInTheDocument();
    });

    const saveBtn = screen.getByText('💾 Salvar Checklist');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(saveChecklistItems).toHaveBeenCalled();
    });
  });

  it('Deve mostrar mensagem de sucesso ao salvar', async () => {
    renderChecklist();

    await waitFor(() => {
      const saveBtn = screen.getByText('💾 Salvar Checklist');
      fireEvent.click(saveBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Checklist salva com sucesso!')).toBeInTheDocument();
    });
  });

  it('Deve deletar item adicional', async () => {
    renderChecklist();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Descrição do item...')).toBeInTheDocument();
    });

    const descInput = screen.getByPlaceholderText('Descrição do item...');
    const valueInput = screen.getByPlaceholderText('Valor');
    const addBtn = screen.getByText('+');

    fireEvent.change(descInput, { target: { value: 'Item para deletar' } });
    fireEvent.change(valueInput, { target: { value: '20' } });
    fireEvent.click(addBtn);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('✕');
      const lastDeleteBtn = deleteButtons[deleteButtons.length - 1];
      fireEvent.click(lastDeleteBtn);
    });

    // Item não deve mais aparecer
    expect(screen.queryByText('Item para deletar - R$ 20.00')).not.toBeInTheDocument();
  });

  it('Deve carregar contas fixas ao montar', async () => {
    const bills = [
      { id: 'bill-1', description: 'Água', amount: 60, dueDay: new Date().toISOString().split('T')[0] },
    ];
    getFixedBills.mockResolvedValue(bills);

    renderChecklist();

    await waitFor(() => {
      expect(getFixedBills).toHaveBeenCalled();
    });
  });
});
