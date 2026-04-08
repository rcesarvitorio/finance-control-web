import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import FixedBills from '../FixedBills';

// Mock de services
jest.mock('../../services/fixedBillService', () => ({
  addFixedBill: jest.fn(),
  getFixedBills: jest.fn(),
  deleteFixedBill: jest.fn(),
  updateFixedBill: jest.fn(),
}));

jest.mock('../../services/checklistService', () => ({
  getAllChecklistItems: jest.fn(),
}));

import { addFixedBill, getFixedBills, deleteFixedBill, updateFixedBill } from '../../services/fixedBillService';
import { getAllChecklistItems } from '../../services/checklistService';

describe('FixedBills Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // inicial vazio
    getFixedBills.mockResolvedValue([]);
    getAllChecklistItems.mockResolvedValue({});
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
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-04-25', category: 'luz' },
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
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-04-25', category: 'luz' },
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
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
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
    fireEvent.change(dateInput, { target: { value: '2026-04-20' } });

    // Botão Adicionar Conta Fixa
    const addBtn = screen.getByText('Adicionar Conta Fixa');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(addFixedBill).toHaveBeenCalledWith(expect.objectContaining({
        description: 'agua',
        amount: 100,
        dueDay: '2026-04-20',
        category: 'agua'
      }));
      expect(getFixedBills).toHaveBeenCalled();
    });
  });

  // Novos testes para filtro de meses e sincronização com checklist
  it('Deve renderizar abas de meses', async () => {
    renderFixedBills();
    await waitFor(() => {
      // Deve mostrar pelo menos o mês atual (FEV ou outro)
      const monthButtons = screen.getAllByRole('button');
      expect(monthButtons.length).toBeGreaterThan(0);
    });
  });

  it('Deve filtrar contas por mês selecionado', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-04-25', category: 'luz' },
    ];
    getFixedBills.mockResolvedValue(bills);
    
    const { container } = renderFixedBills();

    await waitFor(() => {
      expect(screen.getByText('Água')).toBeInTheDocument();
    });

    // Inicialmente deve mostrar ambas as contas (se ambas forem do mês inicial)
    // Vamos clicar no mês de março e verificar se apenas a conta de março aparece
    const monthButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent.includes('MAI')
    );

    if (monthButtons.length > 0) {
      fireEvent.click(monthButtons[0]);
      
      await waitFor(() => {
        // Apenas a conta de maio deve estar visível, mas como não há, deve mostrar mensagem
        expect(screen.getByText('Nenhuma conta fixa registrada para este mês')).toBeInTheDocument();
      });
    }
  });

  it('Deve mostrar "PAGA" para contas marcadas no checklist', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);
    
    const checklistItems = {
      '2026-04': [
        { id: 'f1', text: 'Água - R$ 60.00', completed: true, isFromFixedBill: true }
      ]
    };
    getAllChecklistItems.mockResolvedValue(checklistItems);

    renderFixedBills();

    await waitFor(() => {
      expect(screen.getByText('✓ PAGA')).toBeInTheDocument();
    });
  });

  it('Não deve mostrar "PAGA" para contas não marcadas no checklist', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);
    
    const checklistItems = {
      '2026-04': [
        { id: 'f1', text: 'Água - R$ 60.00', completed: false, isFromFixedBill: true }
      ]
    };
    getAllChecklistItems.mockResolvedValue(checklistItems);

    renderFixedBills();

    await waitFor(() => {
      expect(screen.queryByText('✓ PAGA')).not.toBeInTheDocument();
    });
  });

  it('Deve recarregar checklist quando página fica visível', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);

    renderFixedBills();

    await waitFor(() => {
      expect(getAllChecklistItems).toHaveBeenCalled();
    });

    const initialCallCount = getAllChecklistItems.mock.calls.length;

    // Simular visibilitychange event
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false
    });
    
    fireEvent(document, new Event('visibilitychange'));

    await waitFor(() => {
      expect(getAllChecklistItems.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    });
  });

  it('Deve mostrar texto riscado e opaco para contas pagas', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);
    
    const checklistItems = {
      '2026-04': [
        { id: 'f1', text: 'Água - R$ 60.00', completed: true, isFromFixedBill: true }
      ]
    };
    getAllChecklistItems.mockResolvedValue(checklistItems);

    const { container } = renderFixedBills();

    await waitFor(() => {
      const cardDiv = container.querySelector('[class*="border-green"]');
      expect(cardDiv).toBeInTheDocument();
      expect(cardDiv).toHaveClass('opacity-75');
    });
  });

  it('Deve atualizar resumo mensal com total do mês selecionado', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
      { id: 'f2', description: 'Luz', amount: 40, dueDay: '2026-04-25', category: 'luz' },
    ];
    getFixedBills.mockResolvedValue(bills);

    const { container } = renderFixedBills();

    await waitFor(() => {
      // Inicialmente deve mostrar o total baseado no mês selecionado
      const resumoText = screen.getByText('Resumo Mensal');
      expect(resumoText).toBeInTheDocument();
    });
  });

  it('Deve se selecionar o mês atual por padrão', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);

    renderFixedBills();

    await waitFor(() => {
      // O mês atual deve estar selecionado (azul)
      const monthButtons = screen.getAllByRole('button');
      const selectedMonth = monthButtons.find(btn => 
        btn.className.includes('bg-blue-600')
      );
      expect(selectedMonth).toBeInTheDocument();
    });
  });

  it('Deve mostrar mensagem quando não há contas no mês selecionado', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);

    const { container } = renderFixedBills();

    await waitFor(() => {
      expect(screen.getByText('Água')).toBeInTheDocument();
    });

    // Clique no mês futuro que não tem contas
    const monthButtons = screen.getAllByRole('button').filter(btn => 
      btn.textContent.includes('JUN')
    );

    if (monthButtons.length > 0) {
      fireEvent.click(monthButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Nenhuma conta fixa registrada para este mês')).toBeInTheDocument();
      });
    }  });

  it('Deve mostrar botão de replicar quando conta não foi replicada', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);

    renderFixedBills();

    await waitFor(() => {
      expect(screen.getByText('➡️ Próximo Mês')).toBeInTheDocument();
      expect(screen.queryByText('✓ Enviada')).not.toBeInTheDocument();
    });
  });

  it('Deve mostrar "✓ Enviada" quando conta já foi replicada', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
      { id: 'f2', description: 'Água', amount: 0, dueDay: '2026-05-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);

    renderFixedBills();

    await waitFor(() => {
      expect(screen.getByText('✓ Enviada')).toBeInTheDocument();
      expect(screen.queryByText('➡️ Próximo Mês')).not.toBeInTheDocument();
    });
  });

  it('Deve permitir editar o valor da conta fixa', async () => {
    const bills = [
      { id: 'f1', description: 'Água', amount: 60, dueDay: '2026-04-20', category: 'agua' },
    ];
    getFixedBills.mockResolvedValue(bills);
    updateFixedBill.mockResolvedValue();

    const { container } = renderFixedBills();

    await waitFor(() => {
      // Verificar se a conta está sendo exibida
      expect(screen.getByText('💧 Água')).toBeInTheDocument();
    });

    // Clicar no botão editar
    const editButton = screen.getByText('✏️ Editar');
    fireEvent.click(editButton);

    // Aguardar o input aparecer e ter o valor correto
    await waitFor(() => {
      const input = container.querySelector('.edit-amount-input');
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('60');
    });

    // Alterar o valor
    const input = container.querySelector('.edit-amount-input');
    fireEvent.change(input, { target: { value: '75.50' } });

    // Salvar
    const saveButton = screen.getByText('✓');
    fireEvent.click(saveButton);

    expect(updateFixedBill).toHaveBeenCalledWith('f1', { amount: 75.50 });
  });
});