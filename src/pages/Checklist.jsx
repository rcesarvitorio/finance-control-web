import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { getFixedBills } from '../services/fixedBillService';
import { getInstallments } from '../services/installmentService';
import { saveChecklistItems, getAllChecklistItems } from '../services/checklistService';

export default function Checklist() {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [fixedBills, setFixedBills] = useState([]);
  const [monthChecklists, setMonthChecklists] = useState({});
  const [newItemText, setNewItemText] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleLogout = async () => {
    await logout();
    clearUser();
    navigate('/login');
  };

  useEffect(() => {
    const loadData = async () => {
      // Prepare next 12 months
      const now = new Date();
      const monthsList = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        monthsList.push(d);
      }
      setMonths(monthsList);
      setSelectedMonth(monthsList[0]);

      // Load fixed bills
      const bills = await getFixedBills();
      setFixedBills(bills);

      // Load installments
      const installments = await getInstallments();

      // Load saved checklist items
      const savedItems = await getAllChecklistItems();

      // Helper functions
      const parseDate = (s) => {
        if (!s) return null;
        const d = new Date(s);
        if (!isNaN(d)) return d;
        // try ISO split
        const parts = String(s).split('T')[0];
        return new Date(parts);
      };

      const addMonths = (date, n) => {
        const d = new Date(date.getFullYear(), date.getMonth() + n, 1);
        return d;
      };

      // Initialize checklists for each month
      const checklists = {};
      const MONTH_ABBR = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      
      monthsList.forEach((month) => {
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        const billsDueThisMonth = bills.filter((bill) => {
          const billDate = new Date(bill.dueDay);
          return (
            billDate.getMonth() === month.getMonth() &&
            billDate.getFullYear() === month.getFullYear()
          );
        });

        // Get installments due this month (only non-card payments)
        const installmentsDueThisMonth = [];
        installments.filter(inst => inst.paymentMethod !== 'card').forEach((inst) => {
          const amount = parseFloat(inst.installmentAmount ?? inst.amount ?? 0) || 0;
          const totalInst = parseInt(inst.totalInstallments ?? 1, 10) || 1;
          const purchase = parseDate(inst.purchaseDate ?? inst.createdAt ?? inst.created_at);
          if (!purchase) return;

          for (let i = 0; i < totalInst; i++) {
            const dueMonth = addMonths(purchase, i + 1);
            if (
              dueMonth.getMonth() === month.getMonth() &&
              dueMonth.getFullYear() === month.getFullYear()
            ) {
              installmentsDueThisMonth.push({
                id: `${inst.id}_${i + 1}`,
                text: `${inst.description} - Parcela ${i + 1}/${totalInst} - R$ ${amount.toFixed(2)}`,
                completed: false,
                installmentId: inst.id,
                isFromFixedBill: true, // treat as fixed for no delete
              });
            }
          }
        });

        // Get saved items for this month or create new ones
        const savedMonthItems = savedItems[key];
        
        let items = [
          ...billsDueThisMonth.map((bill) => ({
            id: bill.id,
            text: `${bill.description} - R$ ${parseFloat(bill.amount).toFixed(2)}`,
            completed: false,
            billId: bill.id,
            isFromFixedBill: true,
          })),
          ...installmentsDueThisMonth,
        ];

        // Merge with saved state
        if (savedMonthItems) {
          items = items.map((item) => {
            const savedItem = savedMonthItems.find((s) => s.id === item.id);
            return savedItem ? { ...item, completed: savedItem.completed } : item;
          });
        }

        checklists[key] = {
          month: `${MONTH_ABBR[month.getMonth()]}/${month.getFullYear()}`,
          items,
          additionalItems: savedMonthItems ? savedMonthItems.filter((item) => !item.isFromFixedBill) : [],
        };
      });

      setMonthChecklists(checklists);
    };

    loadData();
  }, []);

  const getMonthKey = (month) => {
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
  };

  const handleAddItem = () => {
    if (newItemText.trim() && newItemValue.trim() && selectedMonth) {
      const key = getMonthKey(selectedMonth);
      const itemText = `${newItemText} - R$ ${parseFloat(newItemValue).toFixed(2)}`;
      setMonthChecklists({
        ...monthChecklists,
        [key]: {
          ...monthChecklists[key],
          additionalItems: [
            ...monthChecklists[key].additionalItems,
            { id: Date.now(), text: itemText, completed: false, isFromFixedBill: false },
          ],
        },
      });
      setNewItemText('');
      setNewItemValue('');
    }
  };

  const handleToggleItem = async (itemId) => {
    if (!selectedMonth) return;
    const key = getMonthKey(selectedMonth);
    
    // Update state
    const updatedChecklists = {
      ...monthChecklists,
      [key]: {
        ...monthChecklists[key],
        items: monthChecklists[key].items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
        additionalItems: monthChecklists[key].additionalItems.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      },
    };
    setMonthChecklists(updatedChecklists);
    
    // Auto-save to database
    try {
      const currentChecklist = updatedChecklists[key];
      const allItems = [
        ...currentChecklist.items,
        ...currentChecklist.additionalItems,
      ];
      await saveChecklistItems(key, allItems);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 2000);
    } catch (error) {
      console.error('Error saving checklist:', error);
      alert('Erro ao salvar checklist');
    }
  };

  const handleDeleteItem = (itemId) => {
    if (!selectedMonth) return;
    const key = getMonthKey(selectedMonth);
    setMonthChecklists({
      ...monthChecklists,
      [key]: {
        ...monthChecklists[key],
        additionalItems: monthChecklists[key].additionalItems.filter(
          (item) => item.id !== itemId
        ),
      },
    });
  };



  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-pulse z-50">
          <span className="text-2xl">✓</span>
          <span className="font-bold">Checklist salva com sucesso!</span>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-3xl font-bold">Checklist de Pagamentos</h1>
          <a href="/dashboard" className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-base">
            Voltar
          </a>
        </div>
        {/* Month Tabs */}
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
                  className={`px-4 py-2 rounded whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {monthLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checklist for Selected Month */}
        {selectedMonth && monthChecklists[getMonthKey(selectedMonth)] && (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg sm:text-xl font-bold">
                {monthChecklists[getMonthKey(selectedMonth)].month}
              </h2>
              <span className="text-sm text-gray-600">
                {monthChecklists[getMonthKey(selectedMonth)].items.filter((item) => item.completed).length +
                  monthChecklists[getMonthKey(selectedMonth)].additionalItems.filter((item) => item.completed)
                    .length}{' '}
                de{' '}
                {monthChecklists[getMonthKey(selectedMonth)].items.length +
                  monthChecklists[getMonthKey(selectedMonth)].additionalItems.length}{' '}
                concluídos
              </span>
            </div>

            {/* All Items Section */}
            {(() => {
              const allItems = [
                ...monthChecklists[getMonthKey(selectedMonth)].items,
                ...monthChecklists[getMonthKey(selectedMonth)].additionalItems,
              ];
              return allItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">Itens do Checklist</h3>
                  <div className="space-y-2">
                    {allItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleItem(item.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <span
                          className={`flex-1 text-sm sm:text-base font-medium ${
                            item.completed ? 'line-through text-gray-400' : 'text-gray-700'
                          }`}
                        >
                          {item.text}
                        </span>
                        {!item.isFromFixedBill && (
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Add New Item */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Adicionar Item</h3>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder="Descrição do item..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  value={newItemValue}
                  onChange={(e) => setNewItemValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder="Valor"
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleAddItem}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm whitespace-nowrap"
                >
                  +
                </button>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
}
