import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import creditNoteService from '../services/creditNoteService';
import customerService from '../services/customerService';
import Skeleton from '../components/Skeleton';

function Dashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [recentNotes, setRecentNotes] = useState([]);
    const [topDebtors, setTopDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        loadData();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [report, customers, notes] = await Promise.all([creditNoteService.getDailyReport(), customerService.getActive(), creditNoteService.getAll()]);
            setStats({ fiadoHoy: report.totalFiadoHoy || 0, recuperadoHoy: report.totalRecuperadoHoy || 0, pendiente: report.totalPendiente || 0, clientes: customers.length });
            setRecentNotes(notes.filter(n => n.status !== 'PAID').slice(0, 6));
            const debtorMap = {};
            notes.filter(n => n.status !== 'PAID').forEach(n => {
                if (!debtorMap[n.customerId]) debtorMap[n.customerId] = { customerId: n.customerId, total: 0, count: 0 };
                debtorMap[n.customerId].total += n.pendingBalance;
                debtorMap[n.customerId].count += 1;
            });
            const list = await Promise.all(Object.values(debtorMap).sort((a,b) => b.total - a.total).slice(0,5).map(async d => {
                try { const c = await customerService.getById(d.customerId); return { name: c.fullName, total: d.total, count: d.count }; }
                catch { return { name: 'Desconocido', total: d.total, count: d.count }; }
            }));
            setTopDebtors(list);
        } catch(err) { console.error(err); }
        finally { setLoading(false); }
    };

    const formatMoney = (v) => '$' + (v ? Number(v).toLocaleString('es-CO') : '0');

    if (loading) return <div style={{ maxWidth: '100%', padding: isMobile ? '8px' : '0' }}><Skeleton type="card" /></div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '4px' : '0', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Saludo */}
            <div style={{ textAlign: 'center', marginBottom: '10px', flexShrink: 0 }}>
                <h1 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: '#1a1a1a', margin: '0 0 2px' }}>Hola, {user?.fullName?.split(' ')[0]}!</h1>
                <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>

            {/* Boton principal */}
            <div onClick={() => navigate('/fiados')} style={{ backgroundColor: '#E31837', borderRadius: '12px', padding: isMobile ? '14px' : '18px', cursor: 'pointer', marginBottom: '10px', textAlign: 'center', boxShadow: '0 4px 20px rgba(227,24,55,0.25)', flexShrink: 0 }}
                 onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                 onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: 'white' }}>📝 Registrar nuevo fiado</div>
            </div>

            {/* Mini stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px', flexShrink: 0 }}>
                <MiniStat label="Pendiente" value={formatMoney(stats.pendiente)} color="#E31837" onClick={() => navigate('/fiados')} isMobile={isMobile} />
                <MiniStat label="Hoy fiado" value={formatMoney(stats.fiadoHoy)} color="#0066FF" onClick={() => navigate('/fiados')} isMobile={isMobile} />
                <MiniStat label="Recuperado" value={formatMoney(stats.recuperadoHoy)} color="#00A650" onClick={() => navigate('/fiados')} isMobile={isMobile} />
                <MiniStat label="Clientes" value={stats.clientes} color="#1a1a1a" onClick={() => navigate('/customers')} isMobile={isMobile} />
            </div>

            {/* Listas con scroll */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>

                <div>
                    <div style={sectionTitle}>Pendientes</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {recentNotes.length === 0 ? <div style={emptyCard}>No hay pendientes 🎉</div> :
                            recentNotes.map(note => (
                                <div key={note.id} style={listItem}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={listTitle}>{note.description || 'Fiado'}</div>
                                        <div style={{ fontSize: '9px', color: '#999' }}>{note.createdAt ? new Date(note.createdAt).toLocaleDateString('es-CO') : ''}</div>
                                    </div>
                                    <span style={listAmount}>{formatMoney(note.pendingBalance)}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div>
                    <div style={sectionTitle}>Mayor deuda</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {topDebtors.length === 0 ? <div style={emptyCard}>Sin deudas</div> :
                            topDebtors.map((d, i) => (
                                <div key={i} style={listItem}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#999' }}>#{i+1}</span>
                                        <span style={listTitle}>{d.name}</span>
                                    </div>
                                    <span style={listAmount}>{formatMoney(d.total)}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

const MiniStat = ({ label, value, color, onClick, isMobile }) => (
    <div onClick={onClick} style={{ backgroundColor: 'white', borderRadius: '8px', padding: isMobile ? '8px 10px' : '10px 12px', cursor: 'pointer', border: '1px solid #EEEEEE', textAlign: 'center' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', color: '#999', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color }}>{value}</div>
    </div>
);

const sectionTitle = { fontSize: '12px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px', position: 'sticky', top: 0, backgroundColor: '#F5F5F5', padding: '2px 0', zIndex: 1 };
const emptyCard = { backgroundColor: 'white', borderRadius: '8px', padding: '14px', textAlign: 'center', color: '#999', fontSize: '11px', border: '1px solid #EEEEEE' };
const listItem = { backgroundColor: 'white', borderRadius: '8px', padding: '8px 10px', border: '1px solid #EEEEEE', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' };
const listTitle = { fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const listAmount = { fontWeight: '700', fontSize: '12px', color: '#E31837', flexShrink: 0 };

export default Dashboard;