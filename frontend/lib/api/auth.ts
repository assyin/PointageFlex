import apiClient from './client';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  slug: string;
}

export const authApi = {
  login: async (data: LoginDto) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
