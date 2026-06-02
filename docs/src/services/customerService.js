import api from './api';

const customerService = {
    getAll: async (params = {}) => {
        const response = await api.get('/customers', { params });
        return response.data;
    },
    getActive: async () => {
        const response = await api.get('/customers', { params: { status: 'ACTIVE' } });
        return response.data;
    },
    search: async (query) => {
        const response = await api.get('/customers', { params: { search: query } });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    },
    create: async (customerData) => {
        const response = await api.post('/customers', customerData);
        return response.data;
    },
    update: async (id, customerData) => {
        const response = await api.put(`/customers/${id}`, customerData);
        return response.data;
    },
    deactivate: async (id) => {
        const response = await api.patch(`/customers/${id}/deactivate`);
        return response.data;
    },
    activate: async (id) => {
        const response = await api.patch(`/customers/${id}/activate`);
        return response.data;
    },
};

export default customerService;