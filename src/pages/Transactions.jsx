import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  getTransactions, 
  deleteTransaction 
} from '../services/transactionService';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await getTransactions();
    setTransactions(data);
  };

  const handleAdd = async () => {
    if (!description || !amount) {
      alert('Preencha todos os campos');
      return;
    }

    await addTransaction({
      description,
      amount: parseFloat(amount),
    });

    setDescription('');
    setAmount('');
    loadTransactions();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      await deleteTransaction(id);
      loadTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Transações</h1>
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
            placeholder="Valor"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
          />
          <button
            onClick={handleAdd}
            className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Adicionar
          </button>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma transação registrada</p>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <p className="font-bold">{tx.description}</p>
                  <p className="text-gray-600">R$ {tx.amount.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Deletar
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
