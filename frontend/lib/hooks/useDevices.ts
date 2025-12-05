import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { devicesApi, type AttendanceDevice, type CreateDeviceDto } from '../api/devices';
import { toast } from 'sonner';

export function useDevices(filters?: any) {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: () => devicesApi.getAll(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => devicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeviceDto) => devicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', 'stats'] });
      toast.success('Terminal créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du terminal');
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDeviceDto> & { status?: string } }) =>
      devicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['devices', 'stats'] });
      toast.success('Terminal modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du terminal');
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => devicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', 'stats'] });
      toast.success('Terminal supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du terminal');
    },
  });
}

export function useSyncDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => devicesApi.sync(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['devices', id] });
      toast.success('Synchronisation réussie');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la synchronisation');
    },
  });
}

export function useDeviceStats() {
  return useQuery({
    queryKey: ['devices', 'stats'],
    queryFn: () => devicesApi.getStats(),
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute for real-time stats
  });
}
