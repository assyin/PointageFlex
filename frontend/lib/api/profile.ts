import apiClient from './client';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  tenantId: string;
  employee?: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword: string;
  forceChange?: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export const profileApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileDto) => {
    const response = await apiClient.patch('/users/me', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordDto) => {
    const response = await apiClient.post('/users/me/change-password', data);
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiClient.get('/users/me/preferences');
    return response.data;
  },

  updatePreferences: async (data: Partial<UserPreferences>) => {
    const response = await apiClient.patch('/users/me/preferences', data);
    return response.data;
  },

  getSessions: async () => {
    const response = await apiClient.get('/users/me/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string) => {
    const response = await apiClient.delete(`/users/me/sessions/${sessionId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/users/me/stats');
    return response.data;
  },

  exportData: async () => {
    const response = await apiClient.get('/users/me/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeAvatar: async () => {
    const response = await apiClient.delete('/users/me/avatar');
    return response.data;
  },
};
