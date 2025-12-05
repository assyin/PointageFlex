import apiClient from './client';

export interface AuditLog {
  id: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  tenantId: string;
  createdAt: string;
  user?: any;
}

export interface AuditFilters {
  userId?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const auditApi = {
  getAll: async (filters?: AuditFilters) => {
    const response = await apiClient.get('/audit', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/audit/${id}`);
    return response.data;
  },

  getStats: async (filters?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/audit/stats', { params: filters });
    return response.data;
  },

  getSuspiciousActivities: async () => {
    const response = await apiClient.get('/audit/suspicious');
    return response.data;
  },
};
