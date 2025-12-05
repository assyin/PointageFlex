import apiClient from './client';

export interface Attendance {
  id: string;
  employeeId: string;
  type: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  source: 'BIOMETRIC' | 'RFID' | 'FACIAL' | 'QR_CODE' | 'PIN' | 'MOBILE_GPS' | 'MANUAL' | 'IMPORT';
  deviceId?: string;
  latitude?: number;
  longitude?: number;
  status: 'VALID' | 'PENDING_CORRECTION' | 'CORRECTED';
  hoursWorked?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  overtimeMinutes?: number;
  notes?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  employee?: any;
}

export interface CreateAttendanceDto {
  employeeId: string;
  type: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  source: 'BIOMETRIC' | 'RFID' | 'FACIAL' | 'QR_CODE' | 'PIN' | 'MOBILE_GPS' | 'MANUAL' | 'IMPORT';
  deviceId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface AttendanceFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  source?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const attendanceApi = {
  getAll: async (filters?: AttendanceFilters) => {
    const response = await apiClient.get('/attendance', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/attendance/${id}`);
    return response.data;
  },

  getAnomalies: async (date?: string) => {
    const response = await apiClient.get('/attendance/anomalies', {
      params: date ? { date } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateAttendanceDto) => {
    const response = await apiClient.post('/attendance', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAttendanceDto>) => {
    const response = await apiClient.patch(`/attendance/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/attendance/${id}`);
    return response.data;
  },

  correct: async (id: string, data: any) => {
    const response = await apiClient.patch(`/attendance/${id}/correct`, data);
    return response.data;
  },

  export: async (format: 'csv' | 'excel', filters?: AttendanceFilters) => {
    const response = await apiClient.get(`/attendance/export/${format}`, {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
