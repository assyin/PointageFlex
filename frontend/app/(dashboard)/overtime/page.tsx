'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  useOvertimeRecords,
  useApproveOvertime,
  useRejectOvertime,
  useConvertToRecovery,
} from '@/lib/hooks/useOvertime';

export default function OvertimePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch overtime data
  const { data: overtimeData, isLoading, error, refetch } = useOvertimeRecords();

  // Mutations
  const approveMutation = useApproveOvertime();
  const rejectMutation = useRejectOvertime();
  const convertMutation = useConvertToRecovery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approuvé
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="danger" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejeté
          </Badge>
        );
      case 'PAID':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Payé
          </Badge>
        );
      case 'RECOVERED':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Récupéré
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, { label: string; color: string }> = {
      STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800' },
      NIGHT: { label: 'Nuit', color: 'bg-purple-100 text-purple-800' },
      HOLIDAY: { label: 'Jour férié', color: 'bg-orange-100 text-orange-800' },
      EMERGENCY: { label: 'Urgence', color: 'bg-red-100 text-red-800' },
    };
    const typeInfo = typeLabels[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  const handleApprove = async (id: string) => {
    await approveMutation.mutateAsync(id);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason });
    }
  };

  const handleConvertToRecovery = async (id: string) => {
    if (confirm('Convertir ces heures supplémentaires en récupération?')) {
      await convertMutation.mutateAsync(id);
    }
  };

  const filteredRecords = overtimeData?.data?.filter((record: any) => {
    const matchesSearch =
      searchQuery === '' ||
      record.employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employee?.matricule?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' ||
      record.status === selectedStatus;

    return matchesSearch && matchesStatus;
  }) || [];

  const pendingCount = overtimeData?.data?.filter((r: any) => r.status === 'PENDING').length || 0;
  const approvedCount = overtimeData?.data?.filter((r: any) => r.status === 'APPROVED').length || 0;
  const totalHours = overtimeData?.data?.reduce((sum: number, r: any) => sum + (r.hours || 0), 0) || 0;

  return (
    <DashboardLayout
      title="Gestion des Heures Supplémentaires"
      subtitle="Demandes, approbations et récupérations"
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <Input
                type="text"
                placeholder="Rechercher employé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
              <option value="PAID">Payé</option>
              <option value="RECOVERED">Récupéré</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total heures</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {totalHours}h
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">En attente</p>
                  <p className="text-2xl font-bold text-warning mt-1">
                    {pendingCount}
                  </p>
                </div>
                <Clock className="h-10 w-10 text-warning opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Approuvés</p>
                  <p className="text-2xl font-bold text-success mt-1">
                    {approvedCount}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Demandes</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {overtimeData?.data?.length || 0}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals Alert */}
        {pendingCount > 0 && (
          <Alert variant="info">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">{pendingCount} demande(s) d'heures supplémentaires</span>
              {' '}en attente de validation.
            </AlertDescription>
          </Alert>
        )}

        {/* Overtime Table */}
        <Card>
          <CardHeader>
            <CardTitle>Heures supplémentaires</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-text-secondary">Chargement...</span>
              </div>
            ) : error ? (
              <Alert variant="danger">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Erreur lors du chargement des données. Veuillez réessayer.
                </AlertDescription>
              </Alert>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>Aucune demande d'heures supplémentaires trouvée.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-table-header text-left text-sm font-semibold text-text-primary">
                      <th className="p-3">Employé</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Heures</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Conversion</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border">
                    {filteredRecords.map((record: any) => (
                      <tr key={record.id} className="hover:bg-table-hover transition-colors">
                        <td className="p-3">
                          <div className="font-medium text-text-primary">
                            {record.employee?.firstName} {record.employee?.lastName}
                          </div>
                          <div className="text-sm text-text-secondary">
                            {record.employee?.matricule}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-text-secondary">
                          {format(new Date(record.date), 'dd/MM/yyyy', { locale: fr })}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-lg text-text-primary">
                            {record.hours}h
                          </span>
                        </td>
                        <td className="p-3">
                          {getTypeBadge(record.type)}
                        </td>
                        <td className="p-3">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="p-3">
                          {record.convertedToRecovery ? (
                            <Badge variant="success">Converti</Badge>
                          ) : (
                            <span className="text-sm text-text-secondary">Non converti</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {record.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleApprove(record.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approuver
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleReject(record.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rejeter
                                </Button>
                              </>
                            )}
                            {record.status === 'APPROVED' && !record.convertedToRecovery && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConvertToRecovery(record.id)}
                                disabled={convertMutation.isPending}
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Convertir
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
