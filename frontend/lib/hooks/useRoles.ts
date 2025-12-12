import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  resetDefaultPermissions,
  type CreateRoleDto,
  type UpdateRoleDto,
} from '../api/roles';

export function useRoles(tenantId?: string) {
  return useQuery({
    queryKey: ['roles', tenantId],
    queryFn: () => getRoles(tenantId),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleDto) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useAssignPermissionsToRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissionCodes,
    }: {
      roleId: string;
      permissionCodes: string[];
    }) => assignPermissionsToRole(roleId, permissionCodes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useResetDefaultPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId: string) => resetDefaultPermissions(roleId),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

