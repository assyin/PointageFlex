'use client';

import { AlertTriangle } from 'lucide-react';

interface AlertesTabProps {
  formData: {
    alertWeeklyHoursExceeded: boolean;
    alertInsufficientRest: boolean;
    alertNightWorkRepetitive: boolean;
    alertMinimumStaffing: boolean;
  };
  setFormData: (data: any) => void;
}

export function AlertesTab({ formData, setFormData }: AlertesTabProps) {
  const alerts = [
    {
      key: 'alertWeeklyHoursExceeded',
      label: 'Depassement heures hebdomadaires',
      desc: 'Alerte si un employe depasse le seuil d\'heures max par semaine',
    },
    {
      key: 'alertInsufficientRest',
      label: 'Repos insuffisant',
      desc: 'Alerte si le temps de repos entre deux shifts est insuffisant',
    },
    {
      key: 'alertNightWorkRepetitive',
      label: 'Travail de nuit repetitif',
      desc: 'Alerte si un employe enchaine trop de shifts de nuit consecutifs',
    },
    {
      key: 'alertMinimumStaffing',
      label: 'Effectif minimum',
      desc: 'Alerte si l\'effectif planifie est inferieur au minimum requis',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertes Legales
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
            Activation des alertes de conformite au code du travail
          </p>
        </div>
        <div className="p-6 space-y-4">
          {alerts.map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-[14px] font-semibold text-[#212529]">{item.label}</div>
                <div className="text-[12px] text-[#6C757D] mt-0.5">{item.desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData[item.key as keyof typeof formData] as boolean}
                  onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0052CC]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-semibold text-blue-900">
              A propos des alertes legales
            </h3>
            <p className="text-[13px] text-blue-700 mt-1">
              Ces alertes sont basees sur le code du travail marocain. Elles permettent de detecter
              automatiquement les situations non conformes et d'alerter les responsables RH.
              Les alertes sont generees en temps reel lors de la validation des plannings et des pointages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
