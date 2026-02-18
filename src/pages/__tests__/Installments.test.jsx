import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Installments from '../Installments';

// Mock services
jest.mock('../../services/installmentService', () => ({
  addInstallment: jest.fn(),
  getInstallments: jest.fn(),
  deleteInstallment: jest.fn(),
}));

import { addInstallment, getInstallments, deleteInstallment } from '../../services/installmentService';

describe('Installments Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default: user confirms deletions
    global.confirm = jest.fn(() => true);
    // alert for required fields
    global.alert = jest.fn();
  });

  const renderInstallments = () => {
    return render(
      <BrowserRouter>
        <Installments />
      </BrowserRouter>
    );
  };

  it('deve renderizar o título e o link de voltar', async () => {
    getInstallments.mockResolvedValue([]);
    renderInstallments();
    await waitFor(() => {
      expect(screen.getByText('Parcelações')).toBeInTheDocument();
    });
    const backLink = screen.getByText('Voltar');
    expect(backLink.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('deve mostrar mensagem quando não há parcelas', async () => {
    getInstallments.mockResolvedValue([]);
    renderInstallments();
    await waitFor(() => {
      expect(screen.getByText('Nenhuma parcelação registrada')).toBeInTheDocument();
    });
  });

  it('deve carregar parcelas e renderizar itens', async () => {
    const data = [
      { id: 'p1', description: 'Compra A', purchaseDate: '2026-02-01', installmentAmount: 50, totalInstallments: 2, paymentMethod: 'card' },
      { id: 'p2', description: 'Compra B', purchaseDate: '2026-01-15', installmentAmount: 30, totalInstallments: 3, paymentMethod: 'boleto' },
    ];
    getInstallments.mockResolvedValue(data);
    renderInstallments();
    await waitFor(() => {
      expect(screen.getByText('Compra A')).toBeInTheDocument();
      expect(screen.getByText('Compra B')).toBeInTheDocument();
    });
  });

  it('deve adicionar parcelação com dados corretos', async () => {
    getInstallments.mockResolvedValue([]);
    addInstallment.mockResolvedValue({ id: 'p3' });
    renderInstallments();

    // preencher campos
    const descInput = screen.getByPlaceholderText('Descrição');
    const amountInput = screen.getByPlaceholderText('Valor da Parcela');
    const totalInput = screen.getByPlaceholderText('Quantidade de Parcelas');
    // data de compra final será a data inserida abaixo (2026-02-20)
    const commitDate = '2026-02-20';
    fireEvent.change(descInput, { target: { value: 'Nova Parcela' } });
    fireEvent.change(amountInput, { target: { value: '120.50' } });
    fireEvent.change(totalInput, { target: { value: '4' } });
    // Data de compra
    const dateInput = screen.getByDisplayValue((new Date()).toISOString().split('T')[0]);
    fireEvent.change(dateInput, { target: { value: '2026-02-20' } });
    // Select de pagamento (Cartão)
    const paymentSelect = screen.getByRole('combobox');
    fireEvent.change(paymentSelect, { target: { value: 'card' } });
    // Botão Adicionar
    const addBtn = screen.getByText('Adicionar');
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(addInstallment).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Nova Parcela',
        installmentAmount: 120.5,
        totalInstallments: 4,
        paymentMethod: 'card',
        purchaseDate: commitDate,
      }));
    });

    // Campos devem ser reset
    expect(descInput.value).toBe('');
    expect(amountInput.value).toBe('');
    expect(totalInput.value).toBe('');
  });

  it('deve deletar parcelação ao confirmar', async () => {
    const data = [{ id: 'p1', description: 'Compra A', purchaseDate: '2026-02-01', installmentAmount: 50, totalInstallments: 2, paymentMethod: 'card' }];
    getInstallments.mockResolvedValue(data);
    deleteInstallment.mockResolvedValue();
    renderInstallments();
    await waitFor(() => {
      const delBtn = screen.getByText('Deletar');
      fireEvent.click(delBtn);
    });
    expect(deleteInstallment).toHaveBeenCalledWith('p1');
    expect(getInstallments).toHaveBeenCalledTimes(2);
  });
});
