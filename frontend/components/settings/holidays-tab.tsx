'use client';

import { Calendar, Plus, Edit, Trash2, Upload, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { HolidayType } from '@/lib/api/holidays';

interface HolidaysTabProps {
  holidays: any[];
  onCreateHoliday: (data: any) => Promise<void>;
  onUpdateHoliday: (id: string, data: any) => Promise<void>;
  onDeleteHoliday: (id: string) => Promise<void>;
  onImportHolidays: (file: File) => Promise<void>;
  onGenerateHolidays: (data: { year: number; includeReligious: boolean; mode: 'add' | 'replace' }) => Promise<void>;
  isGenerating?: boolean;
}

export function HolidaysTab({
  holidays,
  onCreateHoliday,
  onUpdateHoliday,
  onDeleteHoliday,
  onImportHolidays,
  onGenerateHolidays,
  isGenerating,
}: HolidaysTabProps) {
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    type: HolidayType.NATIONAL,
    isRecurring: false,
  });
  const [generateForm, setGenerateForm] = useState({
    year: new Date().getFullYear(),
    includeReligious: true,
    mode: 'add' as 'add' | 'replace',
  });

  const handleSubmitHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHoliday) {
      await onUpdateHoliday(editingHoliday.id, holidayForm);
    } else {
      await onCreateHoliday(holidayForm);
    }
    setShowHolidayModal(false);
    setEditingHoliday(null);
    setHolidayForm({ name: '', date: '', type: HolidayType.NATIONAL, isRecurring: false });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateHolidays(generateForm);
    setShowGenerateModal(false);
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0052CC]" />
                Jours feries
              </h2>
              <p className="text-[13px] text-[#6C757D] mt-1">
                Calendrier des jours feries ({holidays.length})
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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onImportHolidays(file);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 text-[13px] font-medium"
                >
                  <Calendar className="w-4 h-4" />
                  Generer
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

        <div className="p-6 space-y-2 max-h-[600px] overflow-y-auto">
          {holidays.length === 0 ? (
            <div className="text-center py-12 text-[#6C757D]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-[14px]">Aucun jour ferie</p>
              <p className="text-[12px] mt-1">Cliquez sur "Generer" pour creer automatiquement les jours feries</p>
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
                  {holiday.isRecurring && (
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                      Recurrent
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#6C757D]">
                    {new Date(holiday.date).toLocaleDateString('fr-FR')}
                  </span>
                  <PermissionGate permission="tenant.manage_holidays">
                    <button
                      onClick={() => openEditHoliday(holiday)}
                      className="p-1.5 text-[#6C757D] hover:text-[#0052CC] hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Etes-vous sur de vouloir supprimer ce jour ferie ?')) {
                          onDeleteHoliday(holiday.id);
                        }
                      }}
                      className="p-1.5 text-[#6C757D] hover:text-red-600 hover:bg-red-50 rounded"
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

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">
                {editingHoliday ? 'Modifier le jour ferie' : 'Nouveau jour ferie'}
              </h3>
            </div>
            <form onSubmit={handleSubmitHoliday} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">Date *</label>
                <input
                  type="date"
                  value={holidayForm.date}
                  onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">Type</label>
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
                  Recurrent chaque annee
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
                  {editingHoliday ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">Generer les jours feries</h3>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">Annee *</label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  value={generateForm.year}
                  onChange={(e) => setGenerateForm({ ...generateForm, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                  required
                />
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
                  Inclure les jours feries religieux (Aid, etc.)
                </label>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">Mode</label>
                <select
                  value={generateForm.mode}
                  onChange={(e) => setGenerateForm({ ...generateForm, mode: e.target.value as 'add' | 'replace' })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
                >
                  <option value="add">Ajouter uniquement les manquants</option>
                  <option value="replace">Remplacer tous les jours feries de l'annee</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  La generation est basee sur le calendrier marocain.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generation...
                    </>
                  ) : (
                    'Generer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
