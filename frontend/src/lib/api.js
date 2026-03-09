/**
 * Centralized API configuration for the frontend.
 * Uses environment variables to determine the backend URL.
 */

const getApiUrl = () => {
    // In Vite, environment variables are prefixed with VITE_
    const apiUrl = import.meta.env.VITE_API_URL || '';
    // Remove trailing slash if present
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
};

export const API_BASE_URL = getApiUrl();

/**
 * Constructs a full API URL for a given endpoint.
 * @param {string} endpoint - The API endpoint (e.g., '/api/kpis')
 * @returns {string} - The full URL
 */
export const getFullUrl = (endpoint) => {
    if (endpoint.startsWith('http')) return endpoint;
    const slashedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${slashedEndpoint}`;
};

/**
 * Constructs a WebSocket URL based on the API base URL.
 * @param {string} endpoint - The WS endpoint (e.g., '/api/ws/kpis')
 * @returns {string} - The full WebSocket URL
 */
export const getWsUrl = (endpoint) => {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    const slashedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${wsBase}${slashedEndpoint}`;
};
