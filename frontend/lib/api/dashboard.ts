import apiClient from './client';
import { DashboardStats } from '../types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/reports/dashboard');
    return response.data;
  },
};
