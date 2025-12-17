'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Edit, Trash2, User, Phone, Upload, Download, FileSpreadsheet, XCircle, ChevronLeft, ChevronRight, Building2, X, UserCircle, Briefcase, Calendar, UserPlus, Key, Eye, Copy, Check, Power, PowerOff } from 'lucide-react';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useDeleteAllEmployees, useCreateUserAccount, useGetCredentials, useDeleteUserAccount } from '@/lib/hooks/useEmployees';
import { useSites } from '@/lib/hooks/useSites';
import { useDepartments } from '@/lib/hooks/useDepartments';
import { usePositions } from '@/lib/hooks/usePositions';
import { ImportExcelModal } from '@/components/employees/ImportExcelModal';
import { AdvancedFilters } from '@/components/employees/AdvancedFilters';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { toast } from 'sonner';
import apiClient from '@/lib/api/client';
import type { EmployeeFilters } from '@/lib/api/employees';

export default function EmployeesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isMounted, setIsMounted] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<EmployeeFilters>({});
  const [formData, setFormData] = useState({
    matricule: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    positionId: '',
    siteId: '',
    departmentId: '',
    hireDate: new Date().toISOString().split('T')[0],
    createUserAccount: false,
    userEmail: '',
  });

  // Construire les filtres pour l'API
  const apiFilters: EmployeeFilters = useMemo(() => {
    const apiFilter: EmployeeFilters = {
      ...filters,
    };
    
    // Si searchQuery est défini, l'ajouter aux filtres
    if (searchQuery.trim()) {
      apiFilter.search = searchQuery.trim();
    }
    
    // Convertir isActive en boolean si défini
    if (apiFilter.isActive !== undefined) {
      // isActive est déjà un boolean, pas besoin de conversion
    }
    
    // Nettoyer les valeurs vides et ne pas inclure page/limit dans les query params
    // car le backend ne les gère pas directement
    Object.keys(apiFilter).forEach((key) => {
      const filterKey = key as keyof EmployeeFilters;
      if (apiFilter[filterKey] === '' || apiFilter[filterKey] === undefined) {
        delete apiFilter[filterKey];
      }
    });
    
    // Retirer page et limit car le backend ne les gère pas dans les query params
    delete apiFilter.page;
    delete apiFilter.limit;
    
    return apiFilter;
  }, [filters, searchQuery]);

  const { data: employees, isLoading, error, refetch } = useEmployees(apiFilters);
  const { data: sitesData } = useSites();
  const { data: departmentsData } = useDepartments();
  const { data: positionsData } = usePositions();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const deleteAllMutation = useDeleteAllEmployees();
  const createAccountMutation = useCreateUserAccount();
  const getCredentialsMutation = useGetCredentials();
  const deleteUserAccountMutation = useDeleteUserAccount();
  
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string; expiresAt: string; viewCount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Extraire les tableaux des réponses API (qui peuvent être { data: [...], total: number } ou directement un tableau)
  // Utiliser useMemo pour éviter les recalculs et les problèmes de rendu
  const sites = useMemo(() => {
    if (!sitesData) return [];
    if (Array.isArray(sitesData)) return sitesData;
    if (sitesData?.data && Array.isArray(sitesData.data)) return sitesData.data;
    return [];
  }, [sitesData]);
  
  const departments = useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (departmentsData?.data && Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);
  
  const positions = useMemo(() => {
    if (!positionsData) return [];
    if (Array.isArray(positionsData)) return positionsData;
    if (positionsData?.data && Array.isArray(positionsData.data)) return positionsData.data;
    return [];
  }, [positionsData]);

  const handleCreateEmployee = async () => {
    if (!formData.matricule || !formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Prepare data for API - only send non-empty values
    const createData: any = {
      matricule: formData.matricule,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      positionId: formData.positionId || undefined,
      siteId: formData.siteId || undefined,
      departmentId: formData.departmentId || undefined,
      hireDate: formData.hireDate,
    };

    await createMutation.mutateAsync(createData);
    setShowCreateModal(false);
    setFormData({
      matricule: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      positionId: '',
      siteId: '',
      departmentId: '',
      hireDate: new Date().toISOString().split('T')[0],
      createUserAccount: false,
      userEmail: '',
    });
  };

  const handleEdit = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      matricule: employee.matricule || '',
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      position: employee.position || '',
      positionId: employee.positionId || '',
      siteId: employee.siteId || '',
      departmentId: employee.departmentId || '',
      hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setShowEditModal(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const updateData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      positionId: formData.positionId || undefined,
      siteId: formData.siteId || undefined,
      departmentId: formData.departmentId || undefined,
      hireDate: formData.hireDate,
    };

    await updateMutation.mutateAsync({ id: editingEmployee.id, data: updateData });
    setShowEditModal(false);
    setEditingEmployee(null);
    setFormData({
      matricule: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      positionId: '',
      siteId: '',
      departmentId: '',
      hireDate: new Date().toISOString().split('T')[0],
      createUserAccount: false,
      userEmail: '',
    });
  };

  const handleToggleActive = async (employee: any) => {
    const newStatus = !employee.isActive;
    const statusText = newStatus ? 'actif' : 'inactif';
    
    if (confirm(`Êtes-vous sûr de vouloir ${newStatus ? 'activer' : 'désactiver'} l'employé ${employee.firstName} ${employee.lastName} ?`)) {
      try {
        await updateMutation.mutateAsync({
          id: employee.id,
          data: { isActive: newStatus },
        });
        toast.success(`L'employé a été marqué comme ${statusText}`);
      } catch (error) {
        // Error is already handled by the mutation
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?\n\nCette action est irréversible et supprimera également toutes les données associées (pointages, plannings, etc.).')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        // Error is already handled by the mutation
      }
    }
  };

  const handleDeleteAll = async () => {
    const employeeCount = Array.isArray(employees) ? employees.length : 0;
    if (employeeCount === 0) {
      toast.error('Aucun employé à supprimer');
      return;
    }

    if (confirm(`⚠️ ATTENTION: Voulez-vous vraiment supprimer TOUS les ${employeeCount} employés ?\n\nCette action est IRRÉVERSIBLE!`)) {
      if (confirm(`Confirmation finale: Supprimer ${employeeCount} employés?`)) {
        await deleteAllMutation.mutateAsync();
        refetch();
      }
    }
  };

  const handleViewCredentials = async (employeeId: string) => {
    try {
      const creds = await getCredentialsMutation.mutateAsync(employeeId);
      setCredentials(creds);
      setShowCredentialsModal(true);
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleCopyCredentials = () => {
    if (!credentials) return;
    const text = `Email: ${credentials.email}\nMot de passe: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Identifiants copiés dans le presse-papier');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await apiClient.get('/employees/export/excel', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export Excel réussi!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  // Extraire les employés de la réponse API (peut être un tableau ou { data: [...], total: number })
  const employeesList = useMemo(() => {
    if (!employees) return [];
    if (Array.isArray(employees)) return employees;
    if (employees?.data && Array.isArray(employees.data)) return employees.data;
    return [];
  }, [employees]);

  const totalCount = useMemo(() => {
    if (!employees) return 0;
    if (Array.isArray(employees)) return employees.length;
    if (employees?.total !== undefined) return employees.total;
    if (employees?.data && Array.isArray(employees.data)) return employees.data.length;
    return 0;
  }, [employees]);

  // Pagination logic - gérée côté client sur les résultats filtrés
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const paginatedEmployees = employeesList.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  const handleFiltersChange = (newFilters: EmployeeFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Fix hydration error by ensuring consistent initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <DashboardLayout
      title="Gestion des Employés"
      subtitle="Liste et gestion des employés de l'entreprise"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                type="text"
                placeholder="Rechercher un employé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <PermissionGate permission="employee.delete">
              <Button
                variant="outline"
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending || totalCount === 0}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {deleteAllMutation.isPending ? 'Suppression...' : 'Tout Supprimer'}
              </Button>
            </PermissionGate>
            <PermissionGate permissions={['employee.export', 'employee.view_all']}>
              <Button
                variant="outline"
                onClick={handleExportExcel}
                disabled={isExporting || totalCount === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Export en cours...' : 'Exporter Excel'}
              </Button>
            </PermissionGate>
            <PermissionGate permission="employee.import">
              <Button variant="outline" onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Importer Excel
              </Button>
            </PermissionGate>
            <PermissionGate permission="employee.create">
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Employé
              </Button>
            </PermissionGate>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
          sites={sites}
          departments={departments}
          isOpen={showAdvancedFilters}
          onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total employés</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {totalCount}
                  </p>
                </div>
                <User className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des employés</CardTitle>
          </CardHeader>
          <CardContent>
            {!isMounted ? (
              <div className="text-center py-12 text-text-secondary">Chargement...</div>
            ) : isLoading ? (
              <div className="text-center py-12 text-text-secondary">Chargement...</div>
            ) : error ? (
              <Alert variant="danger">
                <AlertDescription>Erreur lors du chargement des employés</AlertDescription>
              </Alert>
            ) : employeesList.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucun employé trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-table-header text-left text-sm font-semibold text-text-primary">
                      <th className="p-3">Matricule</th>
                      <th className="p-3">Nom complet</th>
                      <th className="p-3">Téléphone</th>
                      <th className="p-3">Poste</th>
                      <th className="p-3">Département</th>
                      <th className="p-3">Région</th>
                      <th className="p-3">Date d'embauche</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Compte</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border">
                    {paginatedEmployees.map((employee: any) => (
                      <tr key={employee.id} className="hover:bg-table-hover transition-colors">
                        <td className="p-3 font-mono text-sm font-semibold text-primary">{employee.matricule}</td>
                        <td className="p-3">
                          <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                          {employee.civilite && (
                            <div className="text-xs text-text-secondary">{employee.civilite}</div>
                          )}
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {employee.phone || '—'}
                          </div>
                        </td>
                        <td className="p-3 text-sm">
                          <div>{employee.position || '—'}</div>
                          {employee.contractType && (
                            <div className="text-xs text-text-secondary">{employee.contractType}</div>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {employee.department?.name || '—'}
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {employee.region || employee.site?.name || employee.site?.city || '—'}
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Badge variant={employee.isActive ? 'success' : 'default'}>
                              {employee.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                            <PermissionGate permission="employee.update">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(employee)}
                                disabled={updateMutation.isPending}
                                title={employee.isActive ? 'Désactiver l\'employé' : 'Activer l\'employé'}
                                className="h-7 w-7 p-0 hover:bg-gray-100"
                              >
                                {employee.isActive ? (
                                  <PowerOff className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                                ) : (
                                  <Power className="h-3.5 w-3.5 text-gray-500 hover:text-green-600" />
                                )}
                              </Button>
                            </PermissionGate>
                          </div>
                        </td>
                        <td className="p-3">
                          {employee.userId || employee.user ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="success" className="flex items-center gap-1 w-fit">
                                <Key className="h-3 w-3" />
                                Compte actif
                              </Badge>
                              <PermissionGate permission="employee.view_all">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewCredentials(employee.id)}
                                  title="Consulter les identifiants"
                                  className="text-primary hover:text-primary-dark"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </PermissionGate>
                              <PermissionGate permission="employee.update">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Êtes-vous sûr de vouloir supprimer le compte d'accès de ${employee.firstName} ${employee.lastName} ?\n\nL'employé ne sera pas supprimé, seul son compte d'authentification sera supprimé.`)) {
                                      deleteUserAccountMutation.mutate(employee.id);
                                    }
                                  }}
                                  disabled={deleteUserAccountMutation.isPending}
                                  title="Supprimer le compte d'accès"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </PermissionGate>
                            </div>
                          ) : (
                            <PermissionGate permission="employee.update">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (confirm(`Créer un compte d'accès pour ${employee.firstName} ${employee.lastName} ?\n\nUn email et un mot de passe seront générés automatiquement.`)) {
                                    createAccountMutation.mutate({ id: employee.id });
                                  }
                                }}
                                disabled={createAccountMutation.isPending}
                                title="Créer un compte d'accès"
                                className="text-primary hover:text-primary-dark"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Créer compte
                              </Button>
                            </PermissionGate>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <PermissionGate permission="employee.update">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(employee)}
                                title="Modifier l'employé"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </PermissionGate>
                            <PermissionGate permission="employee.delete">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(employee.id)}
                                disabled={deleteMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {employeesList.length > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-table-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary">
                    Affichage de {startIndex + 1} à {endIndex} sur {totalCount} employé{totalCount > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <label className="text-sm text-text-secondary">Lignes par page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-border rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNumber)}
                          className="min-w-[2rem]"
                        >
                          {pageNumber}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import Excel Modal */}
        {showImportModal && (
          <ImportExcelModal
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              refetch();
              setShowImportModal(false);
            }}
          />
        )}

        {/* Create Employee Modal */}
        {showCreateModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <Card 
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Nouvel Employé</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Remplissez les informations pour créer un nouvel employé</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCreateModal(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Section 1: Informations Personnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <User className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Matricule <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.matricule}
                          onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                          placeholder="EMP001"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Date d'embauche <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={formData.hireDate}
                          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Jean"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Dupont"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@entreprise.com"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Téléphone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0612345678"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Affectation Organisationnelle */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Affectation Organisationnelle</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Site
                        </label>
                        <select
                          value={formData.siteId}
                          onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner un site</option>
                          {sites.map((site: any) => (
                            <option key={site.id} value={site.id}>
                              {site.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Département
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner un département</option>
                          {departments.map((dept: any) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Fonction et Poste */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Fonction et Poste</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Fonction/Position
                        </label>
                        <select
                          value={formData.positionId}
                          onChange={(e) => {
                            const selectedPosition = positions.find((p: any) => p.id === e.target.value);
                            setFormData({
                              ...formData,
                              positionId: e.target.value,
                              position: selectedPosition ? selectedPosition.name : formData.position,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner une fonction</option>
                          {positions.map((pos: any) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Poste (texte libre)
                        </label>
                        <Input
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value, positionId: '' })}
                          placeholder="Développeur (si fonction non listée)"
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">Utilisé si aucune fonction n'est sélectionnée</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Compte d'Accès */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <UserCircle className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Compte d'Accès</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="createUserAccount"
                          checked={formData.createUserAccount}
                          onChange={(e) => setFormData({ ...formData, createUserAccount: e.target.checked, userEmail: '' })}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor="createUserAccount" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Créer un compte d'accès pour cet employé
                        </label>
                      </div>
                      {formData.createUserAccount && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email du compte (optionnel)
                          </label>
                          <Input
                            type="email"
                            value={formData.userEmail}
                            onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                            placeholder="Si vide, un email sera généré automatiquement"
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            Si non spécifié, un email sera généré automatiquement au format: {formData.matricule || 'matricule'}@tenant.local
                          </p>
                          <p className="text-xs text-blue-600 mt-1.5">
                            ⓘ Un mot de passe sécurisé sera généré automatiquement. L'employé devra le changer à sa première connexion.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateModal(false)}
                      disabled={createMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleCreateEmployee}
                      disabled={createMutation.isPending || !formData.matricule || !formData.firstName || !formData.lastName || !formData.email}
                      className="min-w-[120px]"
                    >
                      {createMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Création...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Créer l'employé
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Credentials Modal */}
        {showCredentialsModal && credentials && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCredentialsModal(false);
              setCredentials(null);
            }}
          >
            <Card 
              className="w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Key className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900">Identifiants d'accès</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Identifiants du compte d'accès</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowCredentialsModal(false);
                      setCredentials(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription className="text-sm">
                      ⚠️ Ces identifiants sont valides pendant 7 jours. Notez-les dans un endroit sûr.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={credentials.email}
                          readOnly
                          className="font-mono text-sm bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(credentials.email);
                            toast.success('Email copié');
                          }}
                          title="Copier l'email"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mot de passe
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={credentials.password}
                          readOnly
                          className="font-mono text-sm bg-gray-50"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(credentials.password);
                            toast.success('Mot de passe copié');
                          }}
                          title="Copier le mot de passe"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Consultations: {credentials.viewCount}</span>
                      <span>Expire le: {new Date(credentials.expiresAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleCopyCredentials}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copié !
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copier les identifiants
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Employee Modal */}
        {showEditModal && editingEmployee && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowEditModal(false);
              setEditingEmployee(null);
            }}
          >
            <Card 
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Edit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">Modifier l'employé</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">Modifiez les informations de {editingEmployee.firstName} {editingEmployee.lastName}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEmployee(null);
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Section 1: Informations Personnelles */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <User className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations Personnelles</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Matricule
                        </label>
                        <Input
                          value={formData.matricule}
                          disabled
                          className="w-full bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">Le matricule ne peut pas être modifié</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Date d'embauche <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={formData.hireDate}
                          onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Prénom <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="Jean"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nom <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="Dupont"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@entreprise.com"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Téléphone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="0612345678"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Affectation Organisationnelle */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Building2 className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Affectation Organisationnelle</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Site
                        </label>
                        <select
                          value={formData.siteId}
                          onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner un site</option>
                          {sites.map((site: any) => (
                            <option key={site.id} value={site.id}>
                              {site.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Département
                        </label>
                        <select
                          value={formData.departmentId}
                          onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner un département</option>
                          {departments.map((dept: any) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Fonction et Poste */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                      <Briefcase className="h-5 w-5 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Fonction et Poste</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Fonction/Position
                        </label>
                        <select
                          value={formData.positionId}
                          onChange={(e) => {
                            const selectedPosition = positions.find((p: any) => p.id === e.target.value);
                            setFormData({
                              ...formData,
                              positionId: e.target.value,
                              position: selectedPosition ? selectedPosition.name : formData.position,
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                          <option value="">Sélectionner une fonction</option>
                          {positions.map((pos: any) => (
                            <option key={pos.id} value={pos.id}>
                              {pos.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Poste (texte libre)
                        </label>
                        <Input
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value, positionId: '' })}
                          placeholder="Développeur (si fonction non listée)"
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1.5">Utilisé si aucune fonction n'est sélectionnée</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingEmployee(null);
                      }}
                      disabled={updateMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpdateEmployee}
                      disabled={updateMutation.isPending || !formData.firstName || !formData.lastName || !formData.email}
                      className="min-w-[120px]"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Modification...
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Enregistrer
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
