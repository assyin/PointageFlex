'use client';

import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PermissionGate } from '@/components/auth/PermissionGate';

interface SitesTabProps {
  sites: any[];
  onCreateSite: (data: any) => Promise<void>;
  onUpdateSite: (id: string, data: any) => Promise<void>;
  onDeleteSite: (id: string) => Promise<void>;
  isCreating?: boolean;
  isUpdating?: boolean;
}

export function SitesTab({
  sites,
  onCreateSite,
  onUpdateSite,
  onDeleteSite,
  isCreating,
  isUpdating,
}: SitesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [siteForm, setSiteForm] = useState({
    name: '',
    address: '',
    city: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSite) {
      await onUpdateSite(editingSite.id, siteForm);
    } else {
      await onCreateSite(siteForm);
    }
    setShowModal(false);
    setEditingSite(null);
    setSiteForm({ name: '', address: '', city: '', phone: '' });
  };

  const openEdit = (site: any) => {
    setEditingSite(site);
    setSiteForm({
      name: site.name,
      address: site.address || '',
      city: site.city || '',
      phone: site.phone || '',
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingSite(null);
    setSiteForm({ name: '', address: '', city: '', phone: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#212529] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#0052CC]" />
                Sites
              </h2>
              <p className="text-[13px] text-[#6C757D] mt-1">
                Gerer les differents sites de l'entreprise ({sites.length})
              </p>
            </div>
            <PermissionGate permission="tenant.manage_sites">
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-3 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] text-[13px] font-semibold"
              >
                <Plus className="w-4 h-4" />
                Nouveau site
              </button>
            </PermissionGate>
          </div>
        </div>

        <div className="p-6 space-y-2 max-h-[600px] overflow-y-auto">
          {sites.length === 0 ? (
            <div className="text-center py-12 text-[#6C757D]">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-[14px]">Aucun site configure</p>
              <p className="text-[12px] mt-1">Cliquez sur "Nouveau site" pour en ajouter un</p>
            </div>
          ) : (
            sites.map((site: any) => (
              <div
                key={site.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <div className="text-[14px] font-semibold text-[#212529]">{site.name}</div>
                  <div className="text-[12px] text-[#6C757D]">Code: {site.code}</div>
                  {site.city && <div className="text-[12px] text-[#6C757D]">{site.city}</div>}
                  {site._count && (
                    <div className="text-[11px] text-[#6C757D] mt-1">
                      {site._count.employees} employes · {site._count.devices} terminaux
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <PermissionGate permission="tenant.manage_sites">
                    <button
                      onClick={() => openEdit(site)}
                      className="p-2 text-[#6C757D] hover:text-[#0052CC] hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Etes-vous sur de vouloir supprimer ce site ?')) {
                          onDeleteSite(site.id);
                        }
                      }}
                      className="p-2 text-[#6C757D] hover:text-red-600 hover:bg-red-50 rounded-lg"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-[18px] font-semibold">
                {editingSite ? 'Modifier le site' : 'Nouveau site'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {editingSite?.code && (
                <div>
                  <label className="block text-[13px] font-medium text-[#6C757D] mb-1.5">
                    Code
                  </label>
                  <input
                    type="text"
                    value={editingSite.code}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-[14px] bg-gray-50"
                    disabled
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Le code est genere automatiquement</p>
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
                  Telephone
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
                    setShowModal(false);
                    setEditingSite(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-[#212529] rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-4 py-2.5 bg-[#0052CC] text-white rounded-lg hover:bg-[#0041A8] disabled:opacity-50"
                >
                  {editingSite ? 'Modifier' : 'Creer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
