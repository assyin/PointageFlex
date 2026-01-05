'use client';

import { UserCheck, Bed, Calendar } from 'lucide-react';

interface PointageTabProps {
  formData: {
    requireBreakPunch: boolean;
    requireScheduleForAttendance: boolean;
    absencePartialThreshold: number;
    absenceDetectionTime: string;
    enableInsufficientRestDetection: boolean;
    minimumRestHours: number;
    minimumRestHoursNightShift: number;
    holidayOvertimeEnabled: boolean;
    holidayOvertimeRate: number;
    holidayOvertimeAsNormalHours: boolean;
    monthlyPayrollEmail: boolean;
    sfptExport: boolean;
  };
  setFormData: (data: any) => void;
}

export function PointageTab({ formData, setFormData }: PointageTabProps) {
  return (
    <div className="space-y-6">
      {/* Pointage & Presences */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#0052CC]" />
            Pointage & Presences
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
            Configuration des regles de pointage et detection d'absences
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
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
              <p className="text-xs text-gray-500 mt-1">
                Retard considere comme absence partielle (defaut: 2h)
              </p>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                Heure de detection des absences
              </label>
              <input
                type="time"
                value={formData.absenceDetectionTime}
                onChange={(e) => setFormData({ ...formData, absenceDetectionTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              />
              <p className="text-xs text-gray-500 mt-1">
                Heure du job batch quotidien (defaut: 01:00)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-[14px] font-semibold text-[#212529]">
                  Exiger le pointage des repos (pauses)
                </div>
                <div className="text-[12px] text-[#6C757D] mt-0.5">
                  Les employes devront pointer leurs pauses
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireBreakPunch}
                  onChange={(e) => setFormData({ ...formData, requireBreakPunch: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-[14px] font-semibold text-[#212529]">
                  Exiger un planning pour les pointages
                </div>
                <div className="text-[12px] text-[#6C757D] mt-0.5">
                  Refuser les pointages sans planning ou shift assigne
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requireScheduleForAttendance}
                  onChange={(e) => setFormData({ ...formData, requireScheduleForAttendance: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Detection repos insuffisant */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <Bed className="w-5 h-5 text-purple-500" />
            Detection de repos insuffisant
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
            Configuration de la detection des violations de repos legal
          </p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-[14px] font-semibold text-[#212529]">
                Activer la detection de repos insuffisant
              </div>
              <div className="text-[12px] text-[#6C757D] mt-0.5">
                Detecter les violations du repos legal entre deux shifts
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableInsufficientRestDetection}
                onChange={(e) => setFormData({ ...formData, enableInsufficientRestDetection: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
            </label>
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
                <p className="text-xs text-gray-500 mt-1">Defaut: 11h (legislation)</p>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                  Repos minimum shift de nuit (heures)
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
                <p className="text-xs text-gray-500 mt-1">Defaut: 12h</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Majoration jours feries */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            Majoration des jours feries
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
            Configuration de la majoration des heures travaillees les jours feries
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-[14px] font-semibold text-[#212529]">
                Activer la majoration des jours feries
              </div>
              <div className="text-[12px] text-[#6C757D] mt-0.5">
                Majorer les heures travaillees les jours feries
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.holidayOvertimeEnabled}
                onChange={(e) => setFormData({ ...formData, holidayOvertimeEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
            </label>
          </div>

          {formData.holidayOvertimeEnabled && (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
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
                />
                <div className="text-[12px] text-[#6C757D] mt-1">
                  Exemple: 2.0 = double, 2.5 = double et demi
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-[14px] font-semibold text-[#212529]">
                    Calculer comme heures normales
                  </div>
                  <div className="text-[12px] text-[#6C757D] mt-0.5">
                    Sans majoration (le taux sera ignore)
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.holidayOvertimeAsNormalHours}
                    onChange={(e) => setFormData({ ...formData, holidayOvertimeAsNormalHours: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529]">
            Exports automatiques
          </h2>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-[14px] font-semibold text-[#212529]">
                Envoyer l'export paie mensuel par email
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.monthlyPayrollEmail}
                onChange={(e) => setFormData({ ...formData, monthlyPayrollEmail: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-[14px] font-semibold text-[#212529]">
                Activer l'export vers SFTP
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sfptExport}
                onChange={(e) => setFormData({ ...formData, sfptExport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
