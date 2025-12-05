import apiClient from './client';

export interface Team {
  id: string;
  name: string;
  description?: string;
  rotationEnabled: boolean;
  rotationCycleDays?: number;
  tenantId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  manager?: any;
  members?: any[];
  _count?: {
    members: number;
  };
}

export interface CreateTeamDto {
  name: string;
  description?: string;
  rotationEnabled: boolean;
  rotationCycleDays?: number;
  managerId?: string;
}

export const teamsApi = {
  getAll: async (filters?: any) => {
    const response = await apiClient.get('/teams', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/teams/${id}`);
    return response.data;
  },

  create: async (data: CreateTeamDto) => {
    const response = await apiClient.post('/teams', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTeamDto>) => {
    const response = await apiClient.patch(`/teams/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/teams/${id}`);
    return response.data;
  },

  addMember: async (teamId: string, employeeId: string) => {
    const response = await apiClient.post(`/teams/${teamId}/members`, { employeeId });
    return response.data;
  },

  removeMember: async (teamId: string, employeeId: string) => {
    const response = await apiClient.delete(`/teams/${teamId}/members/${employeeId}`);
    return response.data;
  },
};
