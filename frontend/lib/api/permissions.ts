import apiClient from './client';

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get all permissions
export async function getPermissions(): Promise<Permission[]> {
  const response = await apiClient.get('/permissions');
  return response.data;
}

// Get permissions by category
export async function getPermissionsByCategory(
  category: string
): Promise<Permission[]> {
  const response = await apiClient.get(`/permissions/category/${category}`);
  return response.data;
}

// Get permissions for a role
export async function getRolePermissions(
  roleId: string
): Promise<Permission[]> {
  const response = await apiClient.get(`/permissions/role/${roleId}`);
  return response.data;
}

