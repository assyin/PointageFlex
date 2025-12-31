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
      
      // Show success message with count and excluded dates if available
      if (data?.count !== undefined) {
        const totalExcluded = (data.excludedDates?.length || 0) + (data.conflictingDates?.length || 0);
        
        if (totalExcluded > 0) {
          // Construire le message détaillé avec les raisons
          const reasons: string[] = [];
          
          if (data.summary?.excludedByReason) {
            const reasonsMap: Record<string, string> = {
              nonOuvrable: 'jours non ouvrables',
              jourFerie: 'jours fériés',
              conge: 'jours en congé',
              recuperation: 'jours de récupération',
              dejaExistant: 'jours avec planning existant',
            };
            
            Object.entries(data.summary.excludedByReason).forEach(([key, count]: [string, any]) => {
              if (count > 0 && reasonsMap[key]) {
                reasons.push(`${count} ${reasonsMap[key]}`);
              }
            });
          }
          
          const reasonsText = reasons.length > 0 ? reasons.join(', ') : 'dates exclues';
          
          // Stocker les données dans sessionStorage pour affichage dans une modal si nécessaire
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('scheduleCreationDetails', JSON.stringify({
              excludedDates: data.excludedDates || [],
              conflictingDates: data.conflictingDates || [],
              summary: data.summary,
            }));
          }
          
          toast.success(
            `${data.count} planning(s) créé(s) avec succès`,
            {
              description: `${totalExcluded} jour(s) exclu(s) : ${reasonsText}. Consultez la console pour plus de détails.`,
              duration: 10000,
            }
          );
          
          // Log détaillé dans la console
          console.group('📅 Détails de la création de planning');
          console.log(`✅ ${data.count} planning(s) créé(s)`);
          if (data.excludedDates && data.excludedDates.length > 0) {
            console.group('📋 Dates exclues:');
            data.excludedDates.forEach((excluded: any) => {
              const reasonLabels: Record<string, string> = {
                NON_OUVRABLE: '❌ Jour non ouvrable',
                JOUR_FERIE: '🎉 Jour férié',
                CONGE: '🏖️ Congé approuvé',
                RECUPERATION: '🔄 Jour de récupération',
              };
              console.log(`${excluded.date}: ${reasonLabels[excluded.reason] || excluded.reason} - ${excluded.details || ''}`);
            });
            console.groupEnd();
          }
          if (data.conflictingDates && data.conflictingDates.length > 0) {
            console.group('⚠️ Dates avec planning existant:');
            data.conflictingDates.forEach((conflict: any) => {
              console.log(`${conflict.date}: Planning existant pour le shift "${conflict.shift}"`);
            });
            console.groupEnd();
          }
          if (data.summary) {
            console.log('📊 Résumé:', data.summary);
          }
          console.groupEnd();
        } else {
          toast.success(`${data.count} planning(s) créé(s) avec succès`);
        }
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
      const statusCode = error?.response?.status;
      
      // Messages d'erreur contextuels selon le type d'erreur
      let description = 'Veuillez vérifier les informations saisies et réessayer.';
      
      if (statusCode === 409) {
        // Conflit - planning déjà existant
        description = 'Certains plannings existent déjà pour cette période. Veuillez choisir une autre période ou modifier les plannings existants.';
      } else if (statusCode === 400) {
        // Erreur de validation
        const apiMessage = error?.response?.data?.message || '';
        if (apiMessage.includes('actif')) {
          description = 'L\'employé ou le shift sélectionné n\'est pas actif. Veuillez sélectionner un élément actif.';
        } else if (apiMessage.includes('équipe')) {
          description = 'L\'employé n\'appartient pas à l\'équipe sélectionnée. Veuillez corriger cette information.';
        } else if (apiMessage.includes('heure')) {
          description = 'Les heures personnalisées sont invalides. L\'heure de fin doit être supérieure à l\'heure de début.';
        } else if (apiMessage.includes('intervalle')) {
          description = 'L\'intervalle de dates sélectionné dépasse la limite autorisée (365 jours maximum).';
        }
      } else if (statusCode === 404) {
        description = 'L\'employé, le shift ou l\'équipe sélectionné(e) n\'existe pas. Veuillez en sélectionner un(e) autre.';
      }
      
      toast.error(errorMessage, {
        description,
        duration: 6000,
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
      const statusCode = error?.response?.status;
      let errorMessage = translateErrorMessage(error);
      let description = 'Impossible de supprimer le planning.';

      // Message spécifique pour les erreurs 403 (permissions)
      if (statusCode === 403) {
        errorMessage = 'Accès refusé';
        description = 'Vous n\'avez pas les permissions nécessaires pour supprimer un planning. Seuls les administrateurs RH et les managers peuvent effectuer cette action.';
      }

      toast.error(errorMessage, {
        description,
        duration: 6000,
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
      const statusCode = error?.response?.status;
      let errorMessage = translateErrorMessage(error);
      let description = 'Impossible de supprimer les plannings.';

      // Message spécifique pour les erreurs 403 (permissions)
      if (statusCode === 403) {
        errorMessage = 'Accès refusé';
        description = 'Vous n\'avez pas les permissions nécessaires pour supprimer des plannings. Seuls les administrateurs RH et les managers peuvent effectuer cette action.';
      }

      toast.error(errorMessage, {
        description,
        duration: 6000,
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
