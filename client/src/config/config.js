const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL:', apiUrl); // Debug log

export const API_CONFIG = {
    baseUrl: apiUrl || 'https://avatar-be-production.up.railway.app' // Fallback to Railway URL
}; 