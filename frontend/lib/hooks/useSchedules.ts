import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  schedulesApi,
  type CreateScheduleDto,
  type ScheduleFilters,
  type WeekScheduleResponse,
  type MonthScheduleResponse,
  type LegalAlert,
  type Replacement,
} from '../api/schedules';
import { toast } from 'sonner';
import { translateErrorMessage } from '../utils/errorMessages';
import { isAuthenticated } from '../utils/auth';

export function useSchedules(filters?: ScheduleFilters) {
  return useQuery({
    queryKey: ['schedules', filters],
    queryFn: () => schedulesApi.getAll(filters),
    enabled: isAuthenticated(),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: ['schedules', id],
    queryFn: () => schedulesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScheduleDto) => schedulesApi.create(data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'month'] });
      
      // Show success message with count if available
      if (data?.count !== undefined) {
        toast.success(`${data.count} planning(s) créé(s) avec succès${data.skipped > 0 ? ` (${data.skipped} ignoré(s))` : ''}`);
      } else {
        toast.success('Planning créé avec succès');
      }
    },
    onError: (error: any) => {
      // Log détaillé pour debug
      console.error('Error creating schedule:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
        fullError: JSON.stringify(error?.response?.data, null, 2),
      });
      
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Veuillez vérifier les informations saisies et réessayer.',
        duration: 5000,
      });
    },
  });
}

export function useBulkCreateSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schedules: CreateScheduleDto[]) => schedulesApi.bulkCreate(schedules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Plannings créés avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création des plannings');
    },
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateScheduleDto> }) =>
      schedulesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'month'] });
      toast.success('Planning modifié avec succès');
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible de modifier le planning.',
        duration: 5000,
      });
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'month'] });
      toast.success('Planning supprimé avec succès');
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible de supprimer le planning.',
        duration: 5000,
      });
    },
  });
}

export function useBulkDeleteSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => schedulesApi.deleteBulk(ids),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'month'] });
      
      const count = data?.count || data?.deleted || 0;
      toast.success(`${count} planning(s) supprimé(s) avec succès`);
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible de supprimer les plannings.',
        duration: 5000,
      });
    },
  });
}

// Fetch week schedule
export function useWeekSchedule(
  date: string,
  filters?: { teamId?: string; siteId?: string },
) {
  return useQuery({
    queryKey: ['schedules', 'week', date, filters],
    queryFn: () => schedulesApi.getWeek(date, filters),
    enabled: !!date && isAuthenticated(),
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

// Fetch month schedule
export function useMonthSchedule(
  date: string,
  filters?: { teamId?: string; siteId?: string },
) {
  return useQuery({
    queryKey: ['schedules', 'month', date, filters],
    queryFn: () => schedulesApi.getMonth(date, filters),
    enabled: !!date && isAuthenticated(),
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

// Fetch legal alerts
export function useScheduleAlerts(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['schedules', 'alerts', startDate, endDate],
    queryFn: () => schedulesApi.getAlerts(startDate, endDate),
    enabled: !!startDate && !!endDate && isAuthenticated(),
    staleTime: 300000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

// Replacements hooks
export function useReplacements(filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['replacements', filters],
    queryFn: () => schedulesApi.getReplacements(filters),
    enabled: isAuthenticated(),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useCreateReplacement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      date: string;
      originalEmployeeId: string;
      replacementEmployeeId: string;
      shiftId: string;
      reason?: string;
    }) => schedulesApi.createReplacement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Demande de remplacement créée');
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible de créer la demande de remplacement.',
        duration: 5000,
      });
    },
  });
}

export function useApproveReplacement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.approveReplacement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast.success('Remplacement approuvé');
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible d\'approuver le remplacement.',
        duration: 5000,
      });
    },
  });
}

export function useRejectReplacement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => schedulesApi.rejectReplacement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replacements'] });
      toast.success('Remplacement rejeté');
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Impossible de rejeter le remplacement.',
        duration: 5000,
      });
    },
  });
}

// Import Excel hooks
export function useImportSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => schedulesApi.importExcel(file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'week'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', 'month'] });
      
      if (data?.data?.success !== undefined) {
        toast.success(`${data.data.success} planning(s) importé(s) avec succès${data.data.failed > 0 ? `, ${data.data.failed} échec(s)` : ''}`);
      } else {
        toast.success('Plannings importés avec succès');
      }
    },
    onError: (error: any) => {
      const errorMessage = translateErrorMessage(error);
      toast.error(errorMessage, {
        description: 'Veuillez vérifier le fichier et réessayer.',
        duration: 5000,
      });
    },
  });
}
