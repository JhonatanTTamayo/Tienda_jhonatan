import { useState, useEffect, useRef } from 'react';
import creditNoteService from '../services/creditNoteService';
import customerService from '../services/customerService';
import Skeleton from '../components/Skeleton';
import { sendInvoiceToWhatsApp } from '../services/whatsappService';
import { playRegisterSound, playSuccessSound } from '../services/soundService';

function Fiados() {
    const [activeTab, setActiveTab] = useState('new');
    const [customers, setCustomers] = useState([]);
    const [creditNotes, setCreditNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [description, setDescription] = useState('');

    const [selectedClientAccount, setSelectedClientAccount] = useState(null);
    const [clientCreditNotes, setClientCreditNotes] = useState([]);
    const [totalClientDebt, setTotalClientDebt] = useState(0);
    const [paymentAmount, setPaymentAmount] = useState('');

    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const loaded = useRef(false);

    useEffect(() => {
        if (!loaded.current) { loadData(); loaded.current = true; }
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [custData, notesData] = await Promise.all([customerService.getActive(), creditNoteService.getAll()]);
            setCustomers(custData);
            setCreditNotes(notesData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const refreshData = async () => {
        try { const notesData = await creditNoteService.getAll(); setCreditNotes(notesData); }
        catch (err) { console.error(err); }
    };

    const loadClientAccount = async (customerId) => {
        setLoadingAccount(true);
        setActiveTab('account');
        try {
            const [notesData, custData] = await Promise.all([creditNoteService.getAll(), customerService.getById(customerId)]);
            setSelectedClientAccount(custData);
            const clientNotes = notesData.filter(n => n.customerId === customerId);
            setClientCreditNotes(clientNotes);
            const total = clientNotes.filter(n => n.status !== 'PAID').reduce((sum, n) => sum + (n.pendingBalance || 0), 0);
            setTotalClientDebt(total);
        } catch (err) { console.error(err); }
        finally { setLoadingAccount(false); }
    };

    const handleCreate = async () => {
        if (!selectedCustomerId) { alert('Seleccione un cliente'); return; }
        const amount = parseFloat(totalAmount);
        if (!amount || amount <= 0) { alert('Ingrese un monto valido'); return; }
        const user = JSON.parse(localStorage.getItem('user'));
        setSaving(true);
        try {
            await creditNoteService.create({ customerId: selectedCustomerId, sellerId: user.id, totalAmount: amount, description: description || 'Fiado' });
            playRegisterSound();
            setSuccessMessage(`Fiado por ${formatMoney(amount)} registrado`);
            setSelectedCustomerId(''); setTotalAmount(''); setDescription('');
            refreshData();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'No se pudo registrar')); }
        finally { setSaving(false); }
    };

    const handlePayFromAccount = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) { alert('Ingrese un monto'); return; }
        setSaving(true);
        try {
            const pendingNotes = clientCreditNotes.filter(n => n.status !== 'PAID').sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            let remaining = parseFloat(paymentAmount);
            const paidNotes = [];
            for (const note of pendingNotes) {
                if (remaining <= 0) break;
                const toPay = Math.min(remaining, note.pendingBalance);
                await creditNoteService.addPayment(note.id, { amount: toPay, paymentMethod: 'EFECTIVO' });
                paidNotes.push({ ...note, paid: toPay });
                remaining -= toPay;
            }
            playSuccessSound();
            setInvoiceData({ clientName: selectedClientAccount.fullName, clientPhone: selectedClientAccount.phone, amount: parseFloat(paymentAmount), notes: paidNotes, date: new Date() });
            setShowInvoice(true);
            setPaymentAmount('');
            await loadClientAccount(selectedClientAccount.id);
        } catch (err) { alert('Error: ' + (err.response?.data?.message || 'No se pudo registrar')); }
        finally { setSaving(false); }
    };

    const handleSendWhatsApp = () => {
        if (invoiceData && invoiceData.clientPhone) {
            sendInvoiceToWhatsApp(invoiceData.clientPhone, invoiceData);
            setShowInvoice(false);
        } else {
            alert('Este cliente no tiene numero de telefono registrado');
        }
    };

    const formatMoney = (v) => '$' + (v ? Number(v).toLocaleString('es-CO') : '0');
    const soloNumeros = (val) => val.replace(/[^0-9]/g, '');

    if (loading) return <div style={containerStyle(isMobile)}><Skeleton type="form" /></div>;

    return (
        <div style={containerStyle(isMobile)}>

            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Fiados</h1>
            </div>

            {successMessage && (
                <div style={{ backgroundColor: '#F0FFF4', border: '2px solid #D0FFE0', color: '#00A650', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', fontSize: '12px', fontWeight: '600', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                    ✓ {successMessage}
                </div>
            )}

            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', justifyContent: 'center' }}>
                <button onClick={() => { setActiveTab('new'); setSelectedClientAccount(null); }} style={tabStyle(activeTab === 'new', isMobile)}>
                    {isMobile ? '📝 Fiado' : '📝 Nuevo Fiado'}
                </button>
                <button onClick={() => setActiveTab('search')} style={tabStyle(activeTab === 'search' || activeTab === 'account', isMobile)}>
                    {isMobile ? '🔍 Cuenta' : '🔍 Cuenta Cliente'}
                </button>
            </div>

            <div style={{
                backgroundColor: 'white', borderRadius: '12px', border: '1px solid #EEEEEE',
                padding: isMobile ? '12px' : '18px',
                minHeight: isMobile ? 'auto' : '460px',
                maxHeight: isMobile ? 'none' : 'calc(100vh - 220px)',
                overflow: isMobile ? 'visible' : 'hidden',
                display: 'flex', flexDirection: 'column',
            }}>

                {activeTab === 'new' && (
                    <div style={{ animation: 'fadeInUp 0.3s ease', maxWidth: isMobile ? '100%' : '400px', margin: '0 auto', width: '100%' }}>
                        <h2 style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: '700', color: '#1a1a1a', marginBottom: '10px', textAlign: 'center' }}>
                            Registrar nuevo fiado
                        </h2>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Cliente</label>
                            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} style={selectStyle(isMobile)}>
                                <option value="">Seleccionar cliente...</option>
                                {customers.map(c => (<option key={c.id} value={c.id}>{c.fullName}</option>))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={labelStyle}>Valor del fiado</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontSize: '16px', fontWeight: '700', zIndex: 1, pointerEvents: 'none' }}>$</span>
                                <input type="text" inputMode="numeric" placeholder="0" value={totalAmount}
                                       onChange={(e) => setTotalAmount(soloNumeros(e.target.value))}
                                       style={{ width: '100%', padding: isMobile ? '12px 12px 12px 30px' : '14px 14px 14px 34px', border: '2px solid #EEEEEE', borderRadius: '10px', fontSize: isMobile ? '22px' : '26px', fontWeight: '800', fontFamily: "'Baloo 2', system-ui, sans-serif", boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
                                       autoFocus />
                            </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={labelStyle}>Descripcion</label>
                            <input type="text" placeholder="Ej: Arroz, aceite, mercado" value={description}
                                   onChange={(e) => setDescription(e.target.value)} style={inputStyle(isMobile)} />
                        </div>

                        <button onClick={handleCreate} disabled={saving}
                                style={{ width: '100%', padding: isMobile ? '12px' : '14px', borderRadius: '10px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', backgroundColor: saving ? '#FFB3B3' : '#E31837', color: 'white', boxShadow: saving ? 'none' : '0 4px 16px rgba(227,24,55,0.3)' }}>
                            {saving ? 'Registrando...' : 'Registrar Fiado'}
                        </button>
                    </div>
                )}

                {(activeTab === 'search' || activeTab === 'account') && (
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '8px' : '14px', flex: 1, overflow: isMobile ? 'visible' : 'hidden', animation: 'fadeIn 0.3s ease' }}>

                        <div style={{ width: isMobile ? '100%' : '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <select value={selectedClientAccount?.id || ''} onChange={(e) => { if (e.target.value) loadClientAccount(e.target.value); }} style={selectStyle(isMobile)}>
                                <option value="">Seleccionar cliente...</option>
                                {customers.map(c => (<option key={c.id} value={c.id}>{c.fullName}</option>))}
                            </select>

                            {loadingAccount && (
                                <div style={{ backgroundColor: '#FAFAFA', borderRadius: '8px', padding: '14px' }}>
                                    <div style={{ height: '14px', backgroundColor: '#f0f0f0', borderRadius: '6px', width: '70%', margin: '0 auto 6px', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                                    <div style={{ height: '26px', backgroundColor: '#f0f0f0', borderRadius: '8px', width: '50%', margin: '0 auto', animation: 'shimmer 1.5s infinite', backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)' }} />
                                </div>
                            )}

                            {!loadingAccount && selectedClientAccount && (
                                <>
                                    <div style={{ backgroundColor: '#E31837', borderRadius: '10px', padding: isMobile ? '12px' : '16px', color: 'white', textAlign: 'center' }}>
                                        <div style={{ fontSize: '11px', opacity: 0.9 }}>{selectedClientAccount.fullName}</div>
                                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '3px' }}>Deuda pendiente</div>
                                        <div style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800' }}>{formatMoney(totalClientDebt)}</div>
                                    </div>

                                    {totalClientDebt > 0 && (
                                        <div style={{ display: 'flex', gap: '6px', flexDirection: isMobile ? 'column' : 'row' }}>
                                            <div style={{ flex: 1, position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#999', fontWeight: '700', zIndex: 1, pointerEvents: 'none', fontSize: '12px' }}>$</span>
                                                <input type="text" inputMode="numeric" placeholder="0" value={paymentAmount}
                                                       onChange={(e) => setPaymentAmount(soloNumeros(e.target.value))}
                                                       style={{ width: '100%', padding: '9px 8px 9px 20px', border: '2px solid #EEEEEE', borderRadius: '8px', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }} />
                                            </div>
                                            <button onClick={handlePayFromAccount} disabled={saving}
                                                    style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '700', fontFamily: 'inherit', backgroundColor: saving ? '#ccc' : '#00A650', color: 'white', whiteSpace: 'nowrap' }}>
                                                {saving ? '...' : '💵 Pagar'}
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div style={{ flex: 1, overflowY: isMobile ? 'visible' : 'auto', maxHeight: isMobile ? 'none' : '380px' }}>
                            {!selectedClientAccount && !loadingAccount && (
                                <div style={{ textAlign: 'center', color: '#ccc', paddingTop: isMobile ? '20px' : '50px' }}>
                                    <div style={{ fontSize: isMobile ? '28px' : '40px', marginBottom: '6px' }}>👤</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>Selecciona un cliente para ver su cuenta</div>
                                </div>
                            )}

                            {!loadingAccount && selectedClientAccount && clientCreditNotes.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#999', paddingTop: '20px', fontSize: '12px' }}>No hay fiados registrados</div>
                            )}

                            {!loadingAccount && selectedClientAccount && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {clientCreditNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(note => (
                                        <div key={note.id} style={{ border: '1px solid #EEEEEE', borderRadius: '8px', overflow: 'hidden', backgroundColor: note.status === 'PAID' ? '#FAFAFA' : '#FFF5F5' }}>
                                            <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                                                <div style={{ flex: 1, minWidth: '80px' }}>
                                                    <div style={{ fontWeight: '700', fontSize: '12px' }}>{note.description || 'Fiado'}</div>
                                                    <div style={{ fontSize: '9px', color: '#999' }}>{note.createdAt ? new Date(note.createdAt).toLocaleDateString('es-CO') : ''}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '12px' }}>{formatMoney(note.totalAmount)}</span>
                                                    <span style={{ padding: '2px 6px', borderRadius: '5px', fontSize: '9px', fontWeight: '700', backgroundColor: note.status === 'PAID' ? '#F0FFF4' : note.status === 'PARTIALLY_PAID' ? '#FFF8E1' : '#FFF5F5', color: note.status === 'PAID' ? '#00A650' : note.status === 'PARTIALLY_PAID' ? '#E65100' : '#E31837' }}>
                            {note.status === 'PAID' ? 'Pagado' : note.status === 'PARTIALLY_PAID' ? 'Parcial' : 'Pendiente'}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showInvoice && invoiceData && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', animation: 'fadeIn 0.2s ease' }} onClick={() => setShowInvoice(false)}>
                    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: isMobile ? '18px' : '24px', maxWidth: '380px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: "'Baloo 2', system-ui, sans-serif" }} onClick={(e) => e.stopPropagation()}>

                        <div style={{ textAlign: 'center', borderBottom: '2px dashed #EEEEEE', paddingBottom: '12px', marginBottom: '12px' }}>
                            <div style={{ fontWeight: '800', fontSize: isMobile ? '18px' : '20px', color: '#E31837' }}>TIENDA JHONATAN</div>
                            <div style={{ backgroundColor: '#00A650', color: 'white', display: 'inline-block', padding: '5px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginTop: '10px' }}>✓ PAGO REGISTRADO</div>
                            <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>{invoiceData.date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase' }}>Cliente</div>
                            <div style={{ fontSize: '15px', fontWeight: '700' }}>{invoiceData.clientName}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '10px', color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Fiados abonados</div>
                            {invoiceData.notes.map((note, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F5F5F5', fontSize: '12px' }}>
                                    <span style={{ color: '#666' }}>{note.description || 'Fiado'}</span>
                                    <span style={{ fontWeight: '600', color: '#00A650' }}>{formatMoney(note.paid)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ backgroundColor: '#F0FFF4', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '2px solid #D0FFE0', marginBottom: '8px' }}>
                            <div style={{ fontSize: '10px', color: '#666', fontWeight: '600' }}>TOTAL PAGADO</div>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: '#00A650' }}>{formatMoney(invoiceData.amount)}</div>
                        </div>

                        {totalClientDebt > 0 && (
                            <div style={{ backgroundColor: '#FFF5F5', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #FFE0E0', marginBottom: '10px' }}>
                                <div style={{ fontSize: '10px', color: '#666' }}>Saldo pendiente</div>
                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#E31837' }}>{formatMoney(totalClientDebt)}</div>
                            </div>
                        )}

                        <button onClick={handleSendWhatsApp}
                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit', backgroundColor: '#25D366', color: 'white', marginBottom: '6px' }}>
                            📱 Enviar por WhatsApp
                        </button>
                        <button onClick={() => setShowInvoice(false)}
                                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px solid #EEEEEE', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'inherit', backgroundColor: 'white', color: '#666' }}>
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const containerStyle = (isMobile) => ({ maxWidth: '100%', margin: '0 auto', padding: isMobile ? '6px' : '0' });
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#333', marginBottom: '4px' };
const inputStyle = (isMobile) => ({ width: '100%', padding: isMobile ? '10px 12px' : '12px 14px', border: '2px solid #EEEEEE', borderRadius: '8px', fontSize: '13px', fontFamily: "'Baloo 2', system-ui, sans-serif", boxSizing: 'border-box', outline: 'none', fontWeight: '500' });
const selectStyle = (isMobile) => ({ ...inputStyle(isMobile), cursor: 'pointer', backgroundColor: 'white', appearance: 'none', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23999' strokeWidth='2' strokeLinecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '32px' });
const tabStyle = (active, isMobile) => ({ padding: isMobile ? '7px 12px' : '9px 18px', borderRadius: '8px', border: active ? '2px solid #E31837' : '2px solid #EEEEEE', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: active ? '700' : '500', fontFamily: 'inherit', backgroundColor: active ? '#FFF5F5' : 'white', color: active ? '#E31837' : '#666', transition: 'all 0.2s' });

export default Fiados;