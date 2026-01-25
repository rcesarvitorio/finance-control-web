import { useState, useEffect } from 'react';
import { 
  addInstallment, 
  getInstallments, 
  deleteInstallment 
} from '../services/installmentService';

export default function Installments() {
  const [installments, setInstallments] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    loadInstallments();
  }, []);

  const loadInstallments = async () => {
    const data = await getInstallments();
    // Ordenar por data de compra em ordem decrescente (mais recentes primeiro)
    const sorted = data.sort((a, b) => {
      const dateA = new Date(a.purchaseDate || a.createdAt || 0);
      const dateB = new Date(b.purchaseDate || b.createdAt || 0);
      return dateB - dateA;
    });
    setInstallments(sorted);
  };

  const handleAdd = async () => {
    if (!description || !amount || !totalInstallments) {
      alert('Preencha todos os campos');
      return;
    }

    await addInstallment({
      description,
      installmentAmount: parseFloat(amount),
      totalInstallments: parseInt(totalInstallments),
      paymentMethod,
      purchaseDate,
    });

    setDescription('');
    setAmount('');
    setTotalInstallments('');
    setPaymentMethod('card');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    loadInstallments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      await deleteInstallment(id);
      loadInstallments();
    }
  };

  const getPaymentEmoji = (method) => {
    switch(method) {
      case 'card': return '💳';
      case 'boleto': return '📄';
      case 'pix': return '🔐';
      default: return '💰';
    }
  };

  const isPaid = (inst) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const parseDate = (s) => {
      if (!s) return null;
      const d = new Date(s);
      if (!isNaN(d)) return d;
      const parts = String(s).split('T')[0];
      return new Date(parts);
    };

    const purchase = parseDate(inst.purchaseDate ?? inst.createdAt);
    if (!purchase) return false;

    // última parcela é no mês seguinte à data de compra + totalInstallments - 1
    const lastInstallmentMonth = new Date(purchase.getFullYear(), purchase.getMonth() + inst.totalInstallments, 1);

    // comparar: se mês atual > mês da última parcela, então foi pago
    const lastPaidDate = new Date(lastInstallmentMonth.getFullYear(), lastInstallmentMonth.getMonth(), 0); // último dia do mês anterior
    
    return now > lastPaidDate;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <span className="text-2xl">✓</span>
          <span className="font-bold">Parcelamento adicionado com sucesso!</span>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Parcelações</h1>
          <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Voltar
          </a>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="number"
            placeholder="Valor da Parcela"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="number"
            placeholder="Quantidade de Parcelas"
            value={totalInstallments}
            onChange={(e) => setTotalInstallments(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          >
            <option value="card">💳 Cartão</option>
            <option value="boleto">📄 Boleto</option>
            <option value="pix">🔐 Pix</option>
          </select>
          <button
            onClick={handleAdd}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Adicionar
          </button>
        </div>

        <div className="space-y-4">
          {installments.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma parcelação registrada</p>
          ) : (
            installments.map((inst) => (
              <div key={inst.id} className={`bg-white p-4 rounded-lg shadow ${isPaid(inst) ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{inst.description}</p>
                      {isPaid(inst) && (
                        <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs font-bold">✓ PAGO</span>
                      )}
                    </div>
                    <p className="text-gray-600">{getPaymentEmoji(inst.paymentMethod)} {inst.paymentMethod}</p>
                    <p className="text-gray-600">Data da compra: {inst.purchaseDate ? new Date(inst.purchaseDate).toLocaleDateString('pt-BR') : '-'}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(inst.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Deletar
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Valor da Parcela</p>
                    <p className="font-bold">R$ {inst.installmentAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantidade</p>
                    <p className="font-bold">{inst.totalInstallments}x</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold">R$ {(inst.installmentAmount * inst.totalInstallments).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
