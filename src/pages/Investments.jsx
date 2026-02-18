import { useState, useEffect } from 'react';
import { 
  addInvestment, 
  getInvestments, 
  deleteInvestment 
} from '../services/investmentService';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('acao');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showNewDescriptionInput, setShowNewDescriptionInput] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    const data = await getInvestments();
    const sorted = data.sort((a, b) => {
      return new Date(a.dueDay) - new Date(b.dueDay);
    });
    setInvestments(sorted);
  };

  const getUniqueDescriptions = () => {
    const existingDescriptions = [...new Set(investments.map(inv => inv.description))];
    const allDescriptions = [...new Set([...existingDescriptions, description].filter(d => d))];
    return allDescriptions.sort();
  };

  const handleAddNewDescription = () => {
    if (newDescription.trim()) {
      setDescription(newDescription.trim());
      setNewDescription('');
      setShowNewDescriptionInput(false);
    }
  };

  const handleAdd = async () => {
    if (!description || !amount || !dueDay) {
      alert('Preencha todos os campos');
      return;
    }

    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    await addInvestment({
      description,
      amount: numericAmount,
      dueDay,
      category,
    });

    setDescription('');
    setAmount('');
    setDueDay(new Date().toISOString().split('T')[0]);
    setCategory('acao');
    setShowNewDescriptionInput(false);
    setNewDescription('');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    loadInvestments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      await deleteInvestment(id);
      loadInvestments();
    }
  };

  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'acao': return '📈';
      case 'fundo': return '💼';
      case 'tesouro': return '🏛️';
      case 'cripto': return '₿';
      case 'cdb': return '🏦';
      case 'lci': return '🏠';
      case 'lca': return '🌾';
      case 'previdencia': return '👵';
      case 'caixinha': return '🐷';
      case 'outros': return '📄';
      default: return '💰';
    }
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'acao': return 'Ações';
      case 'fundo': return 'Fundos Imobiliários';
      case 'tesouro': return 'Tesouro Direto';
      case 'cripto': return 'Criptomoedas';
      case 'cdb': return 'CDB';
      case 'lci': return 'LCI';
      case 'lca': return 'LCA';
      case 'previdencia': return 'Previdência Privada';
      case 'caixinha': return 'Caixinha';
      case 'outros': return 'Outros';
      default: return category;
    }
  };

  const isOverdue = (dueDay) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dueDay);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6" data-testid="investments-container">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <span className="text-2xl">✓</span>
          <span className="font-bold">Investimento adicionado com sucesso!</span>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-3xl font-bold">Investimentos</h1>
          <a href="/dashboard" className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base">
            Voltar
          </a>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
            <div className="flex gap-2 mb-4">
        <select
          data-testid="invest-desc-select"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
          }}
          className="flex-1 p-2 border rounded text-sm sm:text-base"
        >
              <option value="">Selecione ou adicione uma descrição</option>
            {getUniqueDescriptions().map((desc) => (
              <option key={desc} value={desc}>{desc}</option>
            ))}
          </select>
          <button
            onClick={() => setShowNewDescriptionInput(true)}
            className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base"
            data-testid="invest-desc-add-plus-btn"
          >
            +
          </button>
          </div>
          {showNewDescriptionInput && (
            <div className="flex gap-2 mb-4">
              <input
                data-testid="invest-desc-new-input"
                type="text"
                placeholder="Nova descrição"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 p-2 border rounded text-sm sm:text-base"
              />
              <button
                onClick={handleAddNewDescription}
                data-testid="invest-desc-new-add-btn"
                className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-green-600 text-sm sm:text-base"
              >
                OK
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="Valor do Investimento (R$)"
            data-testid="invest-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />
          <input
            type="date"
            data-testid="invest-date-input"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />

          <select
            data-testid="invest-category-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          >
            <option value="acao">📈 Ações</option>
            <option value="fundo">💼 Fundos Imobiliários</option>
            <option value="tesouro">🏛️ Tesouro Direto</option>
            <option value="cripto">₿ Criptomoedas</option>
            <option value="cdb">🏦 CDB</option>
            <option value="lci">🏠 LCI</option>
            <option value="lca">🌾 LCA</option>
            <option value="previdencia">👵 Previdência Privada</option>
            <option value="caixinha">🐷 Caixinha</option>
            <option value="outros">📄 Outros</option>
          </select>
          <button
            onClick={handleAdd}
            data-testid="investments-add-btn"
            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 text-sm sm:text-base sm:p-2"
          >
            Adicionar Investimento
          </button>
        </div>

        <div className="space-y-4">
          {investments.length === 0 ? (
            <p className="text-center text-gray-500" data-testid="investments-empty">Nenhum investimento registrado</p>
          ) : (
            investments.map((investment) => (
              <div key={investment.id} data-testid={`invest-row-${investment.id}`} className={`bg-white p-4 rounded-lg shadow ${isOverdue(investment.dueDay) ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p data-testid={`invest-desc-${investment.id}`} className="font-bold text-lg">{getCategoryEmoji(investment.category)} {investment.description}</p>
                      {isOverdue(investment.dueDay) && (
                        <span data-testid="invest-status-overdue" className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">⚠️ ATRASADO</span>
                      )}
                    </div>
                    <p className="text-gray-600">Categoria: {getCategoryName(investment.category)}</p>
                    <p className="text-gray-600">Data: {new Date(investment.dueDay).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(investment.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </div>
                <div className="text-sm">
                  <div>
                    <p className="text-gray-600">Valor Investido</p>
                    <p className="font-bold text-lg">R$ {investment.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {investments.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="text-lg font-bold mb-4">Resumo de Investimentos</h3>
            <div className="text-center">
              <p className="text-gray-600">Total Investido</p>
              <p data-testid="investments-total" className="font-bold text-2xl text-green-600">
                R$ {investments.reduce((sum, investment) => sum + investment.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
