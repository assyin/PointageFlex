import apiClient from './client';

export interface Department {
  id: string;
  name: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export interface Site {
  id: string;
  name: string;
  address?: string;
  city?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    employees: number;
  };
}

export const departmentsApi = {
  getAll: async () => {
    const response = await apiClient.get('/departments');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },

  create: async (data: { name: string }) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  update: async (id: string, data: { name: string }) => {
    const response = await apiClient.patch(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },
};

export const sitesApi = {
  getAll: async () => {
    const response = await apiClient.get('/sites');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/sites/${id}`);
    return response.data;
  },

  create: async (data: { name: string; address?: string; city?: string }) => {
    const response = await apiClient.post('/sites', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; address?: string; city?: string }) => {
    const response = await apiClient.patch(`/sites/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/sites/${id}`);
    return response.data;
  },
};
