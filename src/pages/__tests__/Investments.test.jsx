import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Investments from '../Investments';

// Mock service
jest.mock('../../services/investmentService', () => ({
  addInvestment: jest.fn(),
  getInvestments: jest.fn(),
  deleteInvestment: jest.fn(),
}));

import { getInvestments, addInvestment, deleteInvestment } from '../../services/investmentService';

describe('Investments Page (Testids simplified)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
    global.confirm = jest.fn(() => true);
  });

  const renderInvestments = (initial = []) => {
    getInvestments.mockResolvedValue(initial);
    return render(
      <BrowserRouter>
        <Investments />
      </BrowserRouter>
    );
  };

  it('renderiza container e item da API', async () => {
    const data = [{ id: 'i1', description: 'Acoes', dueDay: '2026-03-10', amount: 100, category: 'acao' }];
    renderInvestments(data);
    await waitFor(() => {
      expect(screen.getByTestId('investments-container')).toBeInTheDocument();
      expect(screen.getByTestId('invest-row-i1')).toBeInTheDocument();
      expect(screen.getByTestId('invest-desc-i1')).toBeInTheDocument();
    });
  });

  it('adiciona investimentos com descrição existente', async () => {
    const data = [{ id: 'i1', description: 'Acoes', dueDay: '2026-03-10', amount: 100, category: 'acao' }];
    renderInvestments(data);
    // esperar opção de descrição aparecer após loadInvestments
    await waitFor(() => screen.getByText('Acoes'));
    const selectDesc = screen.getByTestId('invest-desc-select');
    // selecionar a descrição disponível
    selectDesc.value = 'Acoes';
    fireEvent.change(selectDesc, { target: { value: 'Acoes' } });
    // aguardar o estado refletir na DOM antes de clicar
    await waitFor(() => expect(screen.getByTestId('invest-desc-select').value).toBe('Acoes'));
    const amountInput = screen.getByTestId('invest-amount-input');
    fireEvent.change(amountInput, { target: { value: '150' } });
    const dateInput = screen.getByTestId('invest-date-input');
    fireEvent.change(dateInput, { target: { value: new Date().toISOString().slice(0,10) } });
    const categoryInput = screen.getByTestId('invest-category-input');
    fireEvent.change(categoryInput, { target: { value: 'acao' } });
    const addBtn = screen.getByTestId('investments-add-btn');
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(addInvestment).toHaveBeenCalledWith(expect.objectContaining({ description: 'Acoes', amount: 150 }));
    });
  });

  it('validação de valor inválido', async () => {
    // incluir uma descrição existente para que possamos selecioná-la
    const data = [{ id: 'i1', description: 'Acoes', dueDay: '2026-03-10', amount: 50, category: 'acao' }];
    renderInvestments(data);
    // esperar opção aparecer
    await waitFor(() => screen.getByText('Acoes'));
    const selectDesc = screen.getByTestId('invest-desc-select');
    selectDesc.value = 'Acoes';
    fireEvent.change(selectDesc, { target: { value: 'Acoes' } });
    // aguardando o select refletir o valor
    await waitFor(() => expect(screen.getByTestId('invest-desc-select').value).toBe('Acoes'));
    const amountInput = screen.getByTestId('invest-amount-input');
    fireEvent.change(amountInput, { target: { value: 'abc' } });
    const addBtn = screen.getByTestId('investments-add-btn');
    fireEvent.click(addBtn);
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Por favor, insira um valor válido');
    });
  });
});
