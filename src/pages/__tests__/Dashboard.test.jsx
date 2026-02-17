import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import Dashboard from '../Dashboard';

// Mocks
jest.mock('../../services/authService', () => ({
  logout: jest.fn(),
}));

let clearUserMock;
jest.mock('../../store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('../../services/installmentService', () => ({
  getInstallments: jest.fn(),
}));
jest.mock('../../services/fixedBillService', () => ({
  getFixedBills: jest.fn(),
}));
jest.mock('../../services/investmentService', () => ({
  getInvestments: jest.fn(),
}));
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

import { getInstallments } from '../../services/installmentService';
import { getFixedBills } from '../../services/fixedBillService';
import { getInvestments } from '../../services/investmentService';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';

describe('Dashboard Page', () => {
  let mockNavigate;
  let mockClearUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
    clearUserMock = jest.fn();
    // wire the useUserStore mock to return our test values
    const { useUserStore } = require('../../store/userStore');
    useUserStore.mockReturnValue({ user: { email: 'test@example.com' }, clearUser: clearUserMock });
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  it('deve renderizar título e navegação básica', async () => {
    getInstallments.mockResolvedValue([]);
    getFixedBills.mockResolvedValue([]);
    getInvestments.mockResolvedValue([]);

    renderDashboard();

    // título presente
    expect(screen.getByText('Finance Control')).toBeInTheDocument();
    // cards de navegação devem estar presentes
    expect(screen.getByText(/Investimentos/)).toBeInTheDocument();
    expect(screen.getByText(/Fixas/)).toBeInTheDocument();
    expect(screen.getByText(/Parcelamentos/)).toBeInTheDocument();
  });

  it('deve chamar os serviços ao montar', async () => {
    getInstallments.mockResolvedValue([]);
    getFixedBills.mockResolvedValue([]);
    getInvestments.mockResolvedValue([]);

    renderDashboard();
    await waitFor(() => {
      expect(getInstallments).toHaveBeenCalled();
      expect(getFixedBills).toHaveBeenCalled();
      expect(getInvestments).toHaveBeenCalled();
    });
  });

  it('deve logout ao clicar em Logout', async () => {
    logout.mockResolvedValue();
    renderDashboard();
    const logoutBtn = screen.getByText('Logout');
    fireEvent.click(logoutBtn);
    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(clearUserMock).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deve renderizar totais com dados simulados (teste de janela de 12 meses)', async () => {
    // fornecendo dados simulados para exercícios de cálculo de totais
    const installments = [
      { id: 'it1', description: 'Compra X', purchaseDate: '2026-01-15', installmentAmount: 100, totalInstallments: 2, paymentMethod: 'card' },
    ];
    const fixedBills = [ { id: 'fb1', description: 'Conta', amount: 50, dueDay: '2026-02-20', category: 'agua' } ];
    const investments = [ { id: 'inv1', description: 'Invest', dueDay: '2026-02-25', amount: 200, category: 'acao' } ];
    getInstallments.mockResolvedValue(installments);
    getFixedBills.mockResolvedValue(fixedBills);
    getInvestments.mockResolvedValue(investments);

    renderDashboard();
    await waitFor(() => {
      // deve renderizar pelo menos uma label de mês com /2026
      expect(screen.queryByText(/\/2026/)).toBeInTheDocument();
    });
  });
});
