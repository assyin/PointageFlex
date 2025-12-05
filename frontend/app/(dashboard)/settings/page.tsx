'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Upload,
  RefreshCw,
  Plus,
  Shield,
  Users,
  Terminal,
  Webhook,
  FileSpreadsheet,
  Mail,
  Server,
  ChevronDown,
  Trash2,
  Edit,
  X,
} from 'lucide-react';

// Types
interface User {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: string;
  roleDetail: string;
  status: string;
  sites?: string;
}

interface Holiday {
  id: string;
  type: 'National' | 'Entreprise';
  name: string;
  date: string;
}

export default function SettingsPage() {
  // States
  const [companyInfo, setCompanyInfo] = useState({
    legalName: 'LogiPoint SARL',
    displayName: 'LogiPoint',
    country: 'Maroc',
    city: 'Casablanca',
    hrEmail: 'rh@logipoint.ma',
    phone: '+212 5 22 00 00 00',
  });

  const [regionalSettings, setRegionalSettings] = useState({
    timezone: 'Africa/Casablanca (UTC+1)',
    language: 'Français',
    firstDayOfWeek: 'Lundi',
    workingDays: 'Lun - Mar - Mer - Jeu - Ven',
  });

  const [timePolicy, setTimePolicy] = useState({
    lateToleranceEntry: '10',
    earlyToleranceExit: '5',
    overtimeRounding: '15',
    nightShiftStart: '21:00',
    nightShiftEnd: '06:00',
  });

  const [leaveRules, setLeaveRules] = useState({
    twoLevelWorkflow: true,
    anticipatedLeave: true,
  });

  const [exportSettings, setExportSettings] = useState({
    monthlyPayrollEmail: true,
    sfptExport: true,
  });

  // Mock data
  const users: User[] = [
    {
      id: '1',
      initials: 'RA',
      name: 'Rania Admin',
      email: 'rania.admin@logipoint.ma',
      role: 'Admin',
      roleDetail: 'tenant',
      status: 'Actif - 2FA',
    },
    {
      id: '2',
      initials: 'AP',
      name: 'Ahmed Paie',
      email: 'ahmed.paie@logipoint.ma',
      role: 'Responsable',
      roleDetail: 'paie',
      status: 'Actif',
    },
    {
      id: '3',
      initials: 'SM',
      name: 'Sara Manager',
      email: 'sara.manager@logipoint.ma',
      role: 'Manager',
      roleDetail: "d'équipe",
      status: 'Actif - 2 sites',
    },
  ];

  const holidays: Holiday[] = [
    { id: '1', type: 'National', name: 'Aïd al-Fitr (date mobile)', date: '' },
    { id: '2', type: 'National', name: 'Fête du Trône', date: '30/07' },
    { id: '3', type: 'Entreprise', name: 'Journée logistique', date: '15/02' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold text-[#212529]">Paramètres entreprise</h1>
              <p className="text-[14px] text-[#6C757D] mt-1">
                Configurer les informations, horaires, utilisateurs et intégrations de votre tenant
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium">
                <RefreshCw className="w-4 h-4" />
                Recharger
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium">
                Rôles & droits
              </button>

              <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[14px] font-semibold">
                Enregistrer les modifications
              </button>

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-[#0052CC] flex items-center justify-center text-white font-semibold">
                  RA
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-[#212529]">Rania Admin</div>
                  <div className="text-[12px] text-[#6C757D]">Admin RH</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Configuration */}
          <div className="col-span-7 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Informations entreprise
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Nom, identité visuelle et contacts principaux
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Général</span>
                </div>
              </div>

              <div className="p-6">
                {/* Logo Upload */}
                <div className="mb-6">
                  <label className="block text-[14px] font-semibold text-[#212529] mb-3">
                    Logo entreprise
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-[#0052CC] flex items-center justify-center text-white text-[24px] font-bold">
                      LP
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[13px] font-medium">
                        Changer le logo
                      </button>
                      <button className="px-4 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[13px] font-medium">
                        Retirer
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-[#6C757D] mt-2">
                    PNG / SVG - Fond clair conseillé
                  </p>
                </div>

                {/* Company Details Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nom légal de l'entreprise
                    </label>
                    <input
                      type="text"
                      value={companyInfo.legalName}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, legalName: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Nom affiché dans l'application
                    </label>
                    <input
                      type="text"
                      value={companyInfo.displayName}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, displayName: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={companyInfo.country}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, country: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Ville principale / Site HQ
                    </label>
                    <input
                      type="text"
                      value={companyInfo.city}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, city: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Email de contact RH
                    </label>
                    <input
                      type="email"
                      value={companyInfo.hrEmail}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, hrEmail: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={companyInfo.phone}
                      onChange={(e) =>
                        setCompanyInfo({ ...companyInfo, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Fuseau horaire & paramètres régionaux
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Heure locale, format de date et semaine de travail
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Horaire</span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Fuseau horaire
                    </label>
                    <select
                      value={regionalSettings.timezone}
                      onChange={(e) =>
                        setRegionalSettings({ ...regionalSettings, timezone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="Africa/Casablanca (UTC+1)">
                        Africa/Casablanca (UTC+1)
                      </option>
                      <option value="Europe/Paris (UTC+1)">Europe/Paris (UTC+1)</option>
                    </select>
                    <p className="text-[11px] text-[#6C757D] mt-1.5">
                      Utilisé pour tous les pointages, plannings et rapports.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Langue par défaut
                    </label>
                    <select
                      value={regionalSettings.language}
                      onChange={(e) =>
                        setRegionalSettings({ ...regionalSettings, language: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="Français">Français</option>
                      <option value="English">English</option>
                      <option value="العربية">العربية</option>
                    </select>
                    <p className="text-[11px] text-[#6C757D] mt-1.5">
                      Les utilisateurs pourront changer la langue dans leur profil.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Premier jour de la semaine
                    </label>
                    <select
                      value={regionalSettings.firstDayOfWeek}
                      onChange={(e) =>
                        setRegionalSettings({
                          ...regionalSettings,
                          firstDayOfWeek: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="Lundi">Lundi</option>
                      <option value="Dimanche">Dimanche</option>
                      <option value="Samedi">Samedi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Jours travaillés
                    </label>
                    <div className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-[14px] text-[#212529]">
                      {regionalSettings.workingDays}
                    </div>
                    <p className="text-[11px] text-[#6C757D] mt-1.5">
                      Samedi / dimanche peuvent être configurés par site.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Policy */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Politique horaire, tolérances & jours fériés
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Règles de calcul des retards, heures sup et calendriers officiels
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Règles</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Tolerances */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Tolérance retard à l'entrée
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={timePolicy.lateToleranceEntry}
                        onChange={(e) =>
                          setTimePolicy({ ...timePolicy, lateToleranceEntry: e.target.value })
                        }
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      />
                      <span className="text-[14px] text-[#6C757D]">minutes</span>
                    </div>
                    <p className="text-[11px] text-[#6C757D] mt-1.5">
                      En-deçà de cette tolérance, pas de retard comptabilisé.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Tolérance départ anticipé
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={timePolicy.earlyToleranceExit}
                        onChange={(e) =>
                          setTimePolicy({ ...timePolicy, earlyToleranceExit: e.target.value })
                        }
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      />
                      <span className="text-[14px] text-[#6C757D]">minutes</span>
                    </div>
                  </div>
                </div>

                {/* Overtime & Night Shift */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Arrondi des heures supplémentaires
                    </label>
                    <select
                      value={timePolicy.overtimeRounding}
                      onChange={(e) =>
                        setTimePolicy({ ...timePolicy, overtimeRounding: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                    >
                      <option value="15">Par tranches de 15 minutes</option>
                      <option value="30">Par tranches de 30 minutes</option>
                      <option value="60">Par tranches de 60 minutes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                      Règle de nuit
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={timePolicy.nightShiftStart}
                        onChange={(e) =>
                          setTimePolicy({ ...timePolicy, nightShiftStart: e.target.value })
                        }
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      />
                      <span className="text-[#6C757D]">à</span>
                      <input
                        type="time"
                        value={timePolicy.nightShiftEnd}
                        onChange={(e) =>
                          setTimePolicy({ ...timePolicy, nightShiftEnd: e.target.value })
                        }
                        className="flex-1 px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Holidays */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[13px] font-medium text-[#6C757D]">
                      Jours fériés et événements spéciaux
                    </label>
                    <div className="flex gap-2">
                      <button className="text-[13px] text-[#0052CC] hover:underline font-medium">
                        Modifier
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {holidays.map((holiday) => (
                      <div
                        key={holiday.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                              holiday.type === 'National'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {holiday.type}
                          </span>
                          <span className="text-[13px] text-[#212529]">{holiday.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {holiday.date && (
                            <span className="text-[13px] text-[#6C757D]">{holiday.date}</span>
                          )}
                          <button className="text-[#6C757D] hover:text-[#212529]">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="mt-3 text-[13px] text-[#0052CC] hover:underline font-medium">
                    + Ajouter un jour férié
                  </button>
                  <button className="ml-4 text-[13px] text-[#0052CC] hover:underline font-medium">
                    Importer calendrier (CSV)
                  </button>
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
                          Validation par manager puis service RH.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={leaveRules.twoLevelWorkflow}
                          onChange={(e) =>
                            setLeaveRules({
                              ...leaveRules,
                              twoLevelWorkflow: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Autoriser la prise anticipée de congés
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Permet un solde négatif jusqu'à -2 jours.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={leaveRules.anticipatedLeave}
                          onChange={(e) =>
                            setLeaveRules({
                              ...leaveRules,
                              anticipatedLeave: e.target.checked,
                            })
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

            {/* Save Banner */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-[#6C757D]">
                  Les modifications impactent l'ensemble des sites de l'entreprise.
                </p>
                <div className="flex gap-3">
                  <button className="px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[14px] font-medium">
                    Annuler
                  </button>
                  <button className="px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[14px] font-semibold">
                    Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Users & Integrations */}
          <div className="col-span-5 space-y-6">
            {/* Users & Roles */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Utilisateurs & rôles
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Gestion des accès RH, managers et employés
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Sécurité</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] transition-colors text-[13px] font-semibold">
                    <Plus className="w-4 h-4" />
                    Inviter un utilisateur
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 transition-colors text-[13px] font-medium">
                    Configurer SSO
                  </button>
                </div>

                {/* Users Table */}
                <div className="space-y-2 mb-6">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0052CC] flex items-center justify-center text-white font-semibold text-[14px]">
                          {user.initials}
                        </div>
                        <div>
                          <div className="text-[14px] font-semibold text-[#212529]">
                            {user.name}
                          </div>
                          <div className="text-[12px] text-[#6C757D]">{user.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-medium text-[#212529]">
                          {user.role}
                        </div>
                        <div className="text-[11px] text-[#6C757D]">{user.roleDetail}</div>
                        <div className="text-[11px] text-[#6C757D] mt-0.5">{user.status}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role Templates */}
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
                    Modèles de rôles
                  </label>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-gray-100 text-[#6C757D] rounded text-[12px] font-medium hover:bg-gray-200">
                      Admin RH
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-[#6C757D] rounded text-[12px] font-medium hover:bg-gray-200">
                      Manager
                    </button>
                    <button className="px-3 py-1.5 bg-gray-100 text-[#6C757D] rounded text-[12px] font-medium hover:bg-gray-200">
                      Lecture seule
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 text-[#212529] rounded text-[12px] font-medium hover:bg-gray-50">
                      + Nouveau rôle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[18px] font-semibold text-[#212529]">
                      Intégrations & terminaux
                    </h2>
                    <p className="text-[13px] text-[#6C757D] mt-0.5">
                      Connecter les pointeuses, APIs et imports/export fichiers
                    </p>
                  </div>
                  <span className="text-[13px] text-[#6C757D]">Intégration</span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Biometric Terminals */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-[14px] font-semibold text-[#212529]">
                      Terminaux biométriques
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-0.5">
                      Synchronisation empreinte / visage avec vos appareils
                    </div>
                    <div className="text-[12px] text-green-600 font-medium mt-1">
                      3 terminaux connectés
                    </div>
                  </div>
                  <button className="text-[13px] text-[#0052CC] hover:underline font-medium">
                    Configurer
                  </button>
                </div>

                {/* Badges & QR */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-[14px] font-semibold text-[#212529]">
                      Badges & QR code
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-0.5">
                      Génération et lecture via bornes ou mobile
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-1">Actif</div>
                  </div>
                  <button className="text-[13px] text-[#0052CC] hover:underline font-medium">
                    Paramètres
                  </button>
                </div>

                {/* Webhooks */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-[14px] font-semibold text-[#212529]">
                      Webhooks & API
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-0.5">
                      Notifier vos systèmes (paie, ERP, RH) en temps réel
                    </div>
                    <div className="text-[12px] text-green-600 font-medium mt-1">
                      2 webhooks actifs
                    </div>
                  </div>
                  <button className="text-[13px] text-[#0052CC] hover:underline font-medium">
                    Voir la documentation
                  </button>
                </div>

                {/* CSV Import */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-[14px] font-semibold text-[#212529]">
                      Imports CSV / Excel
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-0.5">
                      Importer employés, plannings et historisation
                    </div>
                    <div className="text-[12px] text-[#6C757D] mt-1">
                      Dernier import : 02/04/2025
                    </div>
                  </div>
                  <button className="text-[13px] text-[#0052CC] hover:underline font-medium">
                    Nouvel import
                  </button>
                </div>

                {/* Automatic Exports */}
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
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Génération automatique le dernier jour ouvré du mois.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportSettings.monthlyPayrollEmail}
                          onChange={(e) =>
                            setExportSettings({
                              ...exportSettings,
                              monthlyPayrollEmail: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-[14px] font-semibold text-[#212529]">
                          Activer l'export vers SFTP
                        </div>
                        <div className="text-[12px] text-[#6C757D] mt-0.5">
                          Déposer les fichiers paie sur un serveur sécurisé.
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportSettings.sfptExport}
                          onChange={(e) =>
                            setExportSettings({
                              ...exportSettings,
                              sfptExport: e.target.checked,
                            })
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
          </div>
        </div>
      </div>
    </div>
  );
}
