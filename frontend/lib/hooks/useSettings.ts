import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../api/settings';
import { toast } from 'sonner';

// Fetch tenant settings
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    staleTime: 300000, // 5 minutes - settings don't change often
  });
}

// Update tenant settings
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Paramètres mis à jour avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la mise à jour des paramètres'
      );
    },
  });
}
