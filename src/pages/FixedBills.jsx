import { useState, useEffect } from 'react';
import { 
  addFixedBill, 
  getFixedBills, 
  deleteFixedBill 
} from '../services/fixedBillService';

export default function FixedBills() {
  const [fixedBills, setFixedBills] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('agua');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showNewDescriptionInput, setShowNewDescriptionInput] = useState(false);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    loadFixedBills();
  }, []);

  const loadFixedBills = async () => {
    const data = await getFixedBills();
    const sorted = data.sort((a, b) => {
      return new Date(a.dueDay) - new Date(b.dueDay);
    });
    setFixedBills(sorted);
  };

  const getUniqueDescriptions = () => {
    const existingDescriptions = [...new Set(fixedBills.map(bill => bill.description))];
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

    await addFixedBill({
      description,
      amount: numericAmount,
      dueDay,
      category,
    });

    setDescription('');
    setAmount('');
    setDueDay(new Date().toISOString().split('T')[0]);
    setShowNewDescriptionInput(false);
    setNewDescription('');
    setCategory('agua');
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    loadFixedBills();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      await deleteFixedBill(id);
      loadFixedBills();
    }
  };

  const getCategoryEmoji = (category) => {
    switch(category) {
      case 'agua': return '💧';
      case 'luz': return '💡';
      case 'internet': return '🌐';
      case 'aluguel': return '🏠';
      case 'telefone': return '📱';
      case 'streaming': return '📺';
      case 'condominio': return '🏢';
      case 'seguro': return '🛡️';
      case 'outros': return '📄';
      default: return '💰';
    }
  };

  const getCategoryName = (category) => {
    switch(category) {
      case 'agua': return 'Água';
      case 'luz': return 'Luz';
      case 'internet': return 'Internet';
      case 'aluguel': return 'Aluguel';
      case 'telefone': return 'Telefone';
      case 'streaming': return 'Streaming';
      case 'condominio': return 'Condomínio';
      case 'seguro': return 'Seguro';
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <span className="text-2xl">✓</span>
          <span className="font-bold">Conta fixa adicionada com sucesso!</span>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-3xl font-bold">Contas Fixas</h1>
          <a href="/dashboard" className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base">
            Voltar
          </a>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
          <div className="flex gap-2 mb-4">
            <select
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            >
              +
            </button>
          </div>
          
          {showNewDescriptionInput && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Nova descrição"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 p-2 border rounded text-sm sm:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewDescription()}
              />
              <button
                onClick={handleAddNewDescription}
                className="bg-green-500 text-white px-2 py-2 sm:px-4 sm:py-2 rounded hover:bg-green-600 text-sm sm:text-base"
              >
                ✓
              </button>
              <button
                onClick={() => {
                  setShowNewDescriptionInput(false);
                  setNewDescription('');
                }}
                className="bg-gray-500 text-white px-2 py-2 sm:px-4 sm:py-2 rounded hover:bg-gray-600 text-sm sm:text-base"
              >
                ✗
              </button>
            </div>
          )}
          <input
            type="text"
            placeholder="Valor Mensal (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />
          <input
            type="date"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          >
            <option value="agua">💧 Água</option>
            <option value="luz">💡 Luz/Energia</option>
            <option value="internet">🌐 Internet</option>
            <option value="aluguel">🏠 Aluguel</option>
            <option value="telefone">📱 Telefone</option>
            <option value="streaming">📺 Streaming</option>
            <option value="condominio">🏢 Condomínio</option>
            <option value="seguro">🛡️ Seguro</option>
            <option value="outros">📄 Outros</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 text-sm sm:text-base sm:p-2"
          >
            Adicionar Conta Fixa
          </button>
        </div>

        <div className="space-y-4">
          {fixedBills.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma conta fixa registrada</p>
          ) : (
            fixedBills.map((bill) => (
              <div key={bill.id} className={`bg-white p-4 rounded-lg shadow ${isOverdue(bill.dueDay) ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{getCategoryEmoji(bill.category)} {bill.description}</p>
                      {isOverdue(bill.dueDay) && (
                        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">⚠️ VENCIDA</span>
                      )}
                    </div>
                    <p className="text-gray-600">Categoria: {getCategoryName(bill.category)}</p>
                    <p className="text-gray-600">Vence dia: {new Date(bill.dueDay).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </div>
                <div className="text-sm">
                  <div>
                    <p className="text-gray-600">Valor Mensal</p>
                    <p className="font-bold text-lg">R$ {bill.amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {fixedBills.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="text-lg font-bold mb-4">Resumo Mensal</h3>
            <div className="text-center">
              <p className="text-gray-600">Total em Contas Fixas</p>
              <p className="font-bold text-2xl text-blue-600">
                R$ {fixedBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}