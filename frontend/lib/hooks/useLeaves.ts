import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leavesApi, type Leave, type CreateLeaveDto, type LeaveFilters, type LeaveType } from '../api/leaves';
import { toast } from 'sonner';

// Fetch leaves with filters
export function useLeaves(filters?: LeaveFilters) {
  return useQuery({
    queryKey: ['leaves', filters],
    queryFn: () => leavesApi.getAll(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Fetch single leave
export function useLeaveDetail(id: string) {
  return useQuery({
    queryKey: ['leaves', id],
    queryFn: () => leavesApi.getById(id),
    enabled: !!id,
  });
}

// Fetch leave types
export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leaveTypes'],
    queryFn: () => leavesApi.getLeaveTypes(),
    staleTime: 300000, // 5 minutes - types don't change often
  });
}

// Fetch leave balance for an employee
export function useLeaveBalance(employeeId: string) {
  return useQuery({
    queryKey: ['leaveBalance', employeeId],
    queryFn: () => leavesApi.getBalance(employeeId),
    enabled: !!employeeId,
    staleTime: 60000, // 1 minute
  });
}

// Create new leave request
export function useCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLeaveDto) => leavesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      toast.success('Demande de congé créée avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la création de la demande'
      );
    },
  });
}

// Update leave request
export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLeaveDto> }) =>
      leavesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', variables.id] });
      toast.success('Demande de congé modifiée avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la modification de la demande'
      );
    },
  });
}

// Approve leave request
export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, level }: { id: string; level: 'manager' | 'hr' }) =>
      leavesApi.approve(id, level),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      toast.success(
        `Demande approuvée au niveau ${variables.level === 'manager' ? 'manager' : 'RH'}`
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de l\'approbation de la demande'
      );
    },
  });
}

// Reject leave request
export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leavesApi.reject(id, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaves', variables.id] });
      toast.success('Demande rejetée');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors du rejet de la demande'
      );
    },
  });
}

// Delete leave request
export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leavesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalance'] });
      toast.success('Demande de congé supprimée avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la suppression de la demande'
      );
    },
  });
}

// Create leave type
export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => leavesApi.createLeaveType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      toast.success('Type de congé créé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la création du type de congé'
      );
    },
  });
}

// Update leave type
export function useUpdateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      leavesApi.updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      toast.success('Type de congé modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la modification du type de congé'
      );
    },
  });
}

// Delete leave type
export function useDeleteLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leavesApi.deleteLeaveType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveTypes'] });
      toast.success('Type de congé supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erreur lors de la suppression du type de congé'
      );
    },
  });
}
