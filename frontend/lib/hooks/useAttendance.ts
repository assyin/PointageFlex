import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, type Attendance, type CreateAttendanceDto, type AttendanceFilters } from '../api/attendance';
import { toast } from 'sonner';

// Fetch attendance records with filters
export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceApi.getAll(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false, // Don't refresh when tab is not active
  });
}

// Fetch single attendance record
export function useAttendanceDetail(id: string) {
  return useQuery({
    queryKey: ['attendance', id],
    queryFn: () => attendanceApi.getById(id),
    enabled: !!id,
  });
}

// Fetch anomalies
export function useAttendanceAnomalies(date?: string) {
  return useQuery({
    queryKey: ['attendance', 'anomalies', date],
    queryFn: () => attendanceApi.getAnomalies(date),
    staleTime: 30000, // 30 seconds
    retry: false, // Don't retry on error
    enabled: !!date, // Only fetch if date is provided
  });
}

// Create new attendance record
export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAttendanceDto) => attendanceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'anomalies'] });
      toast.success('Pointage créé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la création du pointage'
      );
    },
  });
}

// Update attendance record
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateAttendanceDto> }) =>
      attendanceApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.id] });
      toast.success('Pointage modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la modification du pointage'
      );
    },
  });
}

// Correct attendance record (for anomalies)
export function useCorrectAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        correctionNote: string;
        correctedBy: string;
        correctedTimestamp?: string;
      };
    }) => attendanceApi.correct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'anomalies'] });
      toast.success('Pointage corrigé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la correction du pointage'
      );
    },
  });
}

// Delete attendance record
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Pointage supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la suppression du pointage'
      );
    },
  });
}

// Export attendance data (CSV/Excel)
export function useExportAttendance() {
  return useMutation({
    mutationFn: async ({
      format,
      filters,
    }: {
      format: 'csv' | 'excel';
      filters?: AttendanceFilters;
    }) => {
      const blob = await attendanceApi.export(format, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: (_, variables) => {
      toast.success(`Fichier ${variables.format.toUpperCase()} exporté avec succès`);
    },
    onError: (error: any) => {
      toast.error(
        error.message || 'Erreur lors de l\'export des données'
      );
    },
  });
}
