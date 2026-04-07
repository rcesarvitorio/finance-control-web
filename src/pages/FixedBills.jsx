import { useState, useEffect } from 'react';
import { 
  addFixedBill, 
  getFixedBills, 
  deleteFixedBill,
  updateFixedBill
} from '../services/fixedBillService';
import { getAllChecklistItems } from '../services/checklistService';
import { getMonthsRange } from '../utils/dateUtils';

export default function FixedBills() {
  const [fixedBills, setFixedBills] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('agua');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showNewDescriptionInput, setShowNewDescriptionInput] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [checklistItems, setChecklistItems] = useState({});
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [editingBillId, setEditingBillId] = useState(null);
  const [editingAmount, setEditingAmount] = useState('');

  useEffect(() => {
    loadFixedBills();
    loadChecklistItems();
    initializeMonths();

    // Recarrega o checklist quando a página fica visível novamente
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadChecklistItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const initializeMonths = () => {
    const monthsList = getMonthsRange();
    setMonths(monthsList);
    setSelectedMonth(monthsList[3]); // Select current month (4th position: 3 back + current)
  };

  const loadChecklistItems = async () => {
    const items = await getAllChecklistItems();
    setChecklistItems(items);
  };

  const getMonthKey = (month) => {
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  };

  const getCurrentMonthKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const isBillPaid = (billId) => {
    if (!selectedMonth) return false;
    const monthKey = getMonthKey(selectedMonth);
    const monthChecklistItems = checklistItems[monthKey] || [];
    return monthChecklistItems.some((item) => item.id === billId && item.completed);
  };

  const getBillsByMonth = () => {
    if (!selectedMonth) return [];
    return fixedBills.filter((bill) => {
      const billDate = new Date(bill.dueDay);
      return (
        billDate.getMonth() === selectedMonth.getMonth() &&
        billDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  };

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

  const handleReplicate = async (bill) => {
    const currentDueDate = new Date(bill.dueDay);
    const nextMonthDueDate = new Date(currentDueDate);
    nextMonthDueDate.setMonth(nextMonthDueDate.getMonth() + 1);

    await addFixedBill({
      description: bill.description,
      amount: 0, // Valor zerado para edição posterior
      dueDay: nextMonthDueDate.toISOString().split('T')[0],
      category: bill.category,
    });

    loadFixedBills();
  };

  const isBillAlreadyReplicated = (bill) => {
    const currentDueDate = new Date(bill.dueDay);
    const nextMonthDueDate = new Date(currentDueDate);
    nextMonthDueDate.setMonth(nextMonthDueDate.getMonth() + 1);
    
    return fixedBills.some(existingBill => 
      existingBill.description === bill.description &&
      new Date(existingBill.dueDay).getMonth() === nextMonthDueDate.getMonth() &&
      new Date(existingBill.dueDay).getFullYear() === nextMonthDueDate.getFullYear()
    );
  };

  const handleEditAmount = (bill) => {
    setEditingBillId(bill.id);
    setEditingAmount(bill.amount.toString());
  };

  const handleSaveAmount = async () => {
    if (!editingBillId || !editingAmount) return;

    const numericAmount = parseFloat(editingAmount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount < 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    try {
      await updateFixedBill(editingBillId, { amount: numericAmount });
      setEditingBillId(null);
      setEditingAmount('');
      loadFixedBills();
    } catch (error) {
      alert('Erro ao atualizar o valor');
    }
  };

  const handleCancelEdit = () => {
    setEditingBillId(null);
    setEditingAmount('');
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

        {/* Filtro de Meses */}
        {months.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2 min-w-full">
              {months.map((month) => {
                const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
                const monthLabel = `${MONTH_ABBR[month.getMonth()]}/${month.getFullYear()}`;
                const isSelected =
                  selectedMonth &&
                  month.getMonth() === selectedMonth.getMonth() &&
                  month.getFullYear() === selectedMonth.getFullYear();

                return (
                  <button
                    key={monthLabel}
                    onClick={() => setSelectedMonth(month)}
                    className={`px-4 py-2 rounded whitespace-nowrap transition font-medium text-sm ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {monthLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
          {getBillsByMonth().length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma conta fixa registrada para este mês</p>
          ) : (
            getBillsByMonth().map((bill) => {
              const isPaid = isBillPaid(bill.id);
              return (
              <div key={bill.id} className={`bg-white p-4 rounded-lg shadow ${isPaid ? 'border-l-4 border-green-500 opacity-75' : isOverdue(bill.dueDay) ? 'border-l-4 border-red-500' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-lg ${isPaid ? 'line-through text-gray-400' : ''}`}>{getCategoryEmoji(bill.category)} {bill.description}</p>
                      {isPaid && (
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold">✓ PAGA</span>
                      )}
                      {isOverdue(bill.dueDay) && !isPaid && (
                        <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-xs font-bold">⚠️ VENCIDA</span>
                      )}
                    </div>
                    <p className={`text-gray-600 ${isPaid ? 'line-through' : ''}`}>Categoria: {getCategoryName(bill.category)}</p>
                    <p className={`text-gray-600 ${isPaid ? 'line-through' : ''}`}>Vence dia: {new Date(bill.dueDay).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    {isBillAlreadyReplicated(bill) ? (
                      <span className="bg-gray-200 text-gray-600 px-3 py-2 rounded text-sm" title="Conta já replicada para o próximo mês">
                        ✓ Enviada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReplicate(bill)}
                        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
                        title="Replicar para o próximo mês"
                      >
                        ➡️ Próximo Mês
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(bill.id)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-sm"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600">Valor Mensal</p>
                      {editingBillId === bill.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-600">R$</span>
                          <input
                            type="text"
                            value={editingAmount}
                            onChange={(e) => setEditingAmount(e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm edit-amount-input"
                            placeholder="0.00"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveAmount()}
                          />
                          <button
                            onClick={handleSaveAmount}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                          >
                            ✓
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 text-xs"
                          >
                            ✗
                          </button>
                        </div>
                      ) : (
                        <p className={`font-bold text-lg ${isPaid ? 'line-through text-gray-400' : ''}`}>R$ {bill.amount.toFixed(2)}</p>
                      )}
                    </div>
                    {editingBillId !== bill.id && (
                      <button
                        onClick={() => handleEditAmount(bill)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-xs"
                        title="Editar valor"
                      >
                        ✏️ Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
            })
          )}
        </div>

        {getBillsByMonth().length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mt-6">
            <h3 className="text-lg font-bold mb-4">Resumo Mensal</h3>
            <div className="text-center">
              <p className="text-gray-600">Total em Contas Fixas</p>
              <p className="font-bold text-2xl text-blue-600">
                R$ {getBillsByMonth().reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
              </p>
              <p className="text-gray-600 mt-2">Pagas este mês: {getBillsByMonth().filter(bill => isBillPaid(bill.id)).length}/{getBillsByMonth().length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}