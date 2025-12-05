import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi, type Employee, type CreateEmployeeDto, type UpdateEmployeeDto, type EmployeeFilters } from '../api/employees';
import { toast } from 'sonner';
import { isAuthenticated } from '../utils/auth';

export function useEmployees(filters?: EmployeeFilters) {
  return useQuery({
    queryKey: ['employees', filters],
    queryFn: () => employeesApi.getAll(filters),
    enabled: isAuthenticated(),
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error: any) => {
      // Ne pas retry si c'est une erreur 401
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé créé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'employé');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeDto }) =>
      employeesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] });
      toast.success('Employé modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la modification de l\'employé');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employé supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression de l\'employé');
    },
  });
}

export function useDeleteAllEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => employeesApi.deleteAll(),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success(`${data.data.count} employé(s) supprimé(s) avec succès`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression des employés');
    },
  });
}
