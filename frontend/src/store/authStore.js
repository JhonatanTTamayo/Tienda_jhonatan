import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    // Estado
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,

    // Acción: Iniciar sesión
    login: async (username, password) => {
        set({ loading: true, error: null });
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token, user } = response.data;

            // Guardar en localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            // Actualizar estado
            set({
                token,
                user,
                isAuthenticated: true,
                loading: false,
                error: null,
            });

            return true;
        } catch (error) {
            set({
                loading: false,
                error: error.response?.data?.message || 'Error al iniciar sesión',
            });
            return false;
        }
    },

    // Acción: Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
        });
    },

    // Acción: Limpiar errores
    clearError: () => set({ error: null }),
}));

export default useAuthStore;