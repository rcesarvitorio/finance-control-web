import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseConfig';
import { useUserStore } from './store/userStore';
import './styles/global.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Investments from './pages/Investments';
import FixedBills from './pages/FixedBills';
import Installments from './pages/Installments';

function PrivateRoute({ children, loading, user }) {
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute loading={loading} user={user}><Dashboard /></PrivateRoute>} />
        <Route path="/investments" element={<PrivateRoute loading={loading} user={user}><Investments /></PrivateRoute>} />
        <Route path="/fixed-bills" element={<PrivateRoute loading={loading} user={user}><FixedBills /></PrivateRoute>} />
        <Route path="/installments" element={<PrivateRoute loading={loading} user={user}><Installments /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
