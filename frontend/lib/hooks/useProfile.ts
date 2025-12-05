import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, type UpdateProfileDto, type ChangePasswordDto, type UserPreferences } from '../api/profile';
import { toast } from 'sonner';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 30000, // 30 seconds
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => profileApi.changePassword(data),
    onSuccess: () => {
      toast.success('Mot de passe modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    },
  });
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: () => profileApi.getPreferences(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserPreferences>) => profileApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      toast.success('Préférences mises à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des préférences');
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => profileApi.getSessions(),
    staleTime: 60000, // 1 minute
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => profileApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session révoquée avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la révocation de la session');
    },
  });
}

export function useProfileStats() {
  return useQuery({
    queryKey: ['profile-stats'],
    queryFn: () => profileApi.getStats(),
    staleTime: 300000, // 5 minutes
  });
}
