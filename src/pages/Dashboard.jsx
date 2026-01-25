import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout } from '../services/authService';
import { useUserStore } from '../store/userStore';
import { getInstallments } from '../services/installmentService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, clearUser } = useUserStore();
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [monthLabels, setMonthLabels] = useState([]);

  const handleLogout = async () => {
    await logout();
    clearUser();
    navigate('/login');
  };

  useEffect(() => {
    const load = async () => {
      // prepare next 12 months
      const now = new Date();
      const months = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        months.push(d);
      }

      const endDate = new Date(months[months.length - 1].getFullYear(), months[months.length - 1].getMonth() + 1, 0);

      const installments = await getInstallments();

      const totalsMap = {};
      // initialize keys
      months.forEach((m) => {
        const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
        totalsMap[key] = 0;
      });

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

      installments.forEach((inst) => {
        const amount = parseFloat(inst.installmentAmount ?? inst.amount ?? 0) || 0;
        const totalInst = parseInt(inst.totalInstallments ?? 1, 10) || 1;
        const purchase = parseDate(inst.purchaseDate ?? inst.createdAt ?? inst.created_at);
        if (!purchase) return;

        for (let i = 0; i < totalInst; i++) {
          // primeira parcela no mês seguinte à data de compra
          const m = addMonths(purchase, i + 1);
          // only count if within our 12-month window
          if (m >= months[0] && m <= endDate) {
            const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
            totalsMap[key] = (totalsMap[key] || 0) + amount;
          }
        }
      });

      const MONTH_ABBR = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
      const labels = months.map((m) => `${MONTH_ABBR[m.getMonth()]}/${m.getFullYear()}`);
      const totals = months.map((m) => {
        const key = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
        return totalsMap[key] || 0;
      });

      setMonthLabels(labels);
      setMonthlyTotals(totals);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Finance Control</h1>
          <div className="flex gap-4 items-center">
            <span>{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <a href="/transactions" className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-xl font-bold">📊 Transações</h2>
            <p>Adicionar e gerenciar transações</p>
          </a>
          <a href="/installments" className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-xl font-bold">💳 Parcelações</h2>
            <p>Gerenciar pagamentos parcelados</p>
          </a>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Totais Mensais (próximos 12 meses)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  {monthLabels.map((lbl) => (
                    <th key={lbl} className="px-4 py-2 text-left text-gray-600">{lbl}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {monthlyTotals.map((val, idx) => (
                    <td key={idx} className="px-4 py-3 font-bold">{val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mt-6">
          <h3 className="text-lg font-bold mb-4">Gráfico de Totais Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={monthLabels.map((label, idx) => ({
                name: label,
                total: monthlyTotals[idx] || 0,
              }))}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Total (R$)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );}