'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  usePreferences,
  useUpdatePreferences,
  useSessions,
  useRevokeSession,
  useProfileStats,
  useExportUserData,
  useUploadAvatar,
  useRemoveAvatar,
} from '@/lib/hooks/useProfile';
import { useOvertimeSummary, useOvertimeRecords } from '@/lib/hooks/useOvertime';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format as formatDate } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  Shield,
  Settings,
  BarChart3,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Smartphone,
  Monitor,
  LogOut,
  Clock,
  TrendingUp,
  AlertCircle,
  KeyRound,
  Building2,
  Users,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ProfilePage() {
  const { user: authUser, hasPermission, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('info');

  // Fetch data
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: stats, isLoading: statsLoading } = useProfileStats();
  
  // Calculate monthly and weekly totals from overtime records
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const { data: overtimeData } = useOvertimeRecords({
    employeeId: profile?.employee?.id,
    startDate: formatDate(monthStart, 'yyyy-MM-dd'),
    endDate: formatDate(monthEnd, 'yyyy-MM-dd'),
  });
  
  // Calculate monthly and weekly totals
  const monthlyTotal = overtimeData?.data?.reduce((sum: number, record: any) => {
    const recordDate = new Date(record.date);
    if (recordDate >= monthStart && recordDate <= monthEnd && record.status === 'APPROVED') {
      const hours = record.approvedHours || record.hours || 0;
      return sum + (typeof hours === 'string' ? parseFloat(hours) : hours);
    }
    return sum;
  }, 0) || 0;
  
  const weeklyTotal = overtimeData?.data?.reduce((sum: number, record: any) => {
    const recordDate = new Date(record.date);
    if (recordDate >= weekStart && recordDate <= weekEnd && record.status === 'APPROVED') {
      const hours = record.approvedHours || record.hours || 0;
      return sum + (typeof hours === 'string' ? parseFloat(hours) : hours);
    }
    return sum;
  }, 0) || 0;

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updatePreferencesMutation = useUpdatePreferences();
  const revokeSessionMutation = useRevokeSession();
  const exportDataMutation = useExportUserData();
  const uploadAvatarMutation = useUploadAvatar();
  const removeAvatarMutation = useRemoveAvatar();

  // File input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [userPreferences, setUserPreferences] = useState({
    language: 'fr',
    timezone: 'Africa/Casablanca',
    notifications: {
      email: {
        leaves: true,
        planning: true,
        alerts: false,
      },
      push: {
        mobile: true,
        desktop: false,
      },
      sms: false,
    },
  });

  // Update states when data is fetched
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (preferences) {
      setUserPreferences({
        language: preferences.language || 'fr',
        timezone: preferences.timezone || 'Africa/Casablanca',
        notifications: preferences.notifications || {
          email: { leaves: true, planning: true, alerts: false },
          push: { mobile: true, desktop: false },
          sms: false,
        },
      });
    }
  }, [preferences]);

  // Check if user can modify name (EMPLOYEE cannot)
  const canModifyName = authUser?.role !== 'EMPLOYEE' || 
    (authUser?.roles && !authUser.roles.includes('EMPLOYEE'));

  // Handlers
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: canModifyName ? personalInfo.firstName : undefined,
        lastName: canModifyName ? personalInfo.lastName : undefined,
        phone: personalInfo.phone,
      });
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync(userPreferences as any);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      }
    }
  };

  const handleExportData = async () => {
    exportDataMutation.mutate();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop grande. Taille maximum : 5MB');
      return;
    }

    uploadAvatarMutation.mutate(file);
  };

  const handleRemoveAvatar = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      removeAvatarMutation.mutate();
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 33, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 66, label: 'Moyen', color: 'bg-orange-500' };
    return { strength: 100, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  if (profileLoading) {
    return (
      <DashboardLayout title="Mon Profil">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-secondary">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout title="Mon Profil" subtitle="Gérez vos informations personnelles, sécurité et préférences">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Préférences
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Informations Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Avatar */}
                  <div className="flex items-center gap-4">
                    {profile?.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${personalInfo.firstName} ${personalInfo.lastName}`}
                        className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                        {personalInfo.firstName[0]?.toUpperCase() || ''}
                        {personalInfo.lastName[0]?.toUpperCase() || ''}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadAvatarMutation.isPending}
                      >
                        {uploadAvatarMutation.isPending ? 'Upload...' : 'Changer la photo'}
                      </Button>
                      {profile?.avatar && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          disabled={removeAvatarMutation.isPending}
                        >
                          {removeAvatarMutation.isPending ? 'Suppression...' : 'Supprimer'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                        }
                        disabled={!canModifyName}
                        className={!canModifyName ? 'bg-gray-50' : ''}
                      />
                      {!canModifyName && (
                        <p className="text-xs text-text-secondary mt-1">
                          Modifiable uniquement par la RH
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                        }
                        disabled={!canModifyName}
                        className={!canModifyName ? 'bg-gray-50' : ''}
                      />
                      {!canModifyName && (
                        <p className="text-xs text-text-secondary mt-1">
                          Modifiable uniquement par la RH
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={personalInfo.email}
                          disabled
                          className="bg-gray-50"
                        />
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-xs text-green-600 mt-1">Vérifié</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Roles & Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Rôles & Permissions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.roles && profile.roles.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label>Rôles RBAC</Label>
                        <div className="flex flex-wrap gap-2">
                          {profile.roles.map((role: any) => (
                            <Badge
                              key={role.id}
                              variant={role.isSystem ? 'default' : 'info'}
                            >
                              {role.name}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Permissions ({profile?.permissions?.length || 0})</Label>
                        <details className="text-sm">
                          <summary className="cursor-pointer text-text-secondary hover:text-text-primary">
                            Voir les permissions
                          </summary>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {profile?.permissions?.map((perm: string) => (
                              <div key={perm} className="text-xs text-text-secondary">
                                {perm}
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-text-secondary">Aucun rôle assigné</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Employee Information */}
            {profile?.employee && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Informations employé
                    <Badge variant="outline" className="ml-auto">
                      Synchronisé RH
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Matricule</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm font-mono">
                        {profile.employee.matricule}
                      </div>
                    </div>
                    <div>
                      <Label>Poste</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                        {profile.employee.position || '-'}
                      </div>
                    </div>
                    <div>
                      <Label>Département</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                        {profile.employee.department?.name || '-'}
                      </div>
                    </div>
                    <div>
                      <Label>Site</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                        {profile.employee.site?.name || '-'}
                      </div>
                    </div>
                    <div>
                      <Label>Équipe</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                        {profile.employee.team?.name || '-'}
                      </div>
                    </div>
                    <div>
                      <Label>Date d'embauche</Label>
                      <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm">
                        {profile.employee.hireDate
                          ? format(new Date(profile.employee.hireDate), 'dd/MM/yyyy', { locale: fr })
                          : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Heures Supplémentaires - Éligibilité et Plafonds */}
                  {profile?.employee && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Heures Supplémentaires
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Éligibilité</Label>
                          <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm flex items-center gap-2">
                            {profile.employee.isEligibleForOvertime !== false ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 font-medium">Éligible</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 text-red-600" />
                                <span className="text-red-700 font-medium">Non éligible</span>
                              </>
                            )}
                          </div>
                        </div>
                        {profile.employee.isEligibleForOvertime !== false && (
                          <>
                            {profile.employee.maxOvertimeHoursPerMonth && (
                              <div>
                                <Label>Plafond mensuel</Label>
                                <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm font-medium">
                                  {profile.employee.maxOvertimeHoursPerMonth}h
                                </div>
                              </div>
                            )}
                            {profile.employee.maxOvertimeHoursPerWeek && (
                              <div>
                                <Label>Plafond hebdomadaire</Label>
                                <div className="px-3 py-2 bg-gray-50 border rounded-lg text-sm font-medium">
                                  {profile.employee.maxOvertimeHoursPerWeek}h
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      {/* Cumul et Alertes */}
                      {profile.employee.isEligibleForOvertime !== false && (
                        <div className="mt-4 space-y-3">
                          {/* Cumul Mensuel */}
                          {profile.employee.maxOvertimeHoursPerMonth && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-blue-900">Cumul mensuel (mois en cours)</p>
                                  <p className="text-lg font-bold text-blue-700 mt-1">
                                    {monthlyTotal.toFixed(1)}h / {profile.employee.maxOvertimeHoursPerMonth}h
                                  </p>
                                </div>
                                {monthlyTotal >= profile.employee.maxOvertimeHoursPerMonth * 0.9 && (
                                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                                )}
                              </div>
                              {monthlyTotal >= profile.employee.maxOvertimeHoursPerMonth && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                                  ⚠️ Plafond mensuel atteint ! Aucune nouvelle heure supplémentaire ne sera acceptée ce mois.
                                </div>
                              )}
                              {monthlyTotal >= profile.employee.maxOvertimeHoursPerMonth * 0.9 &&
                               monthlyTotal < profile.employee.maxOvertimeHoursPerMonth && (
                                <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-xs text-orange-800">
                                  ⚠️ Attention : Vous approchez du plafond mensuel ({((monthlyTotal / profile.employee.maxOvertimeHoursPerMonth) * 100).toFixed(0)}% utilisé).
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Cumul Hebdomadaire */}
                          {profile.employee.maxOvertimeHoursPerWeek && (
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-medium text-purple-900">Cumul hebdomadaire (semaine en cours)</p>
                                  <p className="text-lg font-bold text-purple-700 mt-1">
                                    {weeklyTotal.toFixed(1)}h / {profile.employee.maxOvertimeHoursPerWeek}h
                                  </p>
                                </div>
                                {weeklyTotal >= profile.employee.maxOvertimeHoursPerWeek * 0.9 && (
                                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                                )}
                              </div>
                              {weeklyTotal >= profile.employee.maxOvertimeHoursPerWeek && (
                                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-800">
                                  ⚠️ Plafond hebdomadaire atteint ! Aucune nouvelle heure supplémentaire ne sera acceptée cette semaine.
                                </div>
                              )}
                              {weeklyTotal >= profile.employee.maxOvertimeHoursPerWeek * 0.9 &&
                               weeklyTotal < profile.employee.maxOvertimeHoursPerWeek && (
                                <div className="mt-2 p-2 bg-orange-100 border border-orange-300 rounded text-xs text-orange-800">
                                  ⚠️ Attention : Vous approchez du plafond hebdomadaire ({((weeklyTotal / profile.employee.maxOvertimeHoursPerWeek) * 100).toFixed(0)}% utilisé).
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-text-secondary mt-4">
                        Ces informations sont modifiables uniquement par la RH
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-text-secondary mt-4">
                    Ces informations sont modifiables uniquement par la RH
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Export RGPD */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Télécharger mes données (RGPD)</h3>
                    <p className="text-sm text-text-secondary mt-1">
                      Obtenez une copie de toutes vos données personnelles
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    disabled={exportDataMutation.isPending}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {exportDataMutation.isPending ? 'Téléchargement...' : 'Télécharger'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Changer le mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="Choisissez un mot de passe robuste"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      placeholder="Ressaisissez le nouveau mot de passe"
                    />
                  </div>

                  {/* Password Strength */}
                  {passwordData.newPassword && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-text-secondary">
                          Force : {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      changePasswordMutation.isPending
                    }
                    className="w-full"
                  >
                    {changePasswordMutation.isPending ? 'Changement...' : 'Changer le mot de passe'}
                  </Button>
                </CardContent>
              </Card>

              {/* Active Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Sessions actives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : sessions && sessions.length > 0 ? (
                    <div className="space-y-3">
                      {sessions.map((session: any) => (
                        <div
                          key={session.id}
                          className={`p-3 rounded-lg border ${
                            session.isCurrent
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {session.os === 'Android' || session.os === 'iOS' ? (
                                <Smartphone className="h-4 w-4 text-text-secondary" />
                              ) : (
                                <Monitor className="h-4 w-4 text-text-secondary" />
                              )}
                              <div>
                                <div className="text-sm font-medium">
                                  {session.device} - {session.browser}
                                </div>
                                <div className="text-xs text-text-secondary">
                                  {session.location} - {session.ip}
                                </div>
                              </div>
                            </div>
                            {session.isCurrent && (
                              <Badge variant="success" className="text-xs">
                                Actuelle
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">
                              {session.lastActive}
                            </span>
                            {!session.isCurrent && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                Révoquer
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-text-secondary py-4">Aucune session active</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Préférences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Préférences & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language */}
                <div>
                  <Label>Langue</Label>
                  <select
                    value={userPreferences.language}
                    onChange={(e) =>
                      setUserPreferences({ ...userPreferences, language: e.target.value })
                    }
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <Label>Fuseau horaire</Label>
                  <select
                    value={userPreferences.timezone}
                    onChange={(e) =>
                      setUserPreferences({ ...userPreferences, timezone: e.target.value })
                    }
                    className="w-full mt-2 px-3 py-2 border rounded-lg"
                  >
                    <option value="Africa/Casablanca">(GMT+1) Africa/Casablanca</option>
                    <option value="Europe/Paris">(GMT+1) Europe/Paris</option>
                    <option value="UTC">(GMT+0) UTC</option>
                  </select>
                </div>

                {/* Notifications */}
                <div>
                  <Label>Notifications</Label>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Email - Congés & absences</div>
                        <div className="text-sm text-text-secondary">
                          Demandes, validations, refus
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.notifications.email.leaves}
                          onChange={(e) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                email: {
                                  ...userPreferences.notifications.email,
                                  leaves: e.target.checked,
                                },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Email - Planning & shifts</div>
                        <div className="text-sm text-text-secondary">
                          Nouveaux plannings, remplacements
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.notifications.email.planning}
                          onChange={(e) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                email: {
                                  ...userPreferences.notifications.email,
                                  planning: e.target.checked,
                                },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Notifications push mobile</div>
                        <div className="text-sm text-text-secondary">
                          Requiert l'application mobile
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={userPreferences.notifications.push.mobile}
                          onChange={(e) =>
                            setUserPreferences({
                              ...userPreferences,
                              notifications: {
                                ...userPreferences.notifications,
                                push: {
                                  ...userPreferences.notifications.push,
                                  mobile: e.target.checked,
                                },
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending
                      ? 'Sauvegarde...'
                      : 'Sauvegarder les modifications'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistiques Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Jours travaillés</p>
                      <p className="text-2xl font-bold">
                        {stats?.workedDays?.value || 0}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats?.workedDays?.subtitle || ''}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Heures totales</p>
                      <p className="text-2xl font-bold">
                        {stats?.totalHours?.value || '0h'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats?.totalHours?.subtitle || ''}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Retards</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats?.lateCount?.value || 0}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats?.lateCount?.subtitle || ''}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Heures supplémentaires</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.overtime?.value || '0h'}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats?.overtime?.subtitle || ''}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Congés pris</p>
                      <p className="text-2xl font-bold text-primary">
                        {stats?.leaveTaken?.value || 0}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {stats?.leaveTaken?.subtitle || ''}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

