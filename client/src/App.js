import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom'; // ✅ استيراد BrowserRouter
import Login from './components/login';
import Register from './components/register';
import DashboardLayoutSlots from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({}); // لاحقًا بإمكانك تتأكد من صحة التوكن من الباك
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleRegister = (userData) => {
    if (userData) {
      setUser(userData);
    } else {
      setShowRegister(false);
    }
  };

  return (
    <BrowserRouter>
      {user ? (
        <DashboardLayoutSlots onLogout={handleLogout} />
      ) : showRegister ? (
        <Register onRegister={handleRegister} />
      ) : (
        <Login onLogin={handleLogin} switchToRegister={() => setShowRegister(true)} />
      )}
    </BrowserRouter>
  );
}

export default App;
