import React, { useState, useEffect } from 'react';
import Login from './components/login';
import Register from './components/register';
import DashboardLayoutSlots from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({}); // بإمكانك لاحقًا تتحقق من التوكن من الباك إند
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

  if (user) {
    return <DashboardLayoutSlots onLogout={handleLogout} />;
  }

  return showRegister ? (
    <Register onRegister={handleRegister} />
  ) : (
    <Login onLogin={handleLogin} switchToRegister={() => setShowRegister(true)} />
  );
}

export default App;
