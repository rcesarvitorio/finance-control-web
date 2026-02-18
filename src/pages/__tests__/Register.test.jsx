import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../Register';

// Mock dos serviços
jest.mock('../../services/authService', () => ({
  register: jest.fn(),
}));

jest.mock('../../store/userStore', () => ({
  useUserStore: jest.fn(),
}));

// Mock do React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

import { register } from '../../services/authService';
import { useUserStore } from '../../store/userStore';
import { useNavigate } from 'react-router-dom';

describe('Register Component', () => {
  let mockSetUser;
  let mockNavigate;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSetUser = jest.fn();
    mockNavigate = jest.fn();
    
    useUserStore.mockReturnValue({ setUser: mockSetUser });
    useNavigate.mockReturnValue(mockNavigate);
    
    register.mockResolvedValue({ user: { uid: 'user123', email: 'test@example.com' } });
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  describe('renderização', () => {
    it('deve renderizar o título "Criar Conta"', () => {
      renderRegister();
      
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    });

    it('deve renderizar campos de email e senha', () => {
      renderRegister();
      
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    });

    it('deve renderizar botão "Cadastrar"', () => {
      renderRegister();
      
      expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument();
    });

    it('deve renderizar link para login', () => {
      renderRegister();
      
      expect(screen.getByText('Já tem conta?')).toBeInTheDocument();
      expect(screen.getByText('Faça login')).toBeInTheDocument();
    });

    it('não deve mostrar mensagem de erro inicialmente', () => {
      renderRegister();
      
      expect(screen.queryByText(/Email ou senha incorretos/)).not.toBeInTheDocument();
    });
  });

  describe('interação com formulário', () => {
    it('deve atualizar campo de email ao digitar', () => {
      renderRegister();
      
      const emailInput = screen.getByPlaceholderText('Email');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    it('deve atualizar campo de senha ao digitar', () => {
      renderRegister();
      
      const passwordInput = screen.getByPlaceholderText('Senha');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });
  });

  describe('submissão do formulário', () => {
    it('deve chamar register com email e senha corretos', async () => {
      renderRegister();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(register).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('deve mostrar mensagem de erro em caso de falha no registro', async () => {
      const errorMessage = 'Email já está em uso';
      register.mockRejectedValue(new Error(errorMessage));
      
      renderRegister();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      const submitButton = screen.getByRole('button', { name: 'Cadastrar' });

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('validação do formulário', () => {
    it('deve ter campos com atributo required', () => {
      renderRegister();
      
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Senha');
      
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });

  describe('navegação', () => {
    it('deve ter link correto para página de login', () => {
      renderRegister();
      
      const loginLink = screen.getByText('Faça login');
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('estilo do botão', () => {
    it('deve ter botão com estilo verde', () => {
      renderRegister();
      
      const submitButton = screen.getByRole('button', { name: 'Cadastrar' });
      expect(submitButton).toHaveClass('bg-green-500');
    });
  });
});