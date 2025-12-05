import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsApi } from '../api/departments';
import { toast } from 'sonner';

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
    staleTime: 60000, // 1 minute
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => departmentsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string }) => departmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du département');
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      departmentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
      toast.success('Département modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du département');
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Département supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression du département');
    },
  });
}
