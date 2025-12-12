import { useQuery } from '@tanstack/react-query';
import {
  getPermissions,
  getPermissionsByCategory,
  getRolePermissions,
} from '../api/permissions';

export function usePermissions() {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: getPermissions,
  });
}

export function usePermissionsByCategory(category: string) {
  return useQuery({
    queryKey: ['permissions', 'category', category],
    queryFn: () => getPermissionsByCategory(category),
    enabled: !!category,
  });
}

export function useRolePermissions(roleId: string) {
  return useQuery({
    queryKey: ['permissions', 'role', roleId],
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
  });
}

