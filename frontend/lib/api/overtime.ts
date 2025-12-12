import apiClient from './client';

export interface Overtime {
  id: string;
  employeeId: string;
  date: string;
  hours: number;
  type: 'STANDARD' | 'NIGHT' | 'HOLIDAY' | 'EMERGENCY';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'RECOVERED';
  source: 'BIOMETRIC' | 'RFID' | 'FACIAL' | 'QR_CODE' | 'PIN' | 'MOBILE_GPS' | 'MANUAL' | 'IMPORT';
  convertedToRecovery: boolean;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: any;
}

export interface CreateOvertimeDto {
  employeeId: string;
  date: string;
  hours: number;
  type: 'STANDARD' | 'NIGHT' | 'HOLIDAY' | 'EMERGENCY';
  notes?: string;
}

export interface OvertimeFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const overtimeApi = {
  getAll: async (filters?: OvertimeFilters) => {
    const response = await apiClient.get('/overtime', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/overtime/${id}`);
    return response.data;
  },

  create: async (data: CreateOvertimeDto) => {
    const response = await apiClient.post('/overtime', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateOvertimeDto>) => {
    const response = await apiClient.patch(`/overtime/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/overtime/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await apiClient.post(`/overtime/${id}/approve`, {
      status: 'APPROVED',
    });
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    // Note: Le backend n'accepte que le status pour l'instant
    // La raison pourrait être stockée dans un champ notes ou rejectionReason si ajouté au schéma
    const response = await apiClient.post(`/overtime/${id}/approve`, {
      status: 'REJECTED',
    });
    return response.data;
  },

  convertToRecovery: async (id: string) => {
    const response = await apiClient.post(`/overtime/${id}/convert-to-recovery`);
    return response.data;
  },

  getBalance: async (employeeId: string) => {
    const response = await apiClient.get(`/overtime/balance/${employeeId}`);
    return response.data;
  },
};
