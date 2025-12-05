import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamsApi, type CreateTeamDto } from '../api/teams';
import { toast } from 'sonner';
import { isAuthenticated } from '../utils/auth';

export function useTeams(filters?: any) {
  return useQuery({
    queryKey: ['teams', filters],
    queryFn: () => teamsApi.getAll(filters),
    enabled: isAuthenticated(),
    staleTime: 60000, // 1 minute
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamDto) => teamsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Équipe créée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'équipe');
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTeamDto> }) =>
      teamsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.id] });
      toast.success('Équipe modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification de l\'équipe');
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teamsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Équipe supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'équipe');
    },
  });
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      teamsApi.addMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Membre ajouté à l\'équipe avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout du membre à l\'équipe');
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, employeeId }: { teamId: string; employeeId: string }) =>
      teamsApi.removeMember(teamId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Membre retiré de l\'équipe avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du retrait du membre de l\'équipe');
    },
  });
}
