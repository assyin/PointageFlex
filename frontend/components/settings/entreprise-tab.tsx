'use client';

import { Building2, Globe } from 'lucide-react';

interface EntrepriseTabProps {
  formData: {
    legalName: string;
    displayName: string;
    country: string;
    city: string;
    hrEmail: string;
    phone: string;
    language: string;
    timezone: string;
    firstDayOfWeek: string;
    workingDays: number[];
  };
  setFormData: (data: any) => void;
}

export function EntrepriseTab({ formData, setFormData }: EntrepriseTabProps) {
  return (
    <div className="space-y-6">
      {/* Informations entreprise */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0052CC]" />
            Informations entreprise
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
            Nom, identite visuelle et contacts principaux
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                Nom legal de l'entreprise
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
                Nom affiche dans l'application
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
                Telephone
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

      {/* Parametres regionaux */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#0052CC]" />
            Fuseau horaire & parametres regionaux
          </h2>
          <p className="text-[13px] text-[#6C757D] mt-1">
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
                Langue par defaut
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              >
                <option value="fr">Francais</option>
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

          {/* Jours ouvrables */}
          <div className="mt-6">
            <label className="block text-[13px] font-medium text-[#6C757D] mb-3">
              Jours ouvrables de la semaine
            </label>
            <p className="text-[12px] text-[#6C757D] mb-3">
              Selectionnez les jours de la semaine ou les employes travaillent normalement.
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
              Jours selectionnes: {formData.workingDays.length === 0
                ? 'Aucun'
                : formData.workingDays.map(d => {
                    const days = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
                    return days[d];
                  }).join(', ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
