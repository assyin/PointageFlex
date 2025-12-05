import apiClient from './client';

export interface TenantSettings {
  workDaysPerWeek: number;
  maxWeeklyHours: number;
  lateToleranceMinutes: number;
  breakDuration: number;
  alertWeeklyHoursExceeded: boolean;
  alertInsufficientRest: boolean;
  alertNightWorkRepetitive: boolean;
  alertMinimumStaffing: boolean;
  annualLeaveDays: number;
  leaveApprovalLevels: number;
  overtimeRate: number;
  nightShiftRate: number;
}

export interface Tenant {
  id: string;
  companyName: string;
  slug: string;
  logo?: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  timezone: string;
  settings?: TenantSettings;
}

export interface UpdateTenantDto {
  companyName?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  timezone?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  isNational: boolean;
  tenantId: string;
}

export const settingsApi = {
  getTenant: async () => {
    const response = await apiClient.get('/tenants/me');
    return response.data;
  },

  updateTenant: async (data: UpdateTenantDto) => {
    const response = await apiClient.patch('/tenants/me', data);
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/tenants/me/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<TenantSettings>) => {
    const response = await apiClient.patch('/tenants/me/settings', data);
    return response.data;
  },

  getHolidays: async (year?: number) => {
    const response = await apiClient.get('/holidays', { params: { year } });
    return response.data;
  },

  createHoliday: async (data: { name: string; date: string; isNational: boolean }) => {
    const response = await apiClient.post('/holidays', data);
    return response.data;
  },

  deleteHoliday: async (id: string) => {
    const response = await apiClient.delete(`/holidays/${id}`);
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  updateUser: async (id: string, data: { role?: string; isActive?: boolean }) => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },
};
