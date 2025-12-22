/**
 * Google Sheets API Service
 * Interact with the Apps Script Web App to manage data.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzuxr8RAEm7-6RJaalq0AHxLZLWUOwjkaXFYwO-COuTHrhX2U5IkGapG0S3LtoR5lU/exec';

export const API = {
    /**
     * Fetch all employees from the sheet
     */
    fetchEmployees: async () => {
        try {
            const response = await fetch(`${APPS_SCRIPT_URL}?action=getEmployees`);
            const json = await response.json();
            if (json.success) return json.data;
            throw new Error(json.message || 'Failed to fetch employees');
        } catch (error) {
            console.error("API Error (fetchEmployees):", error);
            return [];
        }
    },

    /**
     * Register a new user (or link to existing employee)
     * Uses URLSearchParams (application/x-www-form-urlencoded) to ensure Simple Request (CORS Safe)
     * and robust delivery to GAS.
     * @param {Object} userData { name, team, position, jobGroup, password }
     */
    registerUser: async (userData) => {
        try {
            // Use URLSearchParams to force 'application/x-www-form-urlencoded'
            // This is a "Simple Request" and bypasses CORS preflight strictly.
            const params = new URLSearchParams();
            params.append('action', 'register');
            params.append('data', JSON.stringify(userData));

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: params
            });
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API Error (registerUser):", error);
            return { success: false, message: '서버 통신 오류 발생. 확인된 URL: ' + APPS_SCRIPT_URL + ' \n에러내용: ' + error.toString() };
        }
    },

    /**
     * Login user
     * @param {Object} credentials { name, password }
     */
    loginUser: async (credentials) => {
        try {
            const params = new URLSearchParams();
            params.append('action', 'login');
            params.append('data', JSON.stringify(credentials));

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: params
            });
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API Error (loginUser):", error);
            return { success: false, message: '서버 통신 오류 발생. 확인된 URL: ' + APPS_SCRIPT_URL + ' \n에러내용: ' + error.toString() };
        }
    },

    /**
     * Reset User Password (Admin)
     * @param {Object} data { name, newPassword }
     */
    resetUserPassword: async (data) => {
        try {
            const params = new URLSearchParams();
            params.append('action', 'resetPassword');
            params.append('data', JSON.stringify(data));

            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                body: params
            });
            const json = await response.json();
            return json;
        } catch (error) {
            console.error("API Error (resetUserPassword):", error);
            return { success: false, message: error.toString() };
        }
    },

    /**
     * Sync full employee list (e.g. from CSV upload)
     * Keep using no-cors for this one if we don't care about response, 
     * but we'll use JSON body since legacy backend handles it (or new backend handles both).
     * New backend handles JSON body too, so we can stick to JSON or change to Params.
     * Let's stick to JSON body but removing header (Simple Request) just in case.
     */
    syncEmployees: async (employees) => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                // No explicit Content-Type => text/plain (Simple)
                body: JSON.stringify({ action: 'syncEmployees', data: employees })
            });
            return { success: true };
        } catch (error) {
            console.error("API Error (syncEmployees):", error);
            return { success: false, error };
        }
    },

    /**
     * Sync Evaluation Results (CSV Analysis)
     */
    syncResults: async (results) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
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
     */
    saveEvaluation: async (evaluationData) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
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
     */
    saveConfig: async (config) => {
        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
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
