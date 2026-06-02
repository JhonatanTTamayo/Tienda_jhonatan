import { useState, useEffect } from 'react';
import customerService from '../services/customerService';
import Skeleton from '../components/Skeleton';
import Avatar from '../components/Avatar';

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [fullName, setFullName] = useState('');
    const [document, setDocument] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        loadCustomers();
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadCustomers = async (search = '') => {
        try { setLoading(true); setError(null);
            const data = search ? await customerService.search(search) : await customerService.getAll();
            setCustomers(data);
        } catch (err) { setError('Error al cargar clientes'); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); loadCustomers(searchTerm); };
    const resetForm = () => { setFullName(''); setDocument(''); setPhone(''); setAddress(''); setEditingCustomer(null); setShowForm(false); };

    const handleEdit = (customer) => {
        setEditingCustomer(customer); setFullName(customer.fullName);
        setDocument(customer.document || ''); setPhone(customer.phone || '');
        setAddress(customer.address || ''); setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); if (!fullName.trim()) return;
        setSaving(true);
        try {
            const customerData = { fullName, document, phone, address };
            if (editingCustomer) { await customerService.update(editingCustomer.id, customerData); setSuccessMessage('Cliente actualizado'); }
            else { await customerService.create(customerData); setSuccessMessage('Cliente creado'); }
            resetForm(); loadCustomers(searchTerm); setTimeout(() => setSuccessMessage(''), 2500);
        } catch (err) { alert('Error al guardar'); }
        finally { setSaving(false); }
    };

    const handleDeactivate = async (id, name) => {
        if (!window.confirm('Desactivar a "' + name + '"?')) return;
        try { await customerService.deactivate(id); setSuccessMessage('Cliente desactivado'); loadCustomers(searchTerm); setTimeout(() => setSuccessMessage(''), 2500); }
        catch { alert('Error al desactivar'); }
    };

    const handleActivate = async (id) => {
        try { await customerService.activate(id); setSuccessMessage('Cliente activado'); loadCustomers(searchTerm); setTimeout(() => setSuccessMessage(''), 2500); }
        catch { alert('Error al activar'); }
    };

    if (loading) return <div style={container(isMobile)}><Skeleton type="table" /></div>;

    return (
        <div style={container(isMobile)}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '12px' : '18px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Clientes</h1>
                    <p style={{ fontSize: '12px', color: '#999', margin: '2px 0 0' }}>{customers.length} cliente{customers.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} style={btnPrimary(isMobile, showForm)}>
                    {showForm ? '✕ Cancelar' : '+ Nuevo cliente'}
                </button>
            </div>

            {successMessage && <div style={successBox}>✓ {successMessage}</div>}

            {showForm && (
                <div style={formBox(isMobile)}>
                    <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px', textAlign: 'center' }}>
                        {editingCustomer ? '✏️ Editar cliente' : '👤 Nuevo cliente'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Nombre completo *</label>
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Ej: Juan Perez" style={inputStyle(isMobile)} autoFocus />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div><label style={labelStyle}>Documento</label><input type="text" value={document} onChange={(e) => setDocument(e.target.value)} placeholder="Ej: 12345678" style={inputStyle(isMobile)} /></div>
                            <div><label style={labelStyle}>Telefono</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej: 3001234567" style={inputStyle(isMobile)} /></div>
                        </div>
                        <div style={{ marginBottom: '14px' }}>
                            <label style={labelStyle}>Direccion</label>
                            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Calle 123 #45-67" style={inputStyle(isMobile)} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row' }}>
                            <button type="submit" disabled={saving} style={btnSave(isMobile, saving)}>{saving ? 'Guardando...' : editingCustomer ? 'Actualizar' : 'Guardar'}</button>
                            <button type="button" onClick={resetForm} style={btnCancel(isMobile)}>Cancelar</button>
                        </div>
                    </form>
                </div>
            )}

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="🔍 Buscar por nombre..." style={{ ...inputStyle(isMobile), flex: 1, minWidth: '150px' }} />
                <button type="submit" style={btnSmall('#1a1a1a', 'white')}>Buscar</button>
                {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); loadCustomers(); }} style={btnSmall('white', '#666')}>Limpiar</button>}
            </form>

            {error && <div style={errorBox}>{error}</div>}

            {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {customers.length === 0 ? <div style={emptyBox}>No hay clientes</div> : customers.map(customer => (
                        <div key={customer.id} style={cardStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar name={customer.fullName} size={40} fontSize={16} />
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '14px' }}>{customer.fullName}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>{customer.document || 'Sin documento'}</div>
                                        <div style={{ fontSize: '11px', color: '#999' }}>{customer.phone || 'Sin telefono'}</div>
                                    </div>
                                </div>
                                <span style={{ padding: '3px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', backgroundColor: customer.status === 'ACTIVE' ? '#F0FFF4' : '#FFF5F5', color: customer.status === 'ACTIVE' ? '#00A650' : '#E31837' }}>
                  {customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                <button onClick={() => handleEdit(customer)} style={btnCard('#E31837')}>Editar</button>
                                {customer.status === 'ACTIVE' ? <button onClick={() => handleDeactivate(customer.id, customer.fullName)} style={btnCard('#999')}>Desactivar</button> : <button onClick={() => handleActivate(customer.id)} style={btnCard('#00A650')}>Activar</button>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #EEEEEE' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                        <tr style={{ borderBottom: '2px solid #F0F0F0' }}>
                            <th style={thStyle}>Cliente</th>
                            <th style={thStyle}>Documento</th>
                            <th style={thStyle}>Telefono</th>
                            <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.length === 0 ? <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>No hay clientes</td></tr> : customers.map(customer => (
                            <tr key={customer.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                <td style={{ ...tdStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar name={customer.fullName} size={32} fontSize={13} />
                                    {customer.fullName}
                                </td>
                                <td style={{ ...tdStyle, color: '#666' }}>{customer.document || '—'}</td>
                                <td style={{ ...tdStyle, color: '#666' }}>{customer.phone || '—'}</td>
                                <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', backgroundColor: customer.status === 'ACTIVE' ? '#F0FFF4' : '#FFF5F5', color: customer.status === 'ACTIVE' ? '#00A650' : '#E31837' }}>
                      {customer.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                    </span>
                                </td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <button onClick={() => handleEdit(customer)} style={btnTable('#E31837')}>Editar</button>
                                    {customer.status === 'ACTIVE' ? <button onClick={() => handleDeactivate(customer.id, customer.fullName)} style={btnTable('#999')}>Desactivar</button> : <button onClick={() => handleActivate(customer.id)} style={btnTable('#00A650')}>Activar</button>}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

const container = (m) => ({ maxWidth: '100%', margin: '0 auto', padding: m ? '4px' : '0' });
const successBox = { backgroundColor: '#F0FFF4', border: '2px solid #D0FFE0', color: '#00A650', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', fontWeight: '600', textAlign: 'center', animation: 'fadeIn 0.3s ease' };
const errorBox = { backgroundColor: '#FFF5F5', border: '2px solid #FFE0E0', color: '#E31837', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', fontWeight: '600', textAlign: 'center' };
const emptyBox = { backgroundColor: 'white', borderRadius: '10px', padding: '24px', textAlign: 'center', color: '#999', fontSize: '13px', border: '1px solid #EEEEEE' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px' };
const inputStyle = (m) => ({ width: '100%', padding: m ? '10px 12px' : '11px 14px', border: '2px solid #EEEEEE', borderRadius: '8px', fontSize: '13px', fontFamily: "'Baloo 2', system-ui, sans-serif", boxSizing: 'border-box', outline: 'none', fontWeight: '500' });
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '14px 16px', color: '#1a1a1a', fontWeight: '600' };
const btnPrimary = (m, active) => ({ padding: m ? '8px 14px' : '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', backgroundColor: active ? '#F5F5F5' : '#E31837', color: active ? '#666' : 'white', whiteSpace: 'nowrap' });
const btnSave = (m, saving) => ({ flex: 1, padding: m ? '12px' : '11px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', backgroundColor: saving ? '#FFB3B3' : '#E31837', color: 'white' });
const btnCancel = (m) => ({ flex: 1, padding: m ? '12px' : '11px', borderRadius: '8px', border: '2px solid #EEEEEE', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', backgroundColor: 'white', color: '#666' });
const btnSmall = (bg, color) => ({ padding: '8px 14px', borderRadius: '8px', border: bg === 'white' ? '2px solid #EEEEEE' : 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit', backgroundColor: bg, color, whiteSpace: 'nowrap' });
const btnTable = (color) => ({ padding: '5px 12px', borderRadius: '6px', border: '2px solid #F0F0F0', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit', backgroundColor: 'white', color, marginLeft: '5px' });
const btnCard = (color) => ({ padding: '6px 12px', borderRadius: '6px', border: '1px solid #EEEEEE', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit', backgroundColor: 'white', color });
const formBox = (m) => ({ backgroundColor: 'white', borderRadius: '12px', padding: m ? '16px' : '20px', marginBottom: '14px', border: '1px solid #EEEEEE', animation: 'fadeInUp 0.3s ease', maxWidth: '550px', margin: '0 auto 14px' });
const cardStyle = { backgroundColor: 'white', borderRadius: '10px', padding: '12px 14px', border: '1px solid #EEEEEE' };

export default Customers;