import { useState } from 'react';
import api from '../api';
import './Login.css'; // ✅ Agora importa o CSS da mesma pasta

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        if (onLogin) onLogin(res.data.user);
        window.location.href = '/dashboard';
      } else {
        setError('Token não recebido do servidor');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.message || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const preencherTeste = () => {
    setEmail('joao@empresa.com');
    setPassword('password');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Login - Sistema de Ponto</h2>
        <p className="login-subtitle">Acesse sua conta</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              placeholder="seu@email.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Senha:</label>
            <input 
              type="password" 
              placeholder="Sua senha" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-button">
            {loading ? '🔄 Entrando...' : '🚀 Entrar'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <button 
          type="button" 
          onClick={preencherTeste}
          className="test-credentials-button"
        >
          🧪 Preencher Credenciais de Teste
        </button>

        <div className="login-info">
          <p><strong>Credenciais para teste:</strong></p>
          <p>Email: <code>joao@empresa.com</code> (Funcionário)</p>
          <p>Email: <code>maria@empresa.com</code> (Gerente)</p>
          <p>Senha: <code>password</code></p>
        </div>
      </div>
    </div>
  );
}