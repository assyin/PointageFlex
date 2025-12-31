'use client';

import { useState, useEffect } from 'react';
import { useTenantSettings, useUpdateTenantSettings } from '@/lib/hooks/useTenantSettings';
import { useSites, useCreateSite, useUpdateSite, useDeleteSite } from '@/lib/hooks/useSites';
import { useHolidays, useCreateHoliday, useUpdateHoliday, useDeleteHoliday, useImportHolidays, useGenerateHolidays } from '@/lib/hooks/useHolidays';
import { HolidayType } from '@/lib/api/holidays';
import {
  Settings as SettingsIcon,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Upload,
  Calendar,
  Building2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGate } from '@/components/auth/PermissionGate';

export default function SettingsPage() {
  // Get tenant ID from localStorage
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('tenantId') || '';
      setTenantId(id);
    }
  }, []);

  // Fetch data
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useTenantSettings(tenantId);
  const { data: sitesData, isLoading: sitesLoading, refetch: refetchSites } = useSites();
  const { data: holidaysData, isLoading: holidaysLoading, refetch: refetchHolidays } = useHolidays();

  // Mutations
  const updateSettings = useUpdateTenantSettings();
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const deleteSite = useDeleteSite();
  const createHoliday = useCreateHoliday();
  const updateHoliday = useUpdateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const importHolidays = useImportHolidays();
  const generateHolidays = useGenerateHolidays();

  // Local state for form
  const [formData, setFormData] = useState({
    legalName: '',
    displayName: '',
    country: '',
    city: '',
    hrEmail: '',
    phone: '',
    language: '',
    timezone: '',
    firstDayOfWeek: '',
    workingDays: [1, 2, 3, 4, 5, 6] as number[], // Par défaut: Lundi-Samedi
    lateToleranceEntry: 10,
    earlyToleranceExit: 5,
    overtimeRounding: 15,
    overtimeMinimumThreshold: 30,
    twoLevelWorkflow: true,
    anticipatedLeave: false,
    monthlyPayrollEmail: false,
    sfptExport: false,
    requireBreakPunch: false,
    requireScheduleForAttendance: true,
    recoveryExpiryDays: 90,
    recoveryConversionRate: 1.0,
    dailyWorkingHours: 7.33,
    temporaryMatriculeExpiryDays: 8,
    absencePartialThreshold: 2,
    absenceDetectionTime: '01:00',
    enableInsufficientRestDetection: true,
    minimumRestHours: 11,
    minimumRestHoursNightShift: 12,
    holidayOvertimeEnabled: true,
    holidayOvertimeRate: 2.0,
    holidayOvertimeAsNormalHours: false,
  });

  // Modal states
  const [showSiteModal, setShowSiteModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showGenerateHolidaysModal, setShowGenerateHolidaysModal] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear(),
    includeReligious: true,
    mode: 'add' as 'add' | 'replace',
  });
  const [siteForm, setSiteForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: HolidayType.NATIONAL,
    isRecurring: false,
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      // Convertir workingDays de string[] ou number[] en number[]
      let workingDays = [1, 2, 3, 4, 5, 6]; // Par défaut: Lundi-Samedi
      if (settings.workingDays) {
        if (Array.isArray(settings.workingDays)) {
          workingDays = settings.workingDays.map((day: any) => 
            typeof day === 'string' ? parseInt(day, 10) : day
          ).filter((day: number) => !isNaN(day) && day >= 1 && day <= 7);
        }
        // Si vide après conversion, utiliser la valeur par défaut
        if (workingDays.length === 0) {
          workingDays = [1, 2, 3, 4, 5, 6];
        }
      }

      setFormData({
        legalName: settings.legalName || '',
        displayName: settings.displayName || '',
        country: settings.country || '',
        city: settings.city || '',
        hrEmail: settings.hrEmail || '',
        phone: settings.phone || '',
        language: settings.language || 'fr',
        timezone: settings.timezone || 'Africa/Casablanca',
        firstDayOfWeek: settings.firstDayOfWeek || 'Lundi',
        workingDays: workingDays,
        lateToleranceEntry: settings.lateToleranceEntry || 10,
        earlyToleranceExit: settings.earlyToleranceExit || 5,
        overtimeRounding: settings.overtimeRounding || 15,
        overtimeMinimumThreshold: settings.overtimeMinimumThreshold || 30,
        twoLevelWorkflow: settings.twoLevelWorkflow ?? true,
        anticipatedLeave: settings.anticipatedLeave ?? false,
        monthlyPayrollEmail: settings.monthlyPayrollEmail ?? false,
        sfptExport: settings.sfptExport ?? false,
        requireBreakPunch: settings.requireBreakPunch ?? false,
        requireScheduleForAttendance: settings.requireScheduleForAttendance ?? true,
        recoveryExpiryDays: settings.recoveryExpiryDays ?? 90,
        recoveryConversionRate: settings.recoveryConversionRate ?? 1.0,
        dailyWorkingHours: settings.dailyWorkingHours ?? 7.33,
        temporaryMatriculeExpiryDays: settings.temporaryMatriculeExpiryDays ?? 8,
        absencePartialThreshold: settings.absencePartialThreshold ?? 2,
        absenceDetectionTime: settings.absenceDetectionTime ?? '01:00',
        enableInsufficientRestDetection: settings.enableInsufficientRestDetection ?? true,
        minimumRestHours: settings.minimumRestHours ?? 11,
        minimumRestHoursNightShift: settings.minimumRestHoursNightShift ?? 12,
        holidayOvertimeEnabled: settings.holidayOvertimeEnabled ?? true,
        holidayOvertimeRate: settings.holidayOvertimeRate ?? 2.0,
        holidayOvertimeAsNormalHours: settings.holidayOvertimeAsNormalHours ?? false,
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    if (!tenantId) {
      toast.error('Tenant ID manquant');
      return;
    }

    await updateSettings.mutateAsync({
      tenantId,
      data: formData,
    });
  };

  const handleRefresh = () => {
    refetchSettings();
    refetchSites();
    refetchHolidays();
    toast.success('Données rechargées');
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteForm.name) {
      toast.error('Le nom est requis');
      return;
    }

    // Le code sera généré automatiquement par le backend
    await createSite.mutateAsync(siteForm);
    setShowSiteModal(false);
    setSiteForm({ name: '', address: '', city: '', phone: '' });
  };

  const handleUpdateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    await updateSite.mutateAsync({
      id: editingSite.id,
      data: siteForm,
    });
    setShowSiteModal(false);
    setEditingSite(null);
    setSiteForm({ name: '', address: '', city: '', phone: '' });
  };

  const handleDeleteSite = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce site ?')) return;
    await deleteSite.mutateAsync(id);
  };

  const openEditSite = (site: any) => {
    setEditingSite(site);
    setSiteForm({
      name: site.name,
      address: site.address || '',
      city: site.city || '',
      phone: site.phone || '',
    });
    setShowSiteModal(true);
  };

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayForm.name || !holidayForm.date) {
      toast.error('Le nom et la date sont requis');
      return;
    }

    await createHoliday.mutateAsync(holidayForm);
    setShowHolidayModal(false);
    setHolidayForm({ name: '', date: '', type: HolidayType.NATIONAL, isRecurring: false });
  };

  const handleUpdateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;

    await updateHoliday.mutateAsync({
      id: editingHoliday.id,
      data: holidayForm,
    });
    setShowHolidayModal(false);
    setEditingHoliday(null);
    setHolidayForm({ name: '', date: '', type: HolidayType.NATIONAL, isRecurring: false });
  };

  const handleDeleteHoliday = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce jour férié ?')) return;
    await deleteHoliday.mutateAsync(id);
  };

  const openEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      isRecurring: holiday.isRecurring,
    });
    setShowHolidayModal(true);
  };

  const handleImportHolidays = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await importHolidays.mutateAsync(file);
    e.target.value = ''; // Reset input
  };

  const handleGenerateHolidays = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateHolidays.mutateAsync({
        year: generateForm.year,
        includeReligious: generateForm.includeReligious,
        mode: generateForm.mode,
      });
      setShowGenerateHolidaysModal(false);
      setGenerateForm({
        year: new Date().getFullYear(),
        includeReligious: true,
        mode: 'add',
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const sites = sitesData?.data || [];
  const holidays = holidaysData?.data || [];

  if (settingsLoading || sitesLoading || holidaysLoading) {
    return (
      <DashboardLayout
        title="Paramètres"
        subtitle="Chargement..."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute permissions={['tenant.view_settings', 'tenant.update_settings']}>
      <DashboardLayout
        title="Paramètres entreprise"
      subtitle="Configurer les informations, horaires, sites et jours fériés de votre entreprise"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Recharger
          </button>

          <PermissionGate permission="tenant.update_settings">
            <button
              onClick={handleSaveSettings}
              disabled={updateSettings.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {updateSettings.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Enregistrer les modifications
            </button>
          </PermissionGate>
        </div>

        {/* Main Content */}
        <div className="max-w-[1800px]">
          <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Configuration */}
          <div className="col-span-7 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-[18px] font-semibold text-[#212529]">
                  Informations entreprise
                </h2>
                <p className="text-[13px] text-[#6C757D] mt-0.5">
                  Nom, identité visuelle et contacts principaux
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nom légal de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.legalName}
                      onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nom affiché dans l'application
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Ville principale
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Email de contact RH
                    </label>
                    <input
                      type="email"
                      value={formData.hrEmail}
                      onChange={(e) => setFormData({ ...formData, hrEmail: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-[18px] font-semibold text-[#212529]">
                  Fuseau horaire & paramètres régionaux
                </h2>
                <p className="text-[13px] text-[#6C757D] mt-0.5">
                  Heure locale, format de date et semaine de travail
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Fuseau horaire
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="Africa/Casablanca">Africa/Casablanca (UTC+1)</option>
                      <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Langue par défaut
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Premier jour de la semaine
                    </label>
                    <select
                      value={formData.firstDayOfWeek}
                      onChange={(e) => setFormData({ ...formData, firstDayOfWeek: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="Lundi">Lundi</option>
                      <option value="Dimanche">Dimanche</option>
                      <option value="Samedi">Samedi</option>
                    </select>
                  </div>
                </div>

                {/* Jours ouvrables de la semaine */}
                <div className="mt-6">
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
                    Jours ouvrables de la semaine
                  </label>
                  <p className="text-[12px] text-[#6C757D] mb-3">
                    Sélectionnez les jours de la semaine où les employés travaillent normalement. Ces jours sont utilisés pour la détection d'absences et la validation des pointages.
                  </p>
                  <div className="grid grid-cols-7 gap-2">
                    {[
                      { value: 1, label: 'Lun', fullLabel: 'Lundi' },
                      { value: 2, label: 'Mar', fullLabel: 'Mardi' },
                      { value: 3, label: 'Mer', fullLabel: 'Mercredi' },
                      { value: 4, label: 'Jeu', fullLabel: 'Jeudi' },
                      { value: 5, label: 'Ven', fullLabel: 'Vendredi' },
                      { value: 6, label: 'Sam', fullLabel: 'Samedi' },
                      { value: 7, label: 'Dim', fullLabel: 'Dimanche' },
                    ].map((day) => (
                      <label
                        key={day.value}
                        className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.workingDays.includes(day.value)
                            ? 'border-[#0052CC] bg-blue-50 text-[#0052CC]'
                            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                workingDays: [...formData.workingDays, day.value].sort(),
                              });
                            } else {
                              setFormData({
                                ...formData,
                                workingDays: formData.workingDays.filter((d) => d !== day.value),
                              });
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-[14px] font-semibold">{day.label}</span>
                        <span className="text-[10px] mt-0.5 opacity-75">{day.fullLabel}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-3">
                    Jours sélectionnés: {formData.workingDays.length === 0 
                      ? 'Aucun (tous les jours seront considérés comme non ouvrables)' 
                      : formData.workingDays.map(d => {
                          const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                          return days[d];
                        }).join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Policy */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-[18px] font-semibold text-[#212529]">
                  Politique horaire & tolérances
                </h2>
                <p className="text-[13px] text-[#6C757D] mt-0.5">
                  Règles de calcul des retards et heures supplémentaires
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Tolérance retard à l'entrée (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.lateToleranceEntry}
                      onChange={(e) => setFormData({ ...formData, lateToleranceEntry: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Tolérance départ anticipé (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.earlyToleranceExit}
                      onChange={(e) => setFormData({ ...formData, earlyToleranceExit: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Arrondi des heures sup (minutes)
                    </label>
                    <select
                      value={formData.overtimeRounding}
                      onChange={(e) => setFormData({ ...formData, overtimeRounding: parseInt(e.target.value) })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Arrondi appliqué aux heures supplémentaires calculées
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Seuil minimum pour création automatique (minutes)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      step="15"
                      value={formData.overtimeMinimumThreshold}
                      onChange={(e) => setFormData({ ...formData, overtimeMinimumThreshold: parseInt(e.target.value) || 30 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Seuil minimum en minutes pour créer automatiquement un Overtime depuis les pointages (défaut: 30 min)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Délai d'expiration matricule temporaire (jours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.temporaryMatriculeExpiryDays}
                      onChange={(e) => setFormData({ ...formData, temporaryMatriculeExpiryDays: parseInt(e.target.value) || 8 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nombre de jours avant expiration du matricule temporaire (délai pour obtenir le matricule officiel)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nombre d'heures par jour de travail
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="24"
                      value={formData.dailyWorkingHours}
                      onChange={(e) => setFormData({ ...formData, dailyWorkingHours: parseFloat(e.target.value) || 7.33 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nombre d'heures équivalent à une journée normale (par défaut: 44h/6j = 7.33h)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Taux de conversion heures supp → récupération
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="2"
                      value={formData.recoveryConversionRate}
                      onChange={(e) => setFormData({ ...formData, recoveryConversionRate: parseFloat(e.target.value) || 1.0 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Taux de conversion (1.0 = 1h supp = 1h récup, 1.5 = 1h supp = 1.5h récup)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Délai d'expiration récupération (jours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={formData.recoveryExpiryDays}
                      onChange={(e) => setFormData({ ...formData, recoveryExpiryDays: parseInt(e.target.value) || 90 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nombre de jours avant expiration de la récupération
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Seuil d'absence partielle (heures)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="8"
                      step="0.5"
                      value={formData.absencePartialThreshold}
                      onChange={(e) => setFormData({ ...formData, absencePartialThreshold: parseFloat(e.target.value) || 2 })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Nombre d'heures de retard pour considérer une absence partielle au lieu d'un simple retard (défaut: 2h)
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Heure de détection des absences
                    </label>
                    <input
                      type="time"
                      value={formData.absenceDetectionTime}
                      onChange={(e) => setFormData({ ...formData, absenceDetectionTime: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Heure d'exécution quotidienne du job batch pour détecter les absences complètes (format HH:mm, défaut: 01:00)
                    </p>
                  </div>

                </div>

                {/* Insufficient Rest Detection Settings */}
                <div className="bg-white rounded-lg border border-gray-200 mt-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Détection de repos insuffisant
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Configuration de la détection des violations de repos légal entre shifts
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Activer la détection de repos insuffisant
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Détecter automatiquement les violations du repos légal entre deux shifts consécutifs
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.enableInsufficientRestDetection}
                        onChange={(e) => setFormData({ ...formData, enableInsufficientRestDetection: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>

                    {formData.enableInsufficientRestDetection && (
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                            Repos minimum requis (heures)
                          </label>
                          <input
                            type="number"
                            min="8"
                            max="24"
                            step="0.5"
                            value={formData.minimumRestHours}
                            onChange={(e) => setFormData({ ...formData, minimumRestHours: parseFloat(e.target.value) || 11 })}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            Nombre d'heures légales de repos minimum requis entre deux shifts consécutifs (défaut: 11h, conforme à la législation)
                          </p>
                        </div>

                        <div>
                          <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                            Repos minimum pour shift de nuit (heures)
                          </label>
                          <input
                            type="number"
                            min="8"
                            max="24"
                            step="0.5"
                            value={formData.minimumRestHoursNightShift}
                            onChange={(e) => setFormData({ ...formData, minimumRestHoursNightShift: parseFloat(e.target.value) || 12 })}
                            className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                          />
                          <p className="text-xs text-gray-500 mt-1.5">
                            Nombre d'heures légales de repos minimum pour les shifts de nuit (optionnel, défaut: 12h)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Leave Rules */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
                    Règles de congés & validation
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Workflow à 2 niveaux
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Validation par manager puis service RH
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.twoLevelWorkflow}
                        onChange={(e) => setFormData({ ...formData, twoLevelWorkflow: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Autoriser la prise anticipée de congés
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Permet un solde négatif
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.anticipatedLeave}
                        onChange={(e) => setFormData({ ...formData, anticipatedLeave: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance Settings */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
                    Pointage & Présences
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Exiger le pointage des repos (pauses)
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Les employés devront pointer le début et la fin de leurs pauses. Si désactivé, seuls les pointages d'entrée et de sortie seront acceptés.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.requireBreakPunch}
                        onChange={(e) => setFormData({ ...formData, requireBreakPunch: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Exiger un planning ou shift pour les pointages
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Si activé, les pointages seront refusés si l'employé n'a pas de planning publié ni de shift par défaut assigné (sauf weekends, congés ou récupérations approuvés). Si désactivé, les pointages seront autorisés mais marqués comme anomalie.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.requireScheduleForAttendance}
                        onChange={(e) => setFormData({ ...formData, requireScheduleForAttendance: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>

                    {/* Majoration des jours fériés */}
                    <div className="space-y-3 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="text-[14px] font-semibold text-[#212529] mb-3">
                        Majoration des jours fériés
                      </h3>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <div className="text-[14px] font-semibold text-[#212529]">
                            Activer la majoration des heures travaillées les jours fériés
                          </div>
                          <div className="text-[12px] text-[#6C757D] mt-0.5">
                            Si activé, les heures travaillées les jours fériés seront majorées selon le taux configuré.
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.holidayOvertimeEnabled}
                          onChange={(e) => setFormData({ ...formData, holidayOvertimeEnabled: e.target.checked })}
                          className="w-11 h-6"
                        />
                      </div>

                      {formData.holidayOvertimeEnabled && (
                        <>
                          <div className="p-3 bg-white rounded-lg">
                            <label className="block text-[14px] font-semibold text-[#212529] mb-2">
                              Taux de majoration
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="5"
                              step="0.1"
                              value={formData.holidayOvertimeRate}
                              onChange={(e) => setFormData({ ...formData, holidayOvertimeRate: parseFloat(e.target.value) || 2.0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="2.0"
                            />
                            <div className="text-[12px] text-[#6C757D] mt-1">
                              Exemple: 2.0 = double, 2.5 = double et demi. Défaut: 2.0
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                            <div>
                              <div className="text-[14px] font-semibold text-[#212529]">
                                Calculer comme heures normales (sans majoration)
                              </div>
                              <div className="text-[12px] text-[#6C757D] mt-0.5">
                                Si activé, les heures travaillées les jours fériés seront calculées comme heures normales, sans majoration. Le taux de majoration sera ignoré.
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.holidayOvertimeAsNormalHours}
                              onChange={(e) => setFormData({ ...formData, holidayOvertimeAsNormalHours: e.target.checked })}
                              className="w-11 h-6"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Export Settings */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
                    Exports automatiques
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Envoyer l'export paie mensuel par email
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.monthlyPayrollEmail}
                        onChange={(e) => setFormData({ ...formData, monthlyPayrollEmail: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Activer l'export vers SFTP
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.sfptExport}
                        onChange={(e) => setFormData({ ...formData, sfptExport: e.target.checked })}
                        className="w-11 h-6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sites & Holidays */}
          <div className="col-span-5 space-y-6">
            {/* Sites Management */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">Sites</h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Gérer les différents sites de l'entreprise
                    </p>
                  </div>
                  <PermissionGate permission="tenant.manage_sites">
                    <button
                      onClick={() => {
                        setEditingSite(null);
                        setSiteForm({ code: '', name: '', address: '', city: '', phone: '' });
                        setShowSiteModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] text-[13px] font-semibold"
                    >
                      <Plus className="w-4 h-4" />
                      Nouveau site
                    </button>
                  </PermissionGate>
                </div>
              </div>

              <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
                {sites.length === 0 ? (
                  <div className="text-center py-8 text-[#6C757D]">
                    <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-[14px]">Aucun site</p>
                  </div>
                ) : (
                  sites.map((site: any) => (
                    <div
                      key={site.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">{site.name}</div>
                        <div className="text-[12px] text-[#6C757D]">Code: {site.code}</div>
                        {site.city && <div className="text-[12px] text-[#6C757D]">{site.city}</div>}
                        {site._count && (
                          <div className="text-[11px] text-[#6C757D] mt-1">
                            {site._count.employees} employés · {site._count.devices} terminaux
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <PermissionGate permission="tenant.manage_sites">
                          <button
                            onClick={() => openEditSite(site)}
                            className="p-2 text-[#6C757D] hover:text-[#0052CC]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSite(site.id)}
                            className="p-2 text-[#6C757D] hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Holidays Management */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">Jours fériés</h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Calendrier des jours fériés ({holidays.length})
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <PermissionGate permission="tenant.manage_holidays">
                      <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 cursor-pointer text-[13px] font-medium">
                        <Upload className="w-4 h-4" />
                        Importer
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleImportHolidays}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => {
                          setGenerateForm({
                            year: new Date().getFullYear(),
                            includeReligious: true,
                            mode: 'add',
                          });
                          setShowGenerateHolidaysModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 text-[13px] font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        Générer l'année
                      </button>
                      <button
                        onClick={() => {
                          setEditingHoliday(null);
                          setHolidayForm({ name: '', date: '', type: HolidayType.NATIONAL, isRecurring: false });
                          setShowHolidayModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] text-[13px] font-semibold"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
                {holidays.length === 0 ? (
                  <div className="text-center py-8 text-[#6C757D]">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-[14px]">Aucun jour férié</p>
                  </div>
                ) : (
                  holidays.map((holiday: any) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                            holiday.type === 'NATIONAL'
                              ? 'bg-blue-100 text-blue-800'
                              : holiday.type === 'RELIGIOUS'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {holiday.type}
                        </span>
                        <span className="text-[13px] text-[#212529]">{holiday.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-[#6C757D]">
                          {new Date(holiday.date).toLocaleDateString('fr-FR')}
                        </span>
                        <PermissionGate permission="tenant.manage_holidays">
                          <button
                            onClick={() => openEditHoliday(holiday)}
                            className="text-[#6C757D] hover:text-[#0052CC]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </PermissionGate>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Site Modal */}
      {showSiteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">
                {editingSite ? 'Modifier le site' : 'Nouveau site'}
              </h3>
            </div>
            <form onSubmit={editingSite ? handleUpdateSite : handleCreateSite} className="p-6 space-y-4">
              {editingSite && editingSite.code && (
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                    Code
                  </label>
                  <input
                    type="text"
                    value={editingSite.code}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] bg-gray-50 text-gray-600"
                    disabled
                    readOnly
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Le code est généré automatiquement et ne peut pas être modifié</p>
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={siteForm.name}
                  onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Adresse
                </label>
                <input
                  type="text"
                  value={siteForm.address}
                  onChange={(e) => setSiteForm({ ...siteForm, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Ville
                </label>
                <input
                  type="text"
                  value={siteForm.city}
                  onChange={(e) => setSiteForm({ ...siteForm, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={siteForm.phone}
                  onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowSiteModal(false);
                    setEditingSite(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8]"
                >
                  {editingSite ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">
                {editingHoliday ? 'Modifier le jour férié' : 'Nouveau jour férié'}
              </h3>
            </div>
            <form onSubmit={editingHoliday ? handleUpdateHoliday : handleCreateHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Nom *
                </label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Type
                </label>
                <select
                  value={holidayForm.type}
                  onChange={(e) => setHolidayForm({ ...holidayForm, type: e.target.value as HolidayType })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value={HolidayType.NATIONAL}>National</option>
                  <option value={HolidayType.RELIGIOUS}>Religieux</option>
                  <option value={HolidayType.COMPANY}>Entreprise</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={holidayForm.isRecurring}
                  onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isRecurring" className="text-[13px] text-[#6C757D]">
                  Récurrent chaque année
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowHolidayModal(false);
                    setEditingHoliday(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8]"
                >
                  {editingHoliday ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Holidays Modal */}
      {showGenerateHolidaysModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">
                Générer les jours fériés de l'année
              </h3>
            </div>
            <form onSubmit={handleGenerateHolidays} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Année *
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) || new Date().getFullYear() })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Les jours fériés seront générés pour l'année sélectionnée
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeReligious"
                  checked={generateForm.includeReligious}
                  onChange={(e) => setGenerateForm({ ...generateForm, includeReligious: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="includeReligious" className="text-[13px] text-[#6C757D]">
                  Inclure les jours fériés religieux (Aïd, etc.)
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Si coché, les jours fériés religieux seront également générés
              </p>

              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Mode de génération *
                </label>
                <select
                  value={generateForm.mode}
                  onChange={(e) => setGenerateForm({ ...generateForm, mode: e.target.value as 'add' | 'replace' })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                >
                  <option value="add">Ajouter uniquement les manquants</option>
                  <option value="replace">Remplacer tous les jours fériés de l'année</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {generateForm.mode === 'add'
                    ? 'Les jours fériés existants seront conservés, seuls les nouveaux seront ajoutés.'
                    : '⚠️ Tous les jours fériés existants pour cette année seront supprimés et remplacés.'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note :</strong> La génération est basée sur le pays configuré dans les paramètres du tenant.
                  Actuellement, seuls les jours fériés du Maroc sont supportés.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateHolidaysModal(false)}
                  disabled={generateHolidays.isPending}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={generateHolidays.isPending}
                  className="flex-1 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generateHolidays.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Générer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
}
