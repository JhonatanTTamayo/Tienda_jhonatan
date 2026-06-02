import { useState, useEffect } from 'react';
import productService from '../services/productService';
import Skeleton from '../components/Skeleton';

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('all');

    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [salePrice, setSalePrice] = useState('');
    const [stock, setStock] = useState('');
    const [minimumStock, setMinimumStock] = useState('5');

    useEffect(() => {
        loadProducts();
    }, [filter]);

    const loadProducts = async (search = '') => {
        try {
            setLoading(true);
            setError(null);
            let data;
            if (filter === 'low') {
                data = await productService.getLowStock();
            } else if (filter === 'out') {
                data = await productService.getOutOfStock();
            } else if (search) {
                data = await productService.search(search);
            } else {
                data = await productService.getActive();
            }
            setProducts(data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadProducts(searchTerm);
    };

    const resetForm = () => {
        setCode('');
        setName('');
        setPurchasePrice('');
        setSalePrice('');
        setStock('');
        setMinimumStock('5');
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setCode(product.code);
        setName(product.name);
        setPurchasePrice(product.purchasePrice?.toString() || '');
        setSalePrice(product.salePrice?.toString() || '');
        setStock(product.stock?.toString() || '0');
        setMinimumStock(product.minimumStock?.toString() || '5');
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code || !name || !salePrice) {
            alert('Complete los campos requeridos');
            return;
        }

        setSaving(true);
        try {
            const productData = {
                code,
                name,
                purchasePrice: parseFloat(purchasePrice) || 0,
                salePrice: parseFloat(salePrice),
                stock: parseInt(stock) || 0,
                minimumStock: parseInt(minimumStock) || 5,
            };

            if (editingProduct) {
                await productService.update(editingProduct.id, productData);
                setSuccessMessage('Producto actualizado');
            } else {
                await productService.create(productData);
                setSuccessMessage('Producto creado');
            }

            resetForm();
            loadProducts(searchTerm);
            setTimeout(() => setSuccessMessage(''), 2500);
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'No se pudo guardar'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, productName) => {
        if (!window.confirm('Eliminar "' + productName + '"?')) return;
        try {
            await productService.delete(id);
            setSuccessMessage('Producto eliminado');
            loadProducts(searchTerm);
            setTimeout(() => setSuccessMessage(''), 2500);
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    const formatMoney = (v) => '$' + (v ? Number(v).toLocaleString('es-CO') : '0');

    const soloNumeros = (val) => val.replace(/[^0-9]/g, '');

    const stockBadge = (stock, min) => {
        if (stock <= 0) return { text: 'Agotado', bg: '#fef2f2', color: '#E5484D' };
        if (stock <= min) return { text: 'Bajo: ' + stock, bg: '#fef3c7', color: '#D97706' };
        return { text: stock + ' und', bg: '#f0fdf4', color: '#00A86B' };
    };

    if (loading) {
        return (
            <div style={{ maxWidth: '1100px' }}>
                <Skeleton type="table" />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1100px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#171717', margin: 0 }}>Productos</h1>
                    <p style={{ fontSize: '13px', color: '#737373', margin: '2px 0 0' }}>{products.length} producto{products.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }}
                        style={{ padding: '9px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit', backgroundColor: showForm ? '#e5e5e5' : '#0066FF', color: showForm ? '#171717' : 'white' }}>
                    {showForm ? 'Cancelar' : '+ Nuevo producto'}
                </button>
            </div>

            {successMessage && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#00A86B', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
                    {successMessage}
                </div>
            )}

            {showForm && (
                <div style={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#171717', marginBottom: '16px' }}>
                        {editingProduct ? 'Editar producto' : 'Nuevo producto'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={labelStyle}>Codigo *</label>
                                <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={labelStyle}>Nombre *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Precio compra</label>
                                <input type="text" inputMode="numeric" value={purchasePrice} onChange={(e) => setPurchasePrice(soloNumeros(e.target.value))} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Precio venta *</label>
                                <input type="text" inputMode="numeric" value={salePrice} onChange={(e) => setSalePrice(soloNumeros(e.target.value))} required style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Stock</label>
                                <input type="text" inputMode="numeric" value={stock} onChange={(e) => setStock(soloNumeros(e.target.value))} style={inputStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                            <button type="submit" disabled={saving}
                                    style={{ padding: '9px 24px', backgroundColor: saving ? '#ccc' : '#0066FF', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', fontFamily: 'inherit' }}>
                                {saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button type="button" onClick={resetForm}
                                    style={{ padding: '9px 18px', backgroundColor: 'transparent', color: '#737373', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar producto..."
                           style={{ ...inputStyle, flex: 1, maxWidth: '350px' }} />
                    <button type="submit" style={{ padding: '9px 16px', backgroundColor: '#171717', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Buscar</button>
                    {searchTerm && (
                        <button type="button" onClick={() => { setSearchTerm(''); loadProducts(); }}
                                style={{ padding: '9px 16px', backgroundColor: 'transparent', color: '#737373', border: '1px solid #e5e5e5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>Limpiar</button>
                    )}
                </form>
                <select value={filter} onChange={(e) => setFilter(e.target.value)}
                        style={{ padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', backgroundColor: 'white' }}>
                    <option value="all">Todos</option>
                    <option value="low">Stock bajo</option>
                    <option value="out">Agotados</option>
                </select>
            </div>

            {error && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#E5484D', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{error}</div>
            )}

            <div style={{ backgroundColor: 'white', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                    <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                        <th style={thStyle}>Codigo</th>
                        <th style={thStyle}>Producto</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Compra</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Venta</th>
                        <th style={{ ...thStyle, textAlign: 'center' }}>Stock</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>No hay productos</td></tr>
                    ) : (
                        products.map(product => {
                            const badge = stockBadge(product.stock, product.minimumStock);
                            return (
                                <tr key={product.id} style={{ borderBottom: '1px solid #f5f5f5' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                                    <td style={{ ...tdStyle, color: '#0066FF', fontWeight: '500' }}>{product.code}</td>
                                    <td style={tdStyle}>{product.name}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right', color: '#737373' }}>{formatMoney(product.purchasePrice)}</td>
                                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '500' }}>{formatMoney(product.salePrice)}</td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(product)}
                                                style={{ padding: '5px 12px', backgroundColor: 'transparent', color: '#0066FF', border: '1px solid #dbeafe', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', marginRight: '6px' }}>Editar</button>
                                        <button onClick={() => handleDelete(product.id, product.name)}
                                                style={{ padding: '5px 12px', backgroundColor: 'transparent', color: '#E5484D', border: '1px solid #fecaca', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit' }}>Eliminar</button>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '500', color: '#737373', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '9px 12px', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' };
const thStyle = { padding: '12px 14px', textAlign: 'left', fontSize: '11px', fontWeight: '500', color: '#737373', textTransform: 'uppercase' };
const tdStyle = { padding: '10px 14px', color: '#171717' };

export default Products;