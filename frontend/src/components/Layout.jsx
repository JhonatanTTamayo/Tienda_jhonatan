import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import PageTransition from './PageTransition';

function Layout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    // Mobile detect
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    // Sidebar: en mobile empieza cerrado, en desktop abierto
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cerrar sidebar al navegar en mobile
    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) setSidebarOpen(false);
    };

    const menuItems = [
        { path: '/dashboard', label: 'Inicio', icon: '⌂' },
        { path: '/customers', label: 'Clientes', icon: '☷' },
        { path: '/fiados', label: 'Fiados', icon: '◎' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F5', fontFamily: "'Baloo 2', system-ui, sans-serif" }}>

            {/* Overlay para mobile cuando sidebar está abierto */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 90,
                        animation: 'fadeIn 0.2s ease',
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: sidebarOpen ? (isMobile ? '260px' : '230px') : '0px',
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #EEEEEE',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex', flexDirection: 'column',
                minHeight: '100vh', position: 'fixed',
                left: 0, top: 0, bottom: 0, zIndex: 100, overflow: 'hidden',
                boxShadow: sidebarOpen && isMobile ? '4px 0 20px rgba(0,0,0,0.15)' : sidebarOpen ? '1px 0 8px rgba(0,0,0,0.04)' : 'none',
            }}>

                {/* Logo */}
                <div style={{ padding: isMobile ? '24px 20px 16px' : '28px 20px 20px', textAlign: 'center', borderBottom: '1px solid #F0F0F0' }}>
                    <img
                        src="/logo.png"
                        alt="Tienda Jhonatan"
                        style={{ width: isMobile ? '70px' : '56px', height: isMobile ? '70px' : '56px', borderRadius: '14px', objectFit: 'cover', marginBottom: '8px' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                    <div style={{
                        width: isMobile ? '70px' : '56px', height: isMobile ? '70px' : '56px', borderRadius: '14px',
                        backgroundColor: '#E31837', display: 'none', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 8px',
                        fontSize: isMobile ? '28px' : '22px', fontWeight: '800', color: 'white',
                    }}>
                        TJ
                    </div>
                    <div style={{ fontWeight: '700', fontSize: isMobile ? '17px' : '16px', color: '#1a1a1a', lineHeight: 1.2 }}>Tienda</div>
                    <div style={{ fontWeight: '800', fontSize: isMobile ? '17px' : '16px', color: '#E31837', lineHeight: 1.2 }}>Jhonatan</div>
                </div>

                {/* Menú */}
                <nav style={{ flex: 1, padding: '14px 12px' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => handleNavigate(item.path)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                width: '100%', padding: isMobile ? '14px 16px' : '12px 14px', borderRadius: '10px',
                                border: 'none', cursor: 'pointer', fontSize: isMobile ? '16px' : '14px', fontWeight: isActive(item.path) ? '700' : '500',
                                backgroundColor: isActive(item.path) ? '#FFF0F0' : 'transparent',
                                color: isActive(item.path) ? '#E31837' : '#666',
                                transition: 'all 0.15s', textAlign: 'left', fontFamily: 'inherit',
                            }}
                            onMouseEnter={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = '#FAFAFA'; }}
                            onMouseLeave={(e) => { if (!isActive(item.path)) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            <span style={{ fontSize: isMobile ? '22px' : '18px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Usuario */}
                <div style={{ padding: '14px', borderTop: '1px solid #F0F0F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ width: isMobile ? '38px' : '34px', height: isMobile ? '38px' : '34px', borderRadius: '50%', backgroundColor: '#E31837', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '15px' : '13px', color: 'white', fontWeight: '700' }}>
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <div style={{ fontSize: isMobile ? '15px' : '13px', color: '#1a1a1a', fontWeight: '600' }}>{user?.fullName || 'Usuario'}</div>
                            <div style={{ fontSize: isMobile ? '12px' : '11px', color: '#999' }}>{user?.roles?.[0] || 'Empleado'}</div>
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate('/login'); }}
                            style={{
                                width: '100%', padding: isMobile ? '11px' : '9px', backgroundColor: 'transparent',
                                color: '#E31837', border: '2px solid #FFE0E0', borderRadius: '8px',
                                cursor: 'pointer', fontSize: isMobile ? '14px' : '12px', fontWeight: '600', fontFamily: 'inherit',
                            }}>
                        Cerrar sesion
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div style={{
                flex: 1,
                marginLeft: sidebarOpen ? (isMobile ? '260px' : '230px') : '0px',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: 0,
            }}>

                {/* Header */}
                <header style={{
                    backgroundColor: 'white', padding: isMobile ? '0 14px' : '0 24px', height: isMobile ? '56px' : '60px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #EEEEEE', position: 'sticky', top: 0, zIndex: 50,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Boton hamburguesa */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: isMobile ? '22px' : '18px', color: '#333', padding: '6px',
                                display: 'flex', alignItems: 'center',
                            }}>
                            {sidebarOpen ? '✕' : '☰'}
                        </button>
                        <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '800', color: '#E31837', letterSpacing: '-0.3px' }}>
              TIENDA JHONATAN
            </span>
                    </div>
                    <div style={{ fontSize: isMobile ? '11px' : '12px', color: '#999', fontWeight: '500' }}>
                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                </header>

                {/* Contenido */}
                <div style={{ padding: isMobile ? '12px' : '24px' }}>
                    <PageTransition key={location.pathname}>
                        {children}
                    </PageTransition>
                </div>
            </div>
        </div>
    );
}

export default Layout;