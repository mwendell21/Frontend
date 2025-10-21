import { Link } from 'react-router-dom';
import './Home.css'; // ✅ ADICIONE ESTA LINHA

export default function Home() {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>🏢 Empresa Fictícia</h2>
        </div>
        <div className="nav-links">
          <Link to="/login" className="login-btn">Área do Colaborador</Link>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h1>Bem-vindo à <span>Empresa Fictícia</span></h1>
          <p>Líder em soluções inovadoras para o seu negócio</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">Acessar Sistema</Link>
            <a href="#sobre" className="btn-secondary">Conheça Mais</a>
          </div>
        </div>
      </header>

      <section id="sobre" className="about-section">
        <div className="container">
          <h2>Sobre Nossa Empresa</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚀</div>
              <h3>Inovação</h3>
              <p>Soluções tecnológicas de ponta para impulsionar seu negócio</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Equipe Qualificada</h3>
              <p>Profissionais especializados em diversas áreas</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Resultados</h3>
              <p>Comprometidos com a excelência e resultados concretos</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Empresa Fictícia. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}