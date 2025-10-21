import { useEffect, useState } from 'react';
import api from '../api';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Dashboard({ user, onLogout }) {
  const [records, setRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('meus-pontos');

  // ✅ FUNÇÃO CORRIGIDA - Lida com timestamp ISO
  const formatarDataHora = (dataField, horaMySQL) => {
    console.log('🔍 Dados recebidos para formatação:', { dataField, horaMySQL });
    
    // Se dataField for um timestamp ISO (contém 'T' e 'Z')
    if (dataField && dataField.includes('T') && dataField.includes('Z')) {
      try {
        const dataObj = new Date(dataField);
        return {
          data: dataObj.toLocaleDateString('pt-BR'), // "20/10/2025"
          hora: horaMySQL ? horaMySQL.slice(0, 5) : '--:--' // "19:47"
        };
      } catch (e) {
        console.error('Erro ao formatar timestamp:', e);
        return { data: 'Data inválida', hora: '--:--' };
      }
    }
    
    // Se for data simples do MySQL (YYYY-MM-DD)
    if (dataField && dataField.includes('-')) {
      const parts = dataField.split('-');
      if (parts.length === 3) {
        return {
          data: `${parts[2]}/${parts[1]}/${parts[0]}`, // "20/10/2025"
          hora: horaMySQL ? horaMySQL.slice(0, 5) : '--:--' // "19:47"
        };
      }
    }
    
    // Fallback
    return { data: dataField || '--/--/----', hora: horaMySQL || '--:--' };
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      await fetchRecords();
      if (user?.cargo === 'gerente') {
        await fetchAllRecords();
      }
    } catch (e) {
      console.error('Erro ao buscar dados:', e);
      setMsg('Erro ao carregar dados');
    }
  };

  const fetchRecords = async () => {
    try {
      const res = await api.get('/attendance/me');
      
      // ✅ DEBUG DETALHADO
      console.log('=== 🎯 DEBUG COMPLETO DA API ===');
      console.log('URL chamada:', '/attendance/me');
      console.log('Status:', res.status);
      console.log('Dados COMPLETOS da resposta:', res.data);
      
      if (res.data.records && res.data.records.length > 0) {
        console.log('=== 📊 PRIMEIRO REGISTRO DETALHADO ===');
        const primeiro = res.data.records[0];
        console.log('Primeiro registro:', primeiro);
        console.log('Date:', primeiro.date, '(tipo:', typeof primeiro.date, ')');
        console.log('Time:', primeiro.time, '(tipo:', typeof primeiro.time, ')');
        console.log('Date contém "T":', primeiro.date.includes('T'));
        console.log('Date contém "Z":', primeiro.date.includes('Z'));
        
        // ✅ TESTE DA FORMATAÇÃO
        const formatado = formatarDataHora(primeiro.date, primeiro.time);
        console.log('Resultado da formatação:', formatado);
      }
      
      console.log('================================');
      
      setRecords(res.data.records || []);
    } catch (e) {
      console.error('Erro ao buscar registros:', e);
      setMsg('Erro ao carregar registros');
    }
  };

  const fetchAllRecords = async () => {
    try {
      const res = await api.get('/attendance/all');
      setAllRecords(res.data.records || []);
    } catch (e) {
      console.error('Erro ao buscar todos os registros:', e);
    }
  };

  const marcarPonto = async () => {
    if (!navigator.geolocation) {
      setMsg('Geolocalização não suportada pelo navegador.');
      return;
    }

    setLoading(true);
    setMsg('Obtendo localização...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          setMsg('Verificando localização da empresa...');
          
          const company = await api.get('/attendance/company');
          const dist = haversine(lat, lng, company.data.latitude, company.data.longitude);

          if (dist > company.data.radiusMeters) {
            setMsg(`❌ Fora do raio permitido! (${Math.round(dist)}m de ${company.data.radiusMeters}m)`);
            setLoading(false);
            return;
          }

          setMsg('Marcando ponto...');
          
          await api.post('/attendance/mark', 
            { 
              location: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
              type: 'entrada',
              latitude: lat,
              longitude: lng
            }
          );
          
          setMsg('✅ Ponto marcado com sucesso!');
          await fetchUserData();
          
        } catch (error) {
          console.error('Erro ao marcar ponto:', error);
          setMsg(`❌ Erro: ${error.response?.data?.message || error.message}`);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erro de geolocalização:', err);
        let errorMsg = 'Erro ao obter localização: ';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg += 'Permissão negada. Permita o acesso à localização.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg += 'Localização indisponível. Verifique o GPS.';
            break;
          case err.TIMEOUT:
            errorMsg += 'Tempo esgotado. Tente novamente.';
            break;
          default:
            errorMsg += err.message;
        }
        
        setMsg(errorMsg);
        setLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) onLogout();
    window.location.href = '/';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h2>👋 Bem-vindo, {user?.nome || 'Usuário'}</h2>
            <p>📧 {user?.email}</p>
            <p>💼 Cargo: <strong>{user?.cargo === 'gerente' ? 'Gerente' : 'Funcionário'}</strong></p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            🚪 Sair
          </button>
        </div>
      </header>

      <section className="ponto-section">
        <button 
          onClick={marcarPonto} 
          disabled={loading}
          className="btn-marcar-ponto"
        >
          {loading ? '🔄 Processando...' : '📍 Marcar Ponto'}
        </button>
        
        {msg && (
          <div className={`mensagem ${msg.includes('✅') ? 'sucesso' : msg.includes('❌') ? 'erro' : 'info'}`}>
            {msg}
          </div>
        )}
      </section>

      {/* Abas para Gerente */}
      {user?.cargo === 'gerente' && (
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'meus-pontos' ? 'active' : ''}`}
            onClick={() => setActiveTab('meus-pontos')}
          >
            📋 Meus Pontos
          </button>
          <button 
            className={`tab ${activeTab === 'todos-pontos' ? 'active' : ''}`}
            onClick={() => setActiveTab('todos-pontos')}
          >
            👥 Todos os Pontos
          </button>
        </div>
      )}

      {/* Conteúdo das Abas */}
      <section className="registros-section">
        {activeTab === 'meus-pontos' && (
          <>
            <h3>📋 Meus Registros ({records.length})</h3>
            
            {records.length === 0 ? (
              <p className="sem-registros">Nenhum registro encontrado</p>
            ) : (
              <div className="registros-lista">
                {records.map((r, i) => {
                  const { data, hora } = formatarDataHora(r.date, r.time);
                  
                  return (
                    <div key={i} className="registro-item">
                      <div className="registro-data">
                        <strong>📅 {data}</strong>
                        {hora && hora !== '--:--' && <span> 🕐 {hora}</span>}
                      </div>
                      <div className="registro-local">
                        📍 {r.location || 'Local não informado'}
                      </div>
                      {r.type && <div className="registro-tipo">🎯 Tipo: {r.type}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {user?.cargo === 'gerente' && activeTab === 'todos-pontos' && (
          <>
            <h3>👥 Todos os Registros ({allRecords.length})</h3>
            
            {allRecords.length === 0 ? (
              <p className="sem-registros">Nenhum registro encontrado</p>
            ) : (
              <div className="registros-lista">
                {allRecords.map((r, i) => {
                  const { data, hora } = formatarDataHora(r.data, r.hora);
                  return (
                    <div key={i} className="registro-item">
                      <div className="registro-data">
                        <strong>👤 {r.nome}</strong>
                        <span> 📅 {data}</span>
                        {hora && hora !== '--:--' && <span> 🕐 {hora}</span>}
                      </div>
                      <div className="registro-local">
                        📍 {r.localizacao || 'Local não informado'}
                      </div>
                      {r.tipo && <div className="registro-tipo">🎯 Tipo: {r.tipo}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}