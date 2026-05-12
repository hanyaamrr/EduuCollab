import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5129', // Adjust to your .NET port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {

            // THE FIX: Check if the failed request was the login attempt itself.
            // If it was, DO NOT refresh the page. Let the Login component handle it!
            const isLoginRequest = error.config.url && error.config.url.toLowerCase().includes('/login');

            if (!isLoginRequest) {
                // If it was a normal API call (like fetching groups) and it failed,
                // their token expired. Kick them out.
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;