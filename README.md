# 💰 Finance Control Web

Uma aplicação moderna para controle financeiro pessoal com React, Firebase e Tailwind CSS.

## 🎯 Funcionalidades

✅ **Autenticação com Firebase**
- Cadastro de usuário
- Login/Logout seguro
- Rotas privadas protegidas

✅ **Gerenciamento de Transações**
- Adicionar, visualizar e deletar transações
- Valores em Real (R$)

✅ **Gerenciamento de Parcelações**
- Registro de compras parceladas
- Múltiplos métodos de pagamento (Cartão, Boleto, PIX)
- Cálculo automático do total

✅ **Design Responsivo**
- Interface moderna com Tailwind CSS
- Mobile-friendly
- Tema limpo e intuitivo

## 🚀 Como Começar

### Pré-requisitos
- Node.js 16+ instalado
- Uma conta Firebase (grátis)

### 1. Clonar/Abrir o Projeto

```bash
cd c:/Users/Roberto\ Cesar/Documents/Projetos/finance-control-web
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Firebase

**IMPORTANTE**: Você precisa configurar o Firebase antes de rodar o projeto!

Abra o arquivo: [CONFIGURACAO_FIREBASE.md](./CONFIGURACAO_FIREBASE.md)

Siga todos os passos para:
1. Criar projeto no Firebase Console
2. Obter credenciais
3. Configurar Firestore Database
4. Habilitar Email/Password Authentication

Depois, edite o arquivo `src/services/firebaseConfig.js` e adicione suas credenciais.

### 4. Rodar Localmente

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 5. Testar a Aplicação

1. Clique em "Cadastre-se"
2. Crie uma conta com seu email
3. Explore o Dashboard
4. Adicione transações e parcelações
5. Teste logout

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas principais
│   ├── Login.jsx       # Página de login
│   ├── Register.jsx    # Página de registro
│   ├── Dashboard.jsx   # Dashboard principal
│   ├── Transactions.jsx # Gerenciar transações
│   └── Installments.jsx # Gerenciar parcelações
├── services/           # Serviços (Firebase, Auth)
│   ├── firebaseConfig.js
│   ├── authService.js
│   ├── transactionService.js
│   └── installmentService.js
├── store/              # Estado global (Zustand)
│   └── userStore.js
├── styles/             # Estilos globais
│   └── global.css
├── App.jsx             # Aplicação principal com rotas
└── main.jsx           # Ponto de entrada
```

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework UI
- **Vite** - Build tool (rápido!)
- **Firebase** - Backend/Autenticação
- **React Router** - Roteamento
- **Zustand** - State Management
- **Tailwind CSS** - Estilização
- **Axios** - HTTP Client (opcional, pronto para uso)

## 🔐 Segurança

- Autenticação via Firebase Authentication
- Dados isolados por usuário (userId)
- Firestore Rules configuradas para proteger dados
- Senhas não armazenadas (gerenciadas pelo Firebase)

## 📱 Próximas Features (Sugestões)

- [ ] Editar transações/parcelações
- [ ] Gráficos e relatórios
- [ ] Categorias de gastos
- [ ] Busca e filtros
- [ ] Exportar dados (CSV/PDF)
- [ ] Dark mode
- [ ] Progressive Web App (PWA)


## 📄 Licença

MIT - Sinta-se livre para usar e modificar!

---
