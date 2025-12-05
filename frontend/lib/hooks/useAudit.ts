import { useQuery } from '@tanstack/react-query';
import { auditApi, type AuditFilters } from '../api/audit';

// Fetch audit logs with filters
export function useAuditLogs(filters?: AuditFilters) {
  return useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: () => auditApi.getAll(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Fetch single audit log
export function useAuditLogDetail(id: string) {
  return useQuery({
    queryKey: ['auditLog', id],
    queryFn: () => auditApi.getById(id),
    enabled: !!id,
  });
}

// Fetch audit stats
export function useAuditStats(filters?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['auditStats', filters],
    queryFn: () => auditApi.getStats(filters),
    staleTime: 60000, // 1 minute
  });
}

// Fetch suspicious activities
export function useSuspiciousActivities() {
  return useQuery({
    queryKey: ['suspiciousActivities'],
    queryFn: () => auditApi.getSuspiciousActivities(),
    staleTime: 60000, // 1 minute
  });
}
