import { BASE_URL } from '../api/config';

/**
 * Service to handle all calculation related API calls
 */
export const calculatorService = {
    /**
     * Get JWT Token
     */
    async login(username, password) {
        const response = await fetch(`${BASE_URL}/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    /**
     * Calculate GEC Water Balance
     */
    async calculateGEC(data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/calculate/gec/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'GEC Calculation failed');
        }
        return response.json();
    },

    /**
     * Calculate Water Utilization metrics
     */
    async calculateUtilization(data, action) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/calculate/utilization/?action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Utilization Calculation failed');
        }
        return response.json();
    }
};
