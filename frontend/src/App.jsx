import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Fiados from './pages/Fiados';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AutoLogout from './components/AutoLogout';

function App() {
    return (
        <BrowserRouter>
            <AutoLogout />
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/dashboard" element={
                    <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
                } />

                <Route path="/customers" element={
                    <ProtectedRoute><Layout><Customers /></Layout></ProtectedRoute>
                } />

                <Route path="/products" element={
                    <ProtectedRoute><Layout><Products /></Layout></ProtectedRoute>
                } />

                <Route path="/fiados" element={
                    <ProtectedRoute><Layout><Fiados /></Layout></ProtectedRoute>
                } />

                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="*" element={
                    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5', fontFamily: "'Baloo 2', system-ui, sans-serif" }}>
                        <div style={{ textAlign: 'center' }}>
                            <h1 style={{ fontSize: '80px', fontWeight: '800', color: '#E31837', margin: 0 }}>404</h1>
                            <p style={{ color: '#666', fontSize: '16px' }}>Pagina no encontrada</p>
                            <button onClick={() => window.location.href = '/dashboard'}
                                    style={{ marginTop: '12px', padding: '10px 24px', backgroundColor: '#E31837', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', fontFamily: 'inherit' }}>
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;