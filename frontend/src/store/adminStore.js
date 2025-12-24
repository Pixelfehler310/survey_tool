/**
 * Admin Store - Zustand store for admin authentication and data
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminStore = create(
    persist(
        (set, get) => ({
            // Auth state
            token: null,
            isAuthenticated: false,

            // Data state
            responses: [],
            stats: null,
            surveys: [],
            questionAnalysis: null,
            dropoffAnalysis: null,
            isLoading: false,
            error: null,

            // Pagination
            page: 1,
            pageSize: 20,
            totalCount: 0,

            // Filters
            filters: {
                survey_id: '',
                source: '',
                date_from: '',
                date_to: '',
            },

            // Auth actions
            login: async (username, password) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await fetch('/api/v1/admin/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({ username, password }),
                    });

                    if (!response.ok) {
                        throw new Error('Ungültige Anmeldedaten');
                    }

                    const data = await response.json();
                    set({ token: data.access_token, isAuthenticated: true, isLoading: false });
                    return true;
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                    return false;
                }
            },

            logout: () => {
                set({
                    token: null,
                    isAuthenticated: false,
                    responses: [],
                    stats: null,
                });
            },

            // API helpers
            authFetch: async (url, options = {}) => {
                const { token } = get();
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.status === 401) {
                    get().logout();
                    throw new Error('Sitzung abgelaufen');
                }

                return response;
            },

            // Data actions
            fetchResponses: async () => {
                const { authFetch, page, pageSize, filters } = get();
                set({ isLoading: true, error: null });

                try {
                    const params = new URLSearchParams({
                        skip: String((page - 1) * pageSize),
                        limit: String(pageSize),
                    });

                    if (filters.survey_id) params.append('survey_id', filters.survey_id);
                    if (filters.source) params.append('source', filters.source);
                    if (filters.date_from) params.append('date_from', filters.date_from);
                    if (filters.date_to) params.append('date_to', filters.date_to);

                    const response = await authFetch(`/api/v1/admin/responses?${params}`);
                    const data = await response.json();

                    set({
                        responses: data.items || [],
                        totalCount: data.total || 0,
                        isLoading: false,
                    });
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            fetchStats: async (surveyId) => {
                const { authFetch } = get();
                set({ isLoading: true, error: null });

                try {
                    const response = await authFetch(`/api/v1/admin/stats/${surveyId}`);
                    const data = await response.json();
                    set({ stats: data, isLoading: false });
                } catch (error) {
                    set({ error: error.message, isLoading: false });
                }
            },

            fetchSurveys: async () => {
                const { authFetch } = get();

                try {
                    const response = await authFetch('/api/v1/admin/surveys');
                    const data = await response.json();
                    set({ surveys: data.surveys || [] });
                } catch (error) {
                    console.error('Failed to fetch surveys:', error);
                }
            },

            fetchQuestionAnalysis: async (surveyId) => {
                const { authFetch } = get();
                set({ questionAnalysis: null });

                try {
                    const response = await authFetch(`/api/v1/admin/analytics/questions/${surveyId}`);
                    const data = await response.json();
                    set({ questionAnalysis: data });
                } catch (error) {
                    console.error('Failed to fetch question analysis:', error);
                }
            },

            fetchDropoffAnalysis: async (surveyId) => {
                const { authFetch } = get();
                set({ dropoffAnalysis: null });

                try {
                    const response = await authFetch(`/api/v1/admin/analytics/dropoff/${surveyId}`);
                    const data = await response.json();
                    set({ dropoffAnalysis: data });
                } catch (error) {
                    console.error('Failed to fetch dropoff analysis:', error);
                }
            },

            deleteResponse: async (responseId) => {
                const { authFetch, fetchResponses } = get();

                try {
                    const response = await authFetch(`/api/v1/admin/responses/${responseId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) throw new Error('Löschen fehlgeschlagen');

                    await fetchResponses();
                    return true;
                } catch (error) {
                    set({ error: error.message });
                    return false;
                }
            },

            exportData: async (format = 'json') => {
                const { authFetch, filters } = get();

                const params = new URLSearchParams({ format });
                if (filters.survey_id) params.append('survey_id', filters.survey_id);
                if (filters.date_from) params.append('date_from', filters.date_from);
                if (filters.date_to) params.append('date_to', filters.date_to);

                const response = await authFetch(`/api/v1/admin/responses/export?${params}`);

                if (format === 'csv') {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `responses_${new Date().toISOString().split('T')[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    const data = await response.json();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `responses_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            },

            // Pagination
            setPage: (page) => set({ page }),
            setFilters: (filters) => set({ filters, page: 1 }),
            clearFilters: () => set({
                filters: { survey_id: '', source: '', date_from: '', date_to: '' },
                page: 1,
            }),
        }),
        {
            name: 'admin-storage',
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAdminStore;
