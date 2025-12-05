'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Globe,
  Shield,
  Bell,
  Download,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  Smartphone,
  Monitor,
  LogOut,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  useProfile,
  useUpdateProfile,
  useChangePassword,
  usePreferences,
  useUpdatePreferences,
  useSessions,
  useRevokeSession,
  useProfileStats,
} from '@/lib/hooks/useProfile';
import { toast } from 'sonner';

// Types
interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  // Fetch data from API
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: preferences, isLoading: preferencesLoading } = usePreferences();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: stats, isLoading: statsLoading } = useProfileStats();

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const updatePreferencesMutation = useUpdatePreferences();
  const revokeSessionMutation = useRevokeSession();

  // States
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    roleType: 'Lecture seule',
    language: 'Français',
  });

  const [employeeInfo, setEmployeeInfo] = useState({
    matricule: '',
    position: '',
    department: '',
    site: '',
    team: '',
    shift: '',
    hireDate: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    emailLeaves: true,
    emailPlanning: true,
    emailAlerts: false,
    pushMobile: true,
    pushDesktop: false,
  });

  const [timezone, setTimezone] = useState('(GMT+0100) Europe / Casablanca');

  // Update states when data is fetched
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || '',
        roleType: 'Lecture seule',
        language: preferences?.language || 'Français',
      });

      if (profile.employee) {
        setEmployeeInfo({
          matricule: profile.employee.matricule || '',
          position: profile.employee.position || '',
          department: profile.employee.department?.name || '',
          site: profile.employee.site || '',
          team: profile.employee.team?.name || '',
          shift: profile.employee.shift || '',
          hireDate: profile.employee.hireDate || '',
        });
      }
    }
  }, [profile, preferences]);

  useEffect(() => {
    if (preferences) {
      setTimezone(preferences.timezone || '(GMT+0100) Europe / Casablanca');
      setNotifications({
        emailLeaves: preferences.notifications?.email || false,
        emailPlanning: preferences.notifications?.email || false,
        emailAlerts: preferences.notifications?.email || false,
        pushMobile: preferences.notifications?.push || false,
        pushDesktop: preferences.notifications?.push || false,
      });
    }
  }, [preferences]);

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 8) return { strength: 33, label: 'Faible', color: 'bg-red-500' };
    if (password.length < 12) return { strength: 66, label: 'Moyen', color: 'bg-orange-500' };
    return { strength: 100, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Handlers
  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
      });
    } catch (error) {
      // Error handled in mutation
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
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePreferencesMutation.mutateAsync({
        language: personalInfo.language,
        timezone: timezone,
        notifications: {
          email: notifications.emailLeaves || notifications.emailPlanning || notifications.emailAlerts,
          push: notifications.pushMobile || notifications.pushDesktop,
          sms: false,
        },
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const isLoading = profileLoading || preferencesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0052CC] mx-auto"></div>
          <p className="mt-4 text-[#6C757D]">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#212529]">Profil utilisateur</h1>
              <p className="text-[14px] text-[#6C757D] mt-1">
                Gérez vos informations personnelles, sécurité du compte et préférences
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium">
                <Download className="w-4 h-4" />
                Télécharger mes données
              </button>

              <button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#0052CC] flex items-center justify-center text-white font-semibold">
                  {personalInfo.firstName[0]}{personalInfo.lastName[0]}
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#212529]">
                    {personalInfo.firstName} {personalInfo.lastName}
                  </div>
                  <div className="text-[12px] text-[#6C757D]">{personalInfo.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Personal Info & Employee Info */}
          <div className="col-span-7 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Informations personnelles
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Identité, coordonnées et photo de profil
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[12px] font-semibold">
                    Admin RH
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Profile Photo */}
                <div className="mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#0052CC] flex items-center justify-center text-white text-[28px] font-bold">
                      RA
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[13px] font-medium">
                        Changer la photo
                      </button>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[13px] font-medium">
                        Supprimer
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#6C757D] mt-2">
                    PNG ou JPG - max 2 Mo - carré recommandé
                  </p>
                </div>

                {/* Personal Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) =>
                          setPersonalInfo({ ...personalInfo, email: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </span>
                    </div>
                    <span className="text-[11px] text-green-600 font-medium">Vérifié</span>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Rôle
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {personalInfo.role}
                    </div>
                    <span className="text-[11px] text-[#6C757D]">{personalInfo.roleType}</span>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Langue de l'interface
                    </label>
                    <select
                      value={personalInfo.language}
                      onChange={(e) =>
                        setPersonalInfo({ ...personalInfo, language: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="العربية">العربية</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Informations employé
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Données RH liées à votre fiche employé
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Synchronisé RH</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Matricule
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529] font-mono">
                      {employeeInfo.matricule}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Poste
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.position}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Service / Département
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.department}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Site affecté
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.site}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Équipe
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.team}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Shift actuel
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.shift}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Date d'embauche
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {employeeInfo.hireDate}
                    </div>
                    <p className="text-[11px] text-[#6C757D] mt-1.5">
                      Modifiable uniquement par la RH
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences & Notifications */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Préférences & notifications
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Langue, fuseau horaire et canaux de notification
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Personnel</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Language Options */}
                <div>
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Langues disponibles
                  </label>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-[#0052CC] text-white rounded-lg text-[13px] font-medium">
                      Français
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-[#6C757D] rounded-lg text-[13px] font-medium hover:bg-gray-200">
                      English
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-[#6C757D] rounded-lg text-[13px] font-medium hover:bg-gray-200">
                      العربية
                    </button>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Fuseau horaire
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  >
                    <option value="(GMT+0100) Europe / Casablanca">
                      (GMT+0100) Europe / Casablanca
                    </option>
                    <option value="(GMT+0100) Europe / Paris">
                      (GMT+0100) Europe / Paris
                    </option>
                  </select>
                  <p className="text-[12px] text-[#6C757D] mt-1.5">
                    Utilisé pour l'affichage des pointages et plannings
                  </p>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Notifications
                  </label>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-medium text-[#212529]">
                          Email - Congés & absences
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Demandes, validations, refus, rappels d'échéance
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailLeaves}
                          onChange={(e) =>
                            setNotifications({ ...notifications, emailLeaves: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-medium text-[#212529]">
                          Email - Planning & shifts
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Nouveaux plannings, remplacements, changements d'équipe
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailPlanning}
                          onChange={(e) =>
                            setNotifications({ ...notifications, emailPlanning: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-medium text-[#212529]">
                          Email - Alertes
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Retards répétés, dépassements d'heures, connexions suspectes
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailAlerts}
                          onChange={(e) =>
                            setNotifications({ ...notifications, emailAlerts: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-medium text-[#212529]">
                          Notifications push mobile
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Requiert l'application mobile installée
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushMobile}
                          onChange={(e) =>
                            setNotifications({ ...notifications, pushMobile: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-medium text-[#212529]">
                          Notifications bureau (desktop)
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Demandes à valider, alertes planning, rappels
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.pushDesktop}
                          onChange={(e) =>
                            setNotifications({ ...notifications, pushDesktop: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <button className="text-[14px] text-[#0052CC] hover:underline font-medium">
                  Télécharger mes données (RGPD)
                </button>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium">
                    Annuler
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                    className="px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePreferencesMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Security & Stats */}
          <div className="col-span-5 space-y-6">
            {/* Account Security */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Sécurité du compte
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Mot de passe, sessions actives et sécurité
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Recommandé</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      placeholder="••••••••"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] pr-10 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C757D]"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Nouveau mot de passe
                  </label>
                  <div className="relative mb-2">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      placeholder="Choisissez un mot de passe robuste"
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] pr-10 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6C757D]"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Ressaisissez le nouveau mot de passe"
                    className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] mb-3 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                  />

                  {/* Password Strength */}
                  {passwordData.newPassword && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-[#6C757D]">
                          Force du mot de passe : {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        ></div>
                      </div>
                      <p className="text-[11px] text-[#6C757D] mt-2">
                        Utilisez au moins 12 caractères, avec majuscules, minuscules, chiffres et symboles.
                      </p>
                    </div>
                  )}

                  {/* Change Password Button */}
                  <button
                    onClick={handleChangePassword}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || changePasswordMutation.isPending}
                    className="w-full px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changePasswordMutation.isPending ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </div>

                {/* Active Sessions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[14px] font-semibold text-[#212529]">
                      Sessions actives
                    </label>
                    <span className="text-[13px] text-[#6C757D]">Sécurité</span>
                  </div>
                  <p className="text-[12px] text-[#6C757D] mb-4">
                    Connexions récentes à votre compte
                  </p>

                  <div className="space-y-3">
                    {sessionsLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0052CC] mx-auto"></div>
                      </div>
                    ) : sessions && sessions.length > 0 ? (
                      sessions.map((session: any) => (
                        <div
                          key={session.id}
                          className={`p-4 rounded-lg border ${
                            session.isCurrent
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              {session.os === 'Android' || session.os === 'iOS' ? (
                                <Smartphone className="w-5 h-5 text-[#6C757D]" />
                              ) : (
                                <Monitor className="w-5 h-5 text-[#6C757D]" />
                              )}
                              <div>
                                <div className="text-[14px] font-semibold text-[#212529]">
                                  {session.device} - {session.browser}
                                </div>
                                <div className="text-[12px] text-[#6C757D]">
                                  {session.location} - IP {session.ip}
                                </div>
                              </div>
                            </div>
                            {session.isCurrent && (
                              <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-[11px] font-semibold">
                                Session actuelle
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#6C757D]">{session.lastActive}</span>
                            {!session.isCurrent && (
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                                className="text-[12px] text-red-600 hover:underline font-medium disabled:opacity-50"
                              >
                                Révoquer
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[#6C757D] py-4">Aucune session active</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-[12px] text-[#6C757D] mb-3">
                      Si vous ne reconnaissez pas une session, changez votre mot de passe immédiatement.
                    </p>
                    <button className="text-[13px] text-red-600 hover:underline font-medium">
                      Déconnecter autres sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Statistics */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Statistiques personnelles
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Vos indicateurs de présence pour ce mois
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Employé</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-[12px] text-[#6C757D] mb-1">Jours travaillés ce mois</div>
                    <div className="text-[28px] font-bold text-[#212529] mb-1">
                      {stats.workedDays.value}
                    </div>
                    <div className="text-[11px] text-[#6C757D]">{stats.workedDays.subtitle}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-[12px] text-[#6C757D] mb-1">Heures totales</div>
                    <div className="text-[28px] font-bold text-[#212529] mb-1">
                      {stats.totalHours.value}
                    </div>
                    <div className="text-[11px] text-[#6C757D]">{stats.totalHours.subtitle}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-[12px] text-[#6C757D] mb-1">Retards</div>
                    <div className="text-[28px] font-bold text-orange-600 mb-1">
                      {stats.lateCount.value}
                    </div>
                    <div className="text-[11px] text-[#6C757D]">{stats.lateCount.subtitle}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-[12px] text-[#6C757D] mb-1">Heures supplémentaires</div>
                    <div className="text-[28px] font-bold text-green-600 mb-1">
                      {stats.overtime.value}
                    </div>
                    <div className="text-[11px] text-[#6C757D]">{stats.overtime.subtitle}</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-[12px] text-[#6C757D] mb-1">Congés pris</div>
                  <div className="text-[28px] font-bold text-[#0052CC] mb-1">
                    {stats.leaveTaken.value}
                  </div>
                  <div className="text-[11px] text-[#6C757D]">{stats.leaveTaken.subtitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
