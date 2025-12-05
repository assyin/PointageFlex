import apiClient from './client';

export interface Leave {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason?: string;
  attachment?: string;
  status: 'PENDING' | 'MANAGER_APPROVED' | 'HR_APPROVED' | 'REJECTED' | 'CANCELLED';
  managerApprovedBy?: string;
  managerApprovedAt?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  rejectionReason?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: any;
  leaveType?: any;
}

export interface LeaveType {
  id: string;
  name: string;
  maxDays?: number;
  requiresDocument: boolean;
  color?: string;
  tenantId: string;
}

export interface CreateLeaveDto {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
  attachment?: string;
}

export interface LeaveFilters {
  employeeId?: string;
  status?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const leavesApi = {
  getAll: async (filters?: LeaveFilters) => {
    const response = await apiClient.get('/leaves', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/leaves/${id}`);
    return response.data;
  },

  create: async (data: CreateLeaveDto) => {
    const response = await apiClient.post('/leaves', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateLeaveDto>) => {
    const response = await apiClient.patch(`/leaves/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/leaves/${id}`);
    return response.data;
  },

  approve: async (id: string, level: 'manager' | 'hr') => {
    const status = level === 'manager' ? 'MANAGER_APPROVED' : 'HR_APPROVED';
    const response = await apiClient.post(`/leaves/${id}/approve`, { status });
    return response.data;
  },

  reject: async (id: string, reason: string) => {
    const response = await apiClient.post(`/leaves/${id}/approve`, {
      status: 'REJECTED',
      comment: reason
    });
    return response.data;
  },

  getLeaveTypes: async () => {
    const response = await apiClient.get('/leave-types');
    return response.data;
  },

  createLeaveType: async (data: any) => {
    const response = await apiClient.post('/leave-types', data);
    return response.data;
  },

  updateLeaveType: async (id: string, data: any) => {
    const response = await apiClient.patch(`/leave-types/${id}`, data);
    return response.data;
  },

  deleteLeaveType: async (id: string) => {
    const response = await apiClient.delete(`/leave-types/${id}`);
    return response.data;
  },

  getBalance: async (employeeId: string) => {
    const response = await apiClient.get(`/leaves/balance/${employeeId}`);
    return response.data;
  },
};
