import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    // Verifica se tem token E se não está expirado
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(user);
      } catch (error) {
        // Token inválido - limpa localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🏢</div>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={
            !isAuthenticated ? 
              <Login onLogin={(userData) => { 
                setIsAuthenticated(true); 
                setUser(userData); 
              }} /> : 
              <Navigate to="/dashboard" replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
              <Dashboard 
                user={user} 
                onLogout={() => { 
                  setIsAuthenticated(false); 
                  setUser(null);
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                }} 
              /> : 
              <Navigate to="/login" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;