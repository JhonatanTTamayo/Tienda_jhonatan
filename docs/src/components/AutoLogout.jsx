import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const TIMEOUT_MINUTES = 30; // Cerrar sesion tras 30 min de inactividad
const WARNING_SECONDS = 60; // Mostrar aviso 1 minuto antes

function AutoLogout() {
    const { isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(WARNING_SECONDS);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const countdownRef = useRef(null);

    const resetTimer = () => {
        // Limpiar timers anteriores
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        setShowWarning(false);
        setCountdown(WARNING_SECONDS);

        if (!isAuthenticated) return;

        // Programar aviso
        warningRef.current = setTimeout(() => {
            setShowWarning(true);
            // Iniciar cuenta regresiva
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, (TIMEOUT_MINUTES * 60 * 1000) - (WARNING_SECONDS * 1000));

        // Programar cierre de sesion
        timeoutRef.current = setTimeout(() => {
            handleLogout();
        }, TIMEOUT_MINUTES * 60 * 1000);
    };

    const handleLogout = () => {
        setShowWarning(false);
        logout();
        navigate('/login');
    };

    const handleStay = () => {
        resetTimer();
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        // Eventos que reinician el timer
        const events = ['mousedown', 'keydown', 'mousemove', 'touchstart', 'scroll', 'click'];

        resetTimer();

        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [isAuthenticated]);

    if (!showWarning) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.3s ease',
        }}>
            <div style={{
                backgroundColor: 'white', borderRadius: '16px', padding: '32px',
                maxWidth: '400px', width: '100%', textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                fontFamily: "'Baloo 2', system-ui, sans-serif",
            }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏰</div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 8px' }}>
                    ¿Sigues ahi?
                </h2>
                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 8px', fontWeight: '500' }}>
                    Por inactividad, la sesion se cerrara en
                </p>
                <div style={{
                    fontSize: '36px', fontWeight: '800', color: '#E31837',
                    marginBottom: '20px', animation: countdown <= 10 ? 'pulse 1s infinite' : 'none',
                }}>
                    {countdown}s
                </div>
                <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <button onClick={handleStay}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                cursor: 'pointer', fontSize: '16px', fontWeight: '700', fontFamily: 'inherit',
                                backgroundColor: '#E31837', color: 'white',
                                boxShadow: '0 4px 16px rgba(227,24,55,0.3)',
                            }}>
                        Estoy aqui
                    </button>
                    <button onClick={handleLogout}
                            style={{
                                width: '100%', padding: '12px', borderRadius: '12px', border: '2px solid #EEEEEE',
                                cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit',
                                backgroundColor: 'white', color: '#666',
                            }}>
                        Cerrar sesion ahora
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AutoLogout;