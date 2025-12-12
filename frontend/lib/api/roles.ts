import apiClient from './client';

export interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  tenantId?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
}

export interface CreateRoleDto {
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  permissionCodes?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionCodes?: string[];
}

// Get all roles
export async function getRoles(tenantId?: string): Promise<Role[]> {
  const response = await apiClient.get('/roles', {
    params: { tenantId },
  });
  return response.data;
}

// Get role by ID
export async function getRole(id: string): Promise<Role> {
  const response = await apiClient.get(`/roles/${id}`);
  return response.data;
}

// Create role
export async function createRole(data: CreateRoleDto): Promise<Role> {
  const response = await apiClient.post('/roles', data);
  return response.data;
}

// Update role
export async function updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
  const response = await apiClient.patch(`/roles/${id}`, data);
  return response.data;
}

// Delete role
export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`);
}

// Assign permissions to role
export async function assignPermissionsToRole(
  roleId: string,
  permissionCodes: string[]
): Promise<Role> {
  const response = await apiClient.post(`/roles/${roleId}/permissions`, {
    permissionCodes,
  });
  return response.data;
}

// Reset default permissions for a system role
export async function resetDefaultPermissions(roleId: string): Promise<Role> {
  const response = await apiClient.post(`/roles/${roleId}/reset-permissions`);
  return response.data;
}

