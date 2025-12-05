import axios from 'axios';
import { isAuthenticated } from '../utils/auth';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Vérifier si le token est valide avant d'envoyer la requête
      // Ne pas envoyer la requête si le token est expiré (évite les erreurs 401)
      // Exception pour les routes d'authentification
      if (!isAuthenticated() && !config.url?.includes('/auth/')) {
        // Créer une promesse qui ne sera jamais résolue pour empêcher l'envoi de la requête
        // Cela évite les erreurs 401 dans la console
        const silentError: any = Object.create(null);
        silentError.name = '';
        silentError.message = '';
        silentError.stack = '';
        silentError.toString = () => '';
        silentError.config = config;
        silentError.response = { status: 401, statusText: 'Unauthorized', data: {} };
        silentError.isAxiosError = false;
        // Rejeter silencieusement sans afficher dans la console
        return Promise.reject(silentError);
      }

      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      const tenantId = localStorage.getItem('tenantId');
      if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Variable globale pour éviter les refresh multiples simultanés
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor pour gérer les erreurs et refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Gérer silencieusement les erreurs 401 pour éviter de polluer la console
    if (error.response?.status === 401) {
      // Supprimer l'erreur de la console en créant une erreur silencieuse
      const silentError: any = Object.create(null);
      silentError.name = '';
      silentError.message = '';
      silentError.stack = '';
      silentError.toString = () => '';
      silentError.response = undefined;
      silentError.config = undefined;
      silentError.request = undefined;
      silentError.isAxiosError = false;
      
      // Si la requête a déjà été retentée ou si on est sur la page de login, rejeter silencieusement
      if (originalRequest._retry || (typeof window !== 'undefined' && window.location.pathname.includes('/login'))) {
        // Ne pas afficher l'erreur dans la console
        return Promise.reject(silentError);
      }

      if (!originalRequest._retry) {
      // Si on est déjà en train de refresh, ajouter à la queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            } else {
              return Promise.reject(silentError);
            }
          })
          .catch(() => {
            return Promise.reject(silentError);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Vérifier si on a un token
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Si pas de token du tout, rediriger vers login
      if (!accessToken && !refreshToken) {
        isRefreshing = false;
        processQueue(new Error('No tokens available'));
        if (typeof window !== 'undefined') {
          // Ne rediriger que si on n'est pas déjà sur la page de login
          if (!window.location.pathname.includes('/login')) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
        return Promise.reject(silentError);
      }

      // Essayer de refresh le token
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refreshToken },
            {
              // Ne pas utiliser l'intercepteur pour cette requête
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const { accessToken: newAccessToken } = response.data;
          if (newAccessToken) {
            localStorage.setItem('accessToken', newAccessToken);

            // Retry la requête originale
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            isRefreshing = false;
            processQueue(null, newAccessToken);
            return apiClient(originalRequest);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          isRefreshing = false;
          processQueue(refreshError);
          if (typeof window !== 'undefined') {
            // Ne rediriger que si on n'est pas déjà sur la page de login
            if (!window.location.pathname.includes('/login')) {
              localStorage.clear();
              window.location.href = '/login';
            }
          }
          // Rejeter silencieusement
          return Promise.reject(silentError);
        }
      } else {
        // Pas de refresh token, rediriger vers login
        isRefreshing = false;
        processQueue(new Error('No refresh token available'));
        if (typeof window !== 'undefined') {
          // Ne rediriger que si on n'est pas déjà sur la page de login
          if (!window.location.pathname.includes('/login')) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }
        return Promise.reject(silentError);
      }
      }
    }

    // Pour les autres erreurs, rejeter normalement
    return Promise.reject(error);
  }
);

export default apiClient;
