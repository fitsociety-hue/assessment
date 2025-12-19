/**
 * Google Sheets API Service
 * Interact with the Apps Script Web App to manage data.
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbys9msN-mdGOAVBiT-JpnGHn3BT11rFZG6TqYgsfe0xUqROFkwceOChHC0v1Oda_Lvk/exec';

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
     * Sync full employee list (e.g. from CSV upload)
     * @param {Array} employees - Array of employee objects
     */
    syncEmployees: async (employees) => {
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Apps Script POST often requires no-cors opaque mode
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
