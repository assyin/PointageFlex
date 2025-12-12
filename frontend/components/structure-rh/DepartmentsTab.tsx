'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/lib/hooks/useDepartments';
import type { Department, CreateDepartmentDto } from '@/lib/api/departments';
import { Plus, Pencil, Trash2, Building2, Search, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DepartmentsTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<CreateDepartmentDto>({
    name: '',
    code: '',
    description: '',
  });

  const { data: departments, isLoading } = useDepartments();

  // Fix hydration mismatch by ensuring client-side only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name.trim()) {
      return;
    }
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateOpen(false);
      setFormData({ name: '', code: '', description: '' });
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code || '',
      description: department.description || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name.trim()) {
      return;
    }
    if (editingDepartment) {
      try {
        await updateMutation.mutateAsync({
          id: editingDepartment.id,
          data: formData,
        });
        setEditingDepartment(null);
        setFormData({ name: '', code: '', description: '' });
      } catch (error) {
        // Error is handled by the mutation's onError callback
      }
    }
  };

  const handleDelete = async () => {
    if (deletingDepartment) {
      await deleteMutation.mutateAsync(deletingDepartment.id);
      setDeletingDepartment(null);
    }
  };

  const filteredDepartments = departments?.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 rounded-lg">
            <Building2 className="h-5 w-5 text-gray-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Départements</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Gérez les départements de votre organisation
            </p>
          </div>
        </div>
        <PermissionGate permission="tenant.manage_departments">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau département
          </Button>
        </PermissionGate>
      </div>

      {/* Search */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher un département par nom ou code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                <TableHead className="font-semibold text-gray-700 py-4">Nom</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Code</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Description</TableHead>
                <TableHead className="font-semibold text-gray-700 py-4">Employés</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!isMounted || isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      <p className="text-gray-500">Chargement des départements...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDepartments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <Building2 className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">Aucun département trouvé</p>
                      <p className="text-sm text-gray-500">
                        {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Commencez par créer votre premier département'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments?.map((department) => (
                  <TableRow
                    key={department.id}
                    className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
                  >
                    <TableCell className="font-semibold text-gray-900 py-4">
                      {department.name}
                    </TableCell>
                    <TableCell className="py-4">
                      {department.code ? (
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200">
                          {department.code}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-600 py-4">
                      {department.description || (
                        <span className="text-gray-400 italic">Aucune description</span>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge variant="default" className="border-gray-300 text-gray-700">
                        {department._count?.employees || 0} employé{department._count?.employees !== 1 ? 's' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right py-4">
                      <div className="flex justify-end gap-2">
                        <PermissionGate permission="tenant.manage_departments">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(department)}
                            className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingDepartment(department)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingDepartment}
        onOpenChange={(open) => {
          // Prevent closing during mutation
          if (!open && (createMutation.isPending || updateMutation.isPending)) {
            return;
          }
          if (!open) {
            setIsCreateOpen(false);
            setEditingDepartment(null);
            setFormData({ name: '', code: '', description: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={editingDepartment ? handleUpdate : handleCreate}>
            <DialogHeader className="pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-700" />
                </div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {editingDepartment ? 'Modifier le département' : 'Nouveau département'}
                </DialogTitle>
              </div>
              <DialogDescription className="text-gray-600">
                {editingDepartment
                  ? 'Modifiez les informations du département'
                  : 'Créez un nouveau département dans votre organisation'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ressources Humaines"
                  required
                  className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                  Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: RH"
                  maxLength={20}
                  className="h-11 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description du département..."
                  rows={3}
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 resize-none"
                />
              </div>
            </div>
            <DialogFooter className="border-t border-gray-200 pt-4 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingDepartment(null);
                  setFormData({ name: '', code: '', description: '' });
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg min-w-[100px]"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingDepartment ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement le département{' '}
              <strong>{deletingDepartment?.name}</strong>.
              {deletingDepartment?._count?.employees ? (
                <span className="block mt-2 text-destructive">
                  Attention : {deletingDepartment._count.employees} employé(s) sont
                  actuellement assignés à ce département.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
