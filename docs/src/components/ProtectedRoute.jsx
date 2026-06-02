import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        // Si no está autenticado, redirigir al login
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, mostrar el contenido protegido
    return children;
}

export default ProtectedRoute;