/**
 * Google Sheets API Service
 * Interact with the Apps Script Web App to manage data.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz4xCItNbQMUKHdiZP3cK_XHSet0yZywaZFFBySVmt53_dBTYlKyG7rFjKF0dW4_OhW/exec';

export const API = {
    /**
     * Fetch all employees from the sheet
     * Expected backend return: { success: true, data: [ { name, team, position, ... } ] }
     */
    fetchEmployees: async () => {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getEmployees`);
            const json = await response.json();
            if (json.success) return json.data;
            throw new Error(json.message || 'Failed to fetch employees');
        } catch (error) {
            console.error("API Error (fetchEmployees):", error);
            return []; // Return empty on error to prevent crash
        }
    },

    /**
     * Register a new user (or link to existing employee)
     * @param {Object} userData { name, team, position, jobGroup, password }
     */
    registerUser: async (userData) => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                // Using standard CORS. Apps Script must handle OPTIONS or return correct headers.
                // If this fails due to CORS, user must ensure script deployment is 'Anyone' and handles CORS.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'register', data: userData })
            });
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API Error (registerUser):", error);
            return { success: false, message: '서버 통신 오류가 발생했습니다.' };
        }
    },

    /**
     * Login user
     * @param {Object} credentials { name, password }
     */
    loginUser: async (credentials) => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'login', data: credentials })
            });
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API Error (loginUser):", error);
            return { success: false, message: '서버 통신 오류가 발생했습니다.' };
        }
    },

    /**
     * Sync full employee list (e.g. from CSV upload)
     * @param {Array} employees - Array of employee objects
     */
    syncEmployees: async (employees) => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Apps Script POST often requires no-cors opaque mode for fire-and-forget
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'syncEmployees', data: employees })
            });
            // In no-cors mode, we can't read the response. We assume success if no network error.
            return { success: true };
        } catch (error) {
            console.error("API Error (syncEmployees):", error);
            return { success: false, error };
        }
    },

    /**
     * Sync Evaluation Results (CSV Analysis)
     * @param {Array} results - Array of analyzed result objects
     */
    syncResults: async (results) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'syncResults', data: results })
            });
            return { success: true };
        } catch (error) {
            console.error("API Error (syncResults):", error);
            return { success: false, error };
        }
    },

    /**
     * Save a completed evaluation
     * @param {Object} evaluationData 
     */
    saveEvaluation: async (evaluationData) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveEvaluation', data: evaluationData })
            });
            return { success: true };
        } catch (error) {
            console.error("API Error (saveEvaluation):", error);
            return { success: false, error };
        }
    },

    /**
     * Save Configuration (Weights)
     * @param {Object} config 
     */
    saveConfig: async (config) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'saveConfig', data: config })
            });
            return { success: true };
        } catch (error) {
            console.error("API Error (saveConfig):", error);
            return { success: false, error };
        }
    },

    /**
     * Fetch Configuration
     */
    fetchConfig: async () => {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getConfig`);
            const json = await response.json();
            if (json.success) return json.data;
            return null;
        } catch (error) {
            console.warn("API Error (fetchConfig) - using defaults", error);
            return null;
        }
    }
};
