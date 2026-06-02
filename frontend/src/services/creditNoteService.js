import api from './api';

const creditNoteService = {
    getAll: async () => {
        const response = await api.get('/credit-notes');
        return response.data;
    },

    getPending: async () => {
        const response = await api.get('/credit-notes/pending');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/credit-notes/${id}`);
        return response.data;
    },

    getByCustomer: async (customerId) => {
        const response = await api.get(`/credit-notes/customer/${customerId}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/credit-notes', data);
        return response.data;
    },

    addPayment: async (creditNoteId, paymentData) => {
        const response = await api.post(`/credit-notes/${creditNoteId}/payments`, paymentData);
        return response.data;
    },

    getPayments: async (creditNoteId) => {
        const response = await api.get(`/credit-notes/${creditNoteId}/payments`);
        return response.data;
    },

    getDailyReport: async () => {
        const response = await api.get('/credit-notes/reports/daily');
        return response.data;
    },
};

export default creditNoteService;