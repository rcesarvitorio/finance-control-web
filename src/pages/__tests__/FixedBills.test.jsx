import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FixedBills from '../FixedBills';

// Mock de services
jest.mock('../../services/fixedBillService', () => ({
  addFixedBill: jest.fn(),
  getFixedBills: jest.fn(),
  deleteFixedBill: jest.fn(),
}));

import { addFixedBill, getFixedBills, deleteFixedBill } from '../../services/fixedBillService';

describe('FixedBills Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // inicial vazio
    getFixedBills.mockResolvedValue([]);
    // mock para evitar uso de window.confirm não implementado no jsdom
    global.confirm = jest.fn(() => true);
    // mock padrão para alert
    global.alert = jest.fn();
  });

  const renderFixedBills = () => {
    return render(<FixedBills />);
  };

  it('Deve renderizar o título e o layout básico', () => {
    renderFixedBills();
    expect(screen.getByText('Contas Fixas')).toBeInTheDocument();
  });

  it('Deve listar contas fixas quando retornadas pela API', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-02-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-02-25', category: 'luz' },
    ];
    getFixedBills.mockResolvedValue(bills);
    renderFixedBills();
    await waitFor(() => {
      expect(screen.getByText('Água')).toBeInTheDocument();
      expect(screen.getByText('Luz')).toBeInTheDocument();
    });
  });

  it('Mostra resumo mensal com o total das contas fixas', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-02-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-02-25', category: 'luz' },
    ];
    getFixedBills.mockResolvedValue(bills);
    renderFixedBills();
    await waitFor(() => {
      expect(screen.getByText('Total em Contas Fixas')).toBeInTheDocument();
      expect(screen.getByText('R$ 100.00')).toBeInTheDocument();
    });
  });

  it('Deve deletar conta fixa ao confirmar', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-02-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);
    deleteFixedBill.mockResolvedValue();
    renderFixedBills();
    await waitFor(() => {
      const delBtn = screen.getByText('Deletar');
      fireEvent.click(delBtn);
    });
    expect(deleteFixedBill).toHaveBeenCalledWith('f1');
    expect(getFixedBills).toHaveBeenCalledTimes(2);
  });

  it('Falha ao adicionar se campos vazios mostra alerta', async () => {
    // atribuir alert mock
    global.alert = jest.fn();
    renderFixedBills();
    const addBtn = screen.getByText('Adicionar Conta Fixa');
    fireEvent.click(addBtn);
    expect(global.alert).toHaveBeenCalledWith('Preencha todos os campos');
  });

  it('Deve adicionar conta fixa com sucesso via formulário', async () => {
    getFixedBills.mockResolvedValue([]);
    // Renderiza
    const { container } = renderFixedBills();

    // Abrir input para nova descrição e adicioná-la
    const addDescBtn = screen.getByText('+');
    fireEvent.click(addDescBtn);

    const newDescInput = screen.getByPlaceholderText('Nova descrição');
    fireEvent.change(newDescInput, { target: { value: 'agua' } });
    const confirmNewDescBtn = screen.getByText('✓');
    fireEvent.click(confirmNewDescBtn);

    // Agora selecione categoria
    const selects = container.querySelectorAll('select');
    const categorySelect = selects[1];
    fireEvent.change(categorySelect, { target: { value: 'agua' } });

    // Preenche Valor Mensal
    const amountInput = container.querySelector('input[placeholder*="Valor"]');
    fireEvent.change(amountInput, { target: { value: '100' } });
    // Preenche data de vencimento (input[type="date"])
    const dateInput = container.querySelector('input[type="date"]');
    fireEvent.change(dateInput, { target: { value: '2026-02-20' } });

    // Botão Adicionar Conta Fixa
    const addBtn = screen.getByText('Adicionar Conta Fixa');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(addFixedBill).toHaveBeenCalledWith(expect.objectContaining({
        description: 'agua',
        amount: 100,
        dueDay: '2026-02-20',
        category: 'agua'
      }));
      expect(getFixedBills).toHaveBeenCalled();
    });
  });
});
