import apiClient from './client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserTenantRole {
  id: string;
  userId: string;
  tenantId: string;
  roleId: string;
  role: {
    id: string;
    name: string;
    code: string;
    description?: string;
  };
  isActive: boolean;
  assignedAt: string;
  assignedBy?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface AssignRoleDto {
  roleIds: string[];
}

// Get all users
export async function getUsers(tenantId?: string): Promise<User[]> {
  const response = await apiClient.get('/users', {
    params: { tenantId, limit: 1000 }, // Get all users, not paginated
  });
  // Backend returns { data: User[], total: number } for pagination
  // But we want just the array
  return response.data?.data || response.data || [];
}

// Get user by ID
export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/users/me');
  return response.data;
}

// Create user
export async function createUser(data: CreateUserDto): Promise<User> {
  const response = await apiClient.post('/users', data);
  return response.data;
}

// Update user
export async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const response = await apiClient.patch(`/users/${id}`, data);
  return response.data;
}

// Delete user
export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

// Get user roles in tenant
export async function getUserRoles(userId: string): Promise<UserTenantRole[]> {
  const response = await apiClient.get(`/users/${userId}/roles`);
  return response.data;
}

// Assign roles to user
export async function assignRolesToUser(
  userId: string,
  data: AssignRoleDto
): Promise<UserTenantRole[]> {
  const response = await apiClient.post(`/users/${userId}/roles`, data);
  return response.data;
}

// Remove role from user
export async function removeRoleFromUser(
  userId: string,
  roleId: string
): Promise<void> {
  await apiClient.delete(`/users/${userId}/roles/${roleId}`);
}

// Get user's tenants and roles
export async function getUserTenants(): Promise<{
  tenant: {
    id: string;
    companyName: string;
  };
  roles: {
    id: string;
    name: string;
    code: string;
  }[];
}[]> {
  const response = await apiClient.get('/users/me/tenants');
  return response.data;
}

