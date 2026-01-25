# 📊 Arquitetura do Projeto

## 🏗️ Estrutura Geral

```
┌─────────────────────────────────────────────────────────────┐
│                     FINANCE CONTROL WEB                     │
│                   React + Vite + Firebase                   │
└─────────────────────────────────────────────────────────────┘
                              ▼
                    ┌─────────────────────┐
                    │   React Router      │
                    │  (SPA Navigation)   │
                    └─────────────────────┘
                              ▼
        ┌─────────────────────┬─────────────────────┐
        ▼                     ▼                     ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │  LOGIN   │         │ REGISTER │         │DASHBOARD │
   │  Page    │         │  Page    │         │  Page    │
   └──────────┘         └──────────┘         └──────────┘
        ▼                     ▼                     ▼
   ┌────────────────────┬─────────────────────────┬────────────┐
   │                    ▼                         ▼            ▼
   │            ┌─────────────────┐      ┌──────────────────┐
   │            │  TRANSACTIONS   │      │  INSTALLMENTS    │
   │            │      Page       │      │      Page        │
   │            └─────────────────┘      └──────────────────┘
   │
   └────────────────────────────────────────────────────────────┐
                                                                 ▼
                                            ┌──────────────────────────────┐
                                            │  Private Routes Protection    │
                                            │ (Redireciona para /login)     │
                                            └──────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

```
┌──────────────────────┐
│   User Interface     │
│   (React Pages)      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│  Zustand Store (userStore)   │
│  - user state                │
│  - setUser()                 │
│  - clearUser()               │
└──────────┬────────────────────┘
           │
           ├─────────────────────────────────┐
           │                                 │
           ▼                                 ▼
┌──────────────────────┐      ┌────────────────────────────┐
│   Auth Service       │      │   Transaction/Installment  │
│ - login()            │      │        Services            │
│ - register()         │      │ - add()                    │
│ - logout()           │      │ - get()                    │
│ - getCurrentUser()   │      │ - delete()                 │
└──────────┬───────────┘      └────────────┬───────────────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
        ┌──────────────────────────────┐
        │   Firebase (Backend)         │
        │ ┌──────────────────────────┐ │
        │ │  Authentication          │ │
        │ │  (Email/Password)        │ │
        │ └──────────────────────────┘ │
        │ ┌──────────────────────────┐ │
        │ │  Firestore Database      │ │
        │ │ - transactions (doc)     │ │
        │ │ - installments (doc)     │ │
        │ └──────────────────────────┘ │
        └──────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
finance-control-web/
│
├── src/
│   ├── pages/                    # Páginas principais
│   │   ├── Login.jsx             # Página de login
│   │   ├── Register.jsx          # Página de registro
│   │   ├── Dashboard.jsx         # Dashboard principal
│   │   ├── Transactions.jsx      # Gerenciar transações
│   │   └── Installments.jsx      # Gerenciar parcelações
│   │
│   ├── services/                 # Serviços (lógica de negócio)
│   │   ├── firebaseConfig.js     # Configuração Firebase
│   │   ├── authService.js        # Serviços de autenticação
│   │   ├── transactionService.js # CRUD de transações
│   │   └── installmentService.js # CRUD de parcelações
│   │
│   ├── store/                    # Estado global
│   │   └── userStore.js          # Store Zustand (user state)
│   │
│   ├── styles/                   # Estilos globais
│   │   └── global.css            # Tailwind imports
│   │
│   ├── components/               # Componentes reutilizáveis
│   │   └── (em branco, pronto para expansão)
│   │
│   ├── App.jsx                   # App principal com rotas
│   ├── main.jsx                  # Ponto de entrada React
│   └── index.css                 # CSS global
│
├── public/                       # Arquivos estáticos
│
├── node_modules/                 # Dependências npm
│
├── tailwind.config.js            # Configuração Tailwind CSS
├── postcss.config.js             # Configuração PostCSS
├── vite.config.js                # Configuração Vite
├── package.json                  # Dependências e scripts
├── .gitignore                    # Git ignore
└── .env.example                  # Variáveis de ambiente (exemplo)


---

## 🔐 Fluxo de Autenticação

```
┌─────────────────┐
│  Novo Usuário?  │
└────────┬────────┘
         │
    Sim  │  Não
    │    │
    ▼    ▼
┌──────────────┐   ┌──────────────┐
│  Register    │   │  Login       │
│  Page        │   │  Page        │
└──────┬───────┘   └──────┬───────┘
       │                  │
       ▼                  ▼
┌─────────────────────────────────┐
│  Firebase Authentication        │
│  - Valida email/senha           │
│  - Cria user (se register)      │
│  - Retorna user object          │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Zustand userStore              │
│  - setUser(currentUser)         │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Private Route Check            │
│  - user ? Dashboard : Login     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  Dashboard / Páginas Protegidas │
│  - Acesso a transações          │
│  - Acesso a parcelações         │
└─────────────────────────────────┘
```

---

## 🗄️ Estrutura do Firebase

### Firestore Collections

```
┌─────────────────────────────────┐
│      Firestore Database         │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────────────┐    ┌────────────────┐
│ transactions   │    │ installments    │
│ (collection)   │    │ (collection)    │
├────────────────┤    ├────────────────┤
│ doc: {         │    │ doc: {         │
│   id: "abc1",  │    │   id: "xyz1",  │
│   userId:      │    │   userId:      │
│   "user123",   │    │   "user123",   │
│   description: │    │   description: │
│   "Pizza",     │    │   "Notebook",  │
│   amount:      │    │   installment  │
│   85.50,       │    │   Amount:      │
│   createdAt:   │    │   200.00,      │
│   Timestamp()  │    │   totalInstal- │
│ }              │    │   lments: 12,  │
│                │    │   payment      │
│ doc: { ... }   │    │   Method:      │
│                │    │   "card"       │
└────────────────┘    └────────────────┘
```

### Authentication

```
┌──────────────────────────────┐
│  Firebase Authentication     │
├──────────────────────────────┤
│ Email/Password Method        │
├──────────────────────────────┤
│ User Document:               │
│ {                            │
│   uid: "abc123def456",       │
│   email: "user@example.com", │
│   emailVerified: true/false, │
│   metadata: { ... }          │
│ }                            │
└──────────────────────────────┘
```

---

## 🔒 Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Transactions: apenas o proprietário pode ler/editar
    match /transactions/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Installments: apenas o proprietário pode ler/editar
    match /installments/{document=**} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 🎯 Fluxo de uma Transação (Exemplo)

```
1. Usuário entra na página Transactions
                │
                ▼
2. useEffect carrega getTransactions()
                │
                ▼
3. getTransactions() busca no Firebase
   (filtra por userId do usuário autenticado)
                │
                ▼
4. Dados voltam e são salvos em estado (transactions)
                │
                ▼
5. Componente renderiza a lista de transações
                │
                ▼
6. Usuário preenche formulário e clica "Adicionar"
                │
                ▼
7. handleAdd() chama addTransaction()
                │
                ▼
8. addTransaction() salva no Firebase com userId
                │
                ▼
9. Sucesso! loadTransactions() é chamado novamente
                │
                ▼
10. Lista é atualizada com a nova transação
```

---

## 🚀 Tecnologias e Suas Funções

| Tecnologia | Função | Por que? |
|---|---|---|
| **React** | UI Framework | Componentes reutilizáveis, estado reativo |
| **Vite** | Build Tool | Muito mais rápido que Webpack |
| **Firebase** | Backend | Autenticação + Database + Hosting |
| **React Router** | Navigation | SPAs (Single Page Apps) |
| **Zustand** | State Management | Simples e leve (alternativa ao Redux) |
| **Tailwind CSS** | Estilização | Utility-first, design system pronto |
| **Axios** | HTTP Client | Requisições (pronto se precisar de API externa) |

---

## 📈 Escalabilidade Futura

```
┌─────────────────────────────────┐
│   Funcionalidades Futuras       │
├─────────────────────────────────┤
│ ✓ Editar transações/parcelas    │
│ ✓ Gráficos (Chart.js)           │
│ ✓ Categorias de gastos          │
│ ✓ Relatórios (PDF/CSV)          │
│ ✓ Busca e filtros               │
│ ✓ Dark mode                     │
│ ✓ Progressive Web App (PWA)     │
│ ✓ Notificações de parcelas      │
│ ✓ Múltiplas contas/colaboração  │
└─────────────────────────────────┘
                │
                ▼
        ┌──────────────────┐
        │  Refactor Code   │
        │  - Componentes   │
        │  - Hooks custom  │
        │  - Utils helpers │
        └──────────────────┘
```

---

**Este diagrama mostra como todos os componentes trabalham juntos! 🎯**
