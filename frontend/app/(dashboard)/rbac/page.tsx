'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useUserRoles, useAssignRolesToUser, useRemoveRoleFromUser } from '@/lib/hooks/useUsers';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole, useResetDefaultPermissions } from '@/lib/hooks/useRoles';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Plus, Edit, Trash2, KeyRound, User, Shield, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [tenantId, setTenantId] = useState<string | undefined>(undefined);

  // Get tenantId from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('tenantId') || undefined;
      setTenantId(id);
    }
  }, []);

  // Users
  const { data: users, isLoading: usersLoading, error: usersError } = useUsers(tenantId);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Roles
  const { data: roles, isLoading: rolesLoading, error: rolesError } = useRoles(tenantId);
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();
  const resetPermissionsMutation = useResetDefaultPermissions();

  // Debug: Log roles data
  useEffect(() => {
    if (roles && roles.length > 0) {
      console.log('Roles data:', roles);
      roles.forEach((role: any) => {
        console.log(`Role ${role.name} (${role.code}):`, {
          permissionsCount: role.permissions?.length || 0,
          permissions: role.permissions,
        });
      });
    }
  }, [roles]);

  // Permissions
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();

  return (
    <ProtectedRoute permission="role.view_all">
      <DashboardLayout title="Gestion des accès" subtitle="Gérez les utilisateurs, rôles et permissions">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <User className="h-4 w-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Rôles
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <KeyRound className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Liste des utilisateurs</h3>
              <PermissionGate permission="user.create">
                <CreateUserDialog
                  onCreate={(data) => {
                    createUserMutation.mutate({ ...data, tenantId }, {
                      onSuccess: () => {
                        toast.success('Utilisateur créé avec succès');
                      },
                      onError: (error: any) => {
                        toast.error(error?.response?.data?.message || 'Erreur lors de la création');
                      },
                    });
                  }}
                />
              </PermissionGate>
            </div>
            {!tenantId ? (
              <div className="text-center py-8 text-yellow-600">
                ⚠️ Tenant ID non trouvé. Veuillez vous reconnecter.
              </div>
            ) : usersLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : usersError ? (
              <div className="text-center py-8 text-red-500">
                <p className="font-semibold">Erreur lors du chargement</p>
                <p className="text-sm mt-2">{usersError instanceof Error ? usersError.message : 'Erreur inconnue'}</p>
                <p className="text-xs mt-2 text-gray-500">Tenant ID: {tenantId}</p>
              </div>
            ) : !users || users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">Aucun utilisateur trouvé pour ce tenant.</p>
                <p className="text-sm">Créez votre premier utilisateur ou vérifiez que la migration a été effectuée.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Nom</th>
                      <th className="text-left p-3">Rôles</th>
                      <th className="text-left p-3">Statut</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        tenantId={tenantId}
                        onUpdate={(data) => {
                          updateUserMutation.mutate({ id: user.id, data }, {
                            onSuccess: () => {
                              toast.success('Utilisateur modifié avec succès');
                            },
                            onError: (error: any) => {
                              toast.error(error?.response?.data?.message || 'Erreur lors de la modification');
                            },
                          });
                        }}
                        onDelete={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
                            deleteUserMutation.mutate(user.id, {
                              onSuccess: () => {
                                toast.success('Utilisateur supprimé avec succès');
                              },
                              onError: (error: any) => {
                                toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
                              },
                            });
                          }
                        }}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Liste des rôles</h3>
              <PermissionGate permission="role.create">
                <CreateRoleDialog
                  onCreate={(data) => {
                    createRoleMutation.mutate(data, {
                      onSuccess: () => {
                        toast.success('Rôle créé avec succès');
                      },
                      onError: (error: any) => {
                        toast.error(error?.response?.data?.message || 'Erreur lors de la création');
                      },
                    });
                  }}
                  permissions={permissions || []}
                  tenantId={tenantId}
                />
              </PermissionGate>
            </div>
            {rolesLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : rolesError ? (
              <div className="text-center py-8 text-red-500">
                Erreur: {rolesError instanceof Error ? rolesError.message : 'Erreur lors du chargement'}
              </div>
            ) : !roles || roles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun rôle trouvé. Créez votre premier rôle.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Nom</th>
                      <th className="text-left p-3">Code</th>
                      <th className="text-left p-3">Description</th>
                      <th className="text-left p-3">Type</th>
                      <th className="text-left p-3">Permissions</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => (
                      <RoleRow
                        key={role.id}
                        role={role}
                        onUpdate={(data) => {
                          updateRoleMutation.mutate({ id: role.id, data }, {
                            onSuccess: () => {
                              toast.success('Rôle modifié avec succès');
                            },
                            onError: (error: any) => {
                              toast.error(error?.response?.data?.message || 'Erreur lors de la modification');
                            },
                          });
                        }}
                        onDelete={() => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
                            deleteRoleMutation.mutate(role.id, {
                              onSuccess: () => {
                                toast.success('Rôle supprimé avec succès');
                              },
                              onError: (error: any) => {
                                toast.error(error?.response?.data?.message || 'Erreur lors de la suppression');
                              },
                            });
                          }
                        }}
                        onResetPermissions={() => {
                          if (confirm('Êtes-vous sûr de vouloir réinitialiser les permissions par défaut pour ce rôle ?')) {
                            resetPermissionsMutation.mutate(role.id, {
                              onSuccess: () => {
                                toast.success('Permissions réinitialisées avec succès');
                              },
                              onError: (error: any) => {
                                toast.error(error?.response?.data?.message || 'Erreur lors de la réinitialisation');
                              },
                            });
                          }
                        }}
                        permissions={permissions || []}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Liste des permissions</h3>
            {permissionsLoading ? (
              <div className="text-center py-8">Chargement...</div>
            ) : (
              <div className="space-y-4">
                {permissions?.reduce((acc: Record<string, any[]>, perm) => {
                  if (!acc[perm.category]) acc[perm.category] = [];
                  acc[perm.category].push(perm);
                  return acc;
                }, {}) && Object.entries(
                  permissions?.reduce((acc: Record<string, any[]>, perm) => {
                    if (!acc[perm.category]) acc[perm.category] = [];
                    acc[perm.category].push(perm);
                    return acc;
                  }, {}) || {}
                ).map(([category, perms]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Badge variant="outline">{perm.code}</Badge>
                          <span className="text-sm">{perm.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
    </ProtectedRoute>
  );
}

// User Row Component
function UserRow({
  user,
  tenantId,
  onUpdate,
  onDelete,
}: {
  user: any;
  tenantId?: string;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}) {
  const { data: userRoles } = useUserRoles(user.id);
  const assignRolesMutation = useAssignRolesToUser();
  const removeRoleMutation = useRemoveRoleFromUser();

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">{user.email}</td>
      <td className="p-3">{user.firstName} {user.lastName}</td>
      <td className="p-3">
        <div className="flex gap-2 flex-wrap">
          {userRoles?.map((utr) => (
            <Badge key={utr.id} variant="outline">
              {utr.role.name}
              <PermissionGate permission="user.remove_roles">
                <button
                  onClick={() => {
                    if (confirm('Retirer ce rôle ?')) {
                      removeRoleMutation.mutate({ userId: user.id, roleId: utr.roleId }, {
                        onSuccess: () => {
                          toast.success('Rôle retiré avec succès');
                        },
                        onError: (error: any) => {
                          toast.error(error?.response?.data?.message || 'Erreur lors du retrait du rôle');
                        },
                      });
                    }
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </PermissionGate>
            </Badge>
          ))}
          <PermissionGate permission="user.assign_roles">
            <AssignRoleDialog
              userId={user.id}
              currentRoles={userRoles?.map((utr) => utr.roleId) || []}
              onAssign={(roleIds) => {
                assignRolesMutation.mutate({ userId: user.id, data: { roleIds } }, {
                  onSuccess: () => {
                    toast.success('Rôles assignés avec succès');
                  },
                  onError: (error: any) => {
                    toast.error(error?.response?.data?.message || 'Erreur lors de l\'assignation');
                  },
                });
              }}
            />
          </PermissionGate>
        </div>
      </td>
      <td className="p-3">
        <Badge variant={user.isActive ? 'default' : 'secondary'}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      </td>
      <td className="p-3 text-right">
        <div className="flex gap-2 justify-end">
          <PermissionGate permission="user.update">
            <EditUserDialog user={user} onUpdate={onUpdate} />
          </PermissionGate>
          <PermissionGate permission="user.delete">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

// Role Row Component
function RoleRow({
  role,
  onUpdate,
  onDelete,
  onResetPermissions,
  permissions,
}: {
  role: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
  onResetPermissions?: () => void;
  permissions: any[];
}) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">{role.name}</td>
      <td className="p-3">
        <Badge variant="outline">{role.code}</Badge>
      </td>
      <td className="p-3">{role.description || '-'}</td>
      <td className="p-3">
        <Badge variant={role.isSystem ? 'default' : 'secondary'}>
          {role.isSystem ? 'Système' : 'Personnalisé'}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex gap-1 flex-wrap items-center">
          {(() => {
            // Extraire les permissions correctement (gérer la structure avec relation permission)
            const rolePermissions = role.permissions?.map((p: any) => ({
              id: p.permission?.id || p.id,
              code: p.permission?.code || p.code,
            })).filter((p: any) => p && p.code) || [];
            
            const permissionsCount = rolePermissions.length;
            
            return (
              <>
                {permissionsCount > 0 ? (
                  <>
                    {rolePermissions.slice(0, 3).map((perm: any) => (
                      <Badge key={perm.id || perm.code} variant="outline" className="text-xs">
                        {perm.code}
                      </Badge>
                    ))}
                    {permissionsCount > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{permissionsCount - 3}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 ml-2">
                      ({permissionsCount} {permissionsCount === 1 ? 'permission' : 'permissions'})
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Aucune permission</span>
                )}
              </>
            );
          })()}
        </div>
      </td>
      <td className="p-3 text-right">
        <div className="flex gap-2 justify-end">
          <PermissionGate permission="role.update">
            <EditRoleDialog role={role} onUpdate={onUpdate} permissions={permissions} />
          </PermissionGate>
          {role.isSystem && onResetPermissions && (
            <PermissionGate permission="role.update">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-700"
                onClick={onResetPermissions}
                title="Réinitialiser les permissions par défaut"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </PermissionGate>
          )}
          {!role.isSystem && (
            <PermissionGate permission="role.delete">
              <Button variant="ghost" size="sm" className="text-red-500" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </PermissionGate>
          )}
        </div>
      </td>
    </tr>
  );
}

// Create User Dialog
function CreateUserDialog({ onCreate }: { onCreate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ email: '', password: '', firstName: '', lastName: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Mot de passe</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Prénom</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit User Dialog
function EditUserDialog({ user, onUpdate }: { user: any; onUpdate: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Prénom</Label>
            <Input
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Actif</Label>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Create Role Dialog
function CreateRoleDialog({
  onCreate,
  permissions,
  tenantId,
}: {
  onCreate: (data: any) => void;
  permissions: any[];
  tenantId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    permissionCodes: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setOpen(false);
    setFormData({ name: '', code: '', description: '', permissionCodes: [] });
  };

  const togglePermission = (code: string) => {
    setFormData({
      ...formData,
      permissionCodes: formData.permissionCodes.includes(code)
        ? formData.permissionCodes.filter((c) => c !== code)
        : [...formData.permissionCodes, code],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rôle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un rôle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Code</Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.permissionCodes.includes(perm.code)}
                    onChange={() => togglePermission(perm.code)}
                  />
                  <span className="text-sm">{perm.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {perm.code}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Role Dialog
function EditRoleDialog({
  role,
  onUpdate,
  permissions,
}: {
  role: any;
  onUpdate: (data: any) => void;
  permissions: any[];
}) {
  const [open, setOpen] = useState(false);
  
  // Extraire les codes de permissions correctement
  const getPermissionCodes = (rolePermissions: any[]) => {
    if (!rolePermissions || !Array.isArray(rolePermissions)) return [];
    return rolePermissions
      .map((p: any) => {
        // Le backend retourne permissions avec une relation permission
        return p.permission?.code || p.code;
      })
      .filter((code: string) => code && code !== null && code !== undefined);
  };

  const [formData, setFormData] = useState({
    name: role.name,
    description: role.description || '',
    isActive: role.isActive,
    permissionCodes: getPermissionCodes(role.permissions),
  });

  // Mettre à jour le formulaire quand le rôle change ou quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      setFormData({
        name: role.name,
        description: role.description || '',
        isActive: role.isActive,
        permissionCodes: getPermissionCodes(role.permissions),
      });
    }
  }, [open, role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setOpen(false);
  };

  const togglePermission = (code: string) => {
    setFormData({
      ...formData,
      permissionCodes: formData.permissionCodes.includes(code)
        ? formData.permissionCodes.filter((c) => c !== code)
        : [...formData.permissionCodes, code],
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le rôle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Nom</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={role.isSystem}
            />
          </div>
          <div>
            <Label>Code</Label>
            <Input value={role.code} disabled />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={role.isSystem}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={role.isSystem}
            />
            <Label htmlFor="isActive">Actif</Label>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {permissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.permissionCodes.includes(perm.code)}
                    onChange={() => togglePermission(perm.code)}
                  />
                  <span className="text-sm">{perm.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {perm.code}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Assign Role Dialog
function AssignRoleDialog({
  userId,
  currentRoles,
  onAssign,
}: {
  userId: string;
  currentRoles: string[];
  onAssign: (roleIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const { data: roles } = useRoles();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(selectedRoles);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Ajouter rôle
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner des rôles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Rôles</Label>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
              {roles?.map((role) => (
                <label key={role.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role.id]);
                      } else {
                        setSelectedRoles(selectedRoles.filter((id) => id !== role.id));
                      }
                    }}
                  />
                  <span className="text-sm">{role.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {role.code}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Assigner</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
