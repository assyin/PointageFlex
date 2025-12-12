import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUsers,
  getUser,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  getUserRoles,
  assignRolesToUser,
  removeRoleFromUser,
  getUserTenants,
  type CreateUserDto,
  type UpdateUserDto,
  type AssignRoleDto,
} from '../api/users';

export function useUsers(tenantId?: string) {
  return useQuery({
    queryKey: ['users', tenantId],
    queryFn: () => getUsers(tenantId),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getCurrentUser,
  });
}

export function useUserRoles(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'roles'],
    queryFn: () => getUserRoles(userId),
    enabled: !!userId,
  });
}

export function useUserTenants() {
  return useQuery({
    queryKey: ['users', 'me', 'tenants'],
    queryFn: getUserTenants,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDto) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignRolesToUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRoleDto }) =>
      assignRolesToUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useRemoveRoleFromUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      removeRoleFromUser(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId, 'roles'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

