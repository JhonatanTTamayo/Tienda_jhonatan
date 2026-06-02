import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        clearError();
        const success = await login(username, password);
        if (success) navigate('/dashboard');
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Baloo 2', system-ui, sans-serif" }}>

            {/* Lado izquierdo - Logo + Nombre */}
            <div style={{ flex: 1, backgroundColor: '#E31837', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
                <div style={{ textAlign: 'center', maxWidth: '420px' }}>

                    <img
                        src="/logo.png"
                        alt="Tienda Jhonatan"
                        style={{ width: '140px', height: '140px', borderRadius: '28px', objectFit: 'cover', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div style={{
                        width: '140px', height: '140px', borderRadius: '28px',
                        backgroundColor: 'white', display: 'none', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 24px',
                        fontSize: '48px', fontWeight: '800', color: '#E31837',
                    }}>
                        TJ
                    </div>

                    <h1 style={{ fontSize: '44px', fontWeight: '800', color: 'white', margin: '0 0 8px', letterSpacing: '-1px', lineHeight: 1.1 }}>
                        Tienda Jhonatan
                    </h1>
                    <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '500' }}>
                        Sistema de gestion de fiados
                    </p>
                </div>
            </div>

            {/* Lado derecho - Formulario */}
            <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 40px' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>

                    <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                        <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 6px' }}>Iniciar sesion</h2>
                        <p style={{ fontSize: '15px', color: '#999', margin: 0, fontWeight: '500' }}>Ingresa tus credenciales</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Usuario</label>
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                   placeholder="Ingrese su usuario"
                                   style={inputStyle} required autoFocus />
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>Contraseña</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                   placeholder="Ingrese su contraseña"
                                   style={inputStyle} required />
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#FFF5F5', color: '#E31837', padding: '14px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: '600', textAlign: 'center', border: '2px solid #FFE0E0' }}>
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                                style={{
                                    width: '100%', padding: '16px', backgroundColor: loading ? '#FFB3B3' : '#E31837',
                                    color: 'white', border: 'none', borderRadius: '12px',
                                    cursor: loading ? 'not-allowed' : 'pointer', fontSize: '17px', fontWeight: '700',
                                    fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(227,24,55,0.3)',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#C41230'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#E31837'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#999' }}>
                        Usuario: admin / Contraseña: admin123
                    </p>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '15px 18px', border: '2px solid #EEEEEE', borderRadius: '12px',
    fontSize: '15px', fontFamily: "'Baloo 2', system-ui, sans-serif", boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s', fontWeight: '500',
};

export default Login;