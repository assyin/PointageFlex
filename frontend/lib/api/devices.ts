import apiClient from './client';

export type DeviceType = 'FINGERPRINT' | 'FACE_RECOGNITION' | 'RFID_BADGE' | 'QR_CODE' | 'PIN_CODE' | 'MOBILE_GPS' | 'MANUAL';

export interface AttendanceDevice {
  id: string;
  name: string;
  deviceId: string;
  deviceType: DeviceType;
  ipAddress?: string;
  location?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE' | 'OFFLINE';
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  lastSync?: string;
  tenantId: string;
  siteId?: string;
  createdAt: string;
  updatedAt: string;
  site?: any;
}

export interface CreateDeviceDto {
  name: string;
  deviceId: string;
  deviceType: DeviceType;
  ipAddress?: string;
  location?: string;
  apiKey?: string;
  siteId?: string;
  isActive?: boolean;
}

export const devicesApi = {
  getAll: async (filters?: any) => {
    const response = await apiClient.get('/devices', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/devices/${id}`);
    return response.data;
  },

  create: async (data: CreateDeviceDto) => {
    const response = await apiClient.post('/devices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateDeviceDto> & { status?: string }) => {
    const response = await apiClient.patch(`/devices/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  },

  sync: async (id: string) => {
    const response = await apiClient.post(`/devices/${id}/sync`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/devices/stats');
    return response.data;
  },
};
