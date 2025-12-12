import apiClient from './client';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  employeeId?: string;
  departmentId?: string;
  siteId?: string;
  teamId?: string;
  format?: 'PDF' | 'EXCEL' | 'CSV';
}

export type DashboardScope = 'personal' | 'team' | 'tenant' | 'platform';

export const reportsApi = {
  getDashboardStats: async (filters?: { 
    startDate?: string; 
    endDate?: string;
    scope?: DashboardScope;
  }) => {
    const response = await apiClient.get('/reports/dashboard', { params: filters });
    return response.data;
  },

  getAttendanceReport: async (filters: ReportFilters) => {
    const response = await apiClient.get('/reports/attendance', { params: filters });
    return response.data;
  },

  getAbsencesReport: async (filters: ReportFilters) => {
    const response = await apiClient.get('/reports/absences', { params: filters });
    return response.data;
  },

  getOvertimeReport: async (filters: ReportFilters) => {
    const response = await apiClient.get('/reports/overtime', { params: filters });
    return response.data;
  },

  getPlanningReport: async (filters: ReportFilters) => {
    const response = await apiClient.get('/reports/planning', { params: filters });
    return response.data;
  },

  getPayrollReport: async (filters: ReportFilters) => {
    const response = await apiClient.get('/reports/payroll', { params: filters });
    return response.data;
  },

  exportReport: async (reportType: string, filters: ReportFilters) => {
    const response = await apiClient.post(`/reports/${reportType}/export`, filters, {
      responseType: 'blob',
    });
    return response.data;
  },

  getReportHistory: async () => {
    const response = await apiClient.get('/reports/history');
    return response.data;
  },
};
