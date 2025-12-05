import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export interface DashboardStats {
  employees: {
    total: number;
    activeToday: number;
    onLeave: number;
  };
  pendingApprovals: {
    leaves: number;
    overtime: number;
  };
  attendance: {
    total: number;
    anomalies: number;
    anomalyRate: string | number;
  };
  overtime: {
    totalRecords: number;
    totalHours: number;
  };
  leaves: {
    totalRequests: number;
    totalDays: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
}

export function useDashboardStats(filters?: { startDate?: string; endDate?: string }) {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', filters],
    queryFn: () => reportsApi.getDashboardStats(filters),
    staleTime: 60000, // 60 seconds
    retry: 1,
  });
}
