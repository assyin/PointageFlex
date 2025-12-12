import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports';

export interface DashboardStats {
  scope?: 'personal' | 'team' | 'tenant' | 'platform';
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
    current?: number;
  };
  period: {
    startDate: string;
    endDate: string;
  };
  // Personal dashboard specific
  personal?: {
    workedDays: number;
    totalHours: number;
    lateCount: number;
    overtimeHours: number;
    leaveDays: number;
  };
  // Team dashboard specific
  team?: {
    id: string;
    name: string;
  };
  attendanceRate?: number;
  // Platform dashboard specific
  tenants?: {
    total: number;
    stats: Array<{
      id: string;
      name: string;
      totalEmployees: number;
      activeToday: number;
      attendanceRate: string;
    }>;
  };
  // Chart data from backend
  weeklyAttendance?: Array<{
    day: string;
    date: string;
    retards?: number;
    absences?: number;
    present?: number;
    late?: number;
  }>;
  shiftDistribution?: Array<{
    name: string;
    value: number;
  }>;
  overtimeTrend?: Array<{
    semaine: string;
    heures: number;
  }>;
}

export function useDashboardStats(filters?: { 
  startDate?: string; 
  endDate?: string;
  scope?: 'personal' | 'team' | 'tenant' | 'platform';
}) {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats', filters],
    queryFn: () => reportsApi.getDashboardStats(filters),
    staleTime: 60000, // 60 seconds
    retry: 1,
  });
}
