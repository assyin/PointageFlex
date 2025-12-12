'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useAttendance,
  useAttendanceAnomalies,
  useExportAttendance,
} from '@/lib/hooks/useAttendance';

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  // Fetch attendance data with auto-refresh
  const { data: attendanceData, isLoading, error, refetch, dataUpdatedAt } = useAttendance({
    startDate,
    endDate,
    page: 1,
    limit: 100,
  });

  // Auto-refresh notification
  const [lastCount, setLastCount] = React.useState(0);
  React.useEffect(() => {
    if (Array.isArray(attendanceData) && attendanceData.length > lastCount && lastCount > 0) {
      const newRecords = attendanceData.length - lastCount;
      // toast.success(`${newRecords} nouveau(x) pointage(s) détecté(s)`);
    }
    if (Array.isArray(attendanceData)) {
      setLastCount(attendanceData.length);
    }
  }, [attendanceData, lastCount]);

  // Fetch anomalies
  const { data: anomaliesData } = useAttendanceAnomalies(startDate);

  // Export mutation
  const exportMutation = useExportAttendance();

  const handleExport = (format: 'csv' | 'excel') => {
    exportMutation.mutate({
      format,
      filters: { startDate, endDate },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Valide
          </Badge>
        );
      case 'PENDING_CORRECTION':
        return (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            En attente
          </Badge>
        );
      case 'CORRECTED':
        return (
          <Badge variant="info" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Corrigé
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels: Record<string, string> = {
      BIOMETRIC: 'Empreinte',
      FINGERPRINT: 'Empreinte',
      FACE_RECOGNITION: 'Reconnaissance faciale',
      RFID: 'Badge RFID',
      RFID_BADGE: 'Badge RFID',
      FACIAL: 'Reconnaissance faciale',
      QR_CODE: 'QR Code',
      PIN: 'Code PIN',
      PIN_CODE: 'Code PIN',
      MOBILE_GPS: 'Mobile GPS',
      MANUAL: 'Manuel',
      IMPORT: 'Import',
    };
    return sourceLabels[source] || source;
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, { label: string; color: string; icon?: any }> = {
      ENTRY: { label: 'Entrée', color: 'bg-green-100 text-green-800' },
      EXIT: { label: 'Sortie', color: 'bg-blue-100 text-blue-800' },
      IN: { label: 'Entrée', color: 'bg-green-100 text-green-800' },
      OUT: { label: 'Sortie', color: 'bg-blue-100 text-blue-800' },
      BREAK_START: { label: 'Début pause', color: 'bg-yellow-100 text-yellow-800' },
      BREAK_END: { label: 'Fin pause', color: 'bg-orange-100 text-orange-800' },
      BREAK: { label: 'Pause', color: 'bg-yellow-100 text-yellow-800' },
    };
    const typeInfo = typeLabels[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${typeInfo.color} inline-flex items-center gap-1`}>
        {typeInfo.label}
      </span>
    );
  };

  const filteredRecords = Array.isArray(attendanceData)
    ? attendanceData.filter((record: any) =>
        searchQuery === '' ||
        record.employee?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.employee?.matricule?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <ProtectedRoute permissions={['attendance.view_all', 'attendance.view_own', 'attendance.view_team']}>
      <DashboardLayout
        title="Pointages & Présences"
        subtitle="Suivre les entrées/sorties, anomalies et intégrations biométriques"
      >
      <div className="space-y-6">
        {/* Anomalies Alert */}
        {anomaliesData && anomaliesData.length > 0 && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">{anomaliesData.length} anomalie(s) détectée(s)</span>
              {' '}nécessitent votre attention (sorties manquantes, retards, absences).
            </AlertDescription>
          </Alert>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Date Filters Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Période:</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-44"
                  />
                  <span className="text-text-secondary">→</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-44"
                  />
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      setStartDate(today);
                      setEndDate(today);
                    }}
                  >
                    Aujourd'hui
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date();
                      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
                      setStartDate(format(weekStart, 'yyyy-MM-dd'));
                      setEndDate(format(new Date(), 'yyyy-MM-dd'));
                    }}
                  >
                    Cette semaine
                  </Button>
                </div>
              </div>

              {/* Search and Actions Row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px] max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, prénom ou matricule..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex gap-2 ml-auto">
                  <PermissionGate permissions={['attendance.export', 'attendance.view_all']}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('csv')}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </PermissionGate>
                  <PermissionGate permissions={['attendance.export', 'attendance.view_all']}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport('excel')}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Excel
                    </Button>
                  </PermissionGate>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </div>

              {/* Auto-refresh indicator */}
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-primary animate-pulse' : 'bg-success'}`} />
                  <span>
                    {isLoading ? 'Chargement en cours...' : `Dernière actualisation: ${format(new Date(dataUpdatedAt), 'HH:mm:ss')}`}
                  </span>
                </div>
                <span className="text-text-secondary">
                  Actualisation automatique toutes les 30s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total pointages</p>
                  <p className="text-3xl font-bold text-text-primary mt-1">
                    {filteredRecords.length}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {Array.isArray(attendanceData) ? attendanceData.length : 0} au total
                  </p>
                </div>
                <Clock className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Entrées</p>
                  <p className="text-3xl font-bold text-success mt-1">
                    {filteredRecords.filter((r: any) => r.type === 'IN' || r.type === 'ENTRY').length}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Pointages d'entrée
                  </p>
                </div>
                <CheckCircle className="h-12 w-12 text-success opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Sorties</p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {filteredRecords.filter((r: any) => r.type === 'OUT' || r.type === 'EXIT').length}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    Pointages de sortie
                  </p>
                </div>
                <XCircle className="h-12 w-12 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Anomalies</p>
                  <p className="text-3xl font-bold text-danger mt-1">
                    {filteredRecords.filter((r: any) => r.hasAnomaly).length}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {anomaliesData?.length || 0} non résolues
                  </p>
                </div>
                <AlertTriangle className="h-12 w-12 text-danger opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Liste des pointages</CardTitle>
            <div className="text-sm text-text-secondary">
              {filteredRecords.length} pointage{filteredRecords.length > 1 ? 's' : ''} trouvé{filteredRecords.length > 1 ? 's' : ''}
            </div>
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
                <p>Aucun pointage trouvé pour cette période.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-table-header text-left text-sm font-semibold text-text-primary border-b-2 border-table-border">
                      <th className="p-4">Employé</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Date & Heure</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Terminal</th>
                      <th className="p-4">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-table-border">
                    {filteredRecords.map((record: any) => (
                      <tr key={record.id} className="hover:bg-table-hover transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {record.employee?.firstName?.charAt(0)}{record.employee?.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-text-primary">
                                {record.employee?.firstName} {record.employee?.lastName}
                              </div>
                              <div className="text-sm text-text-secondary">
                                {record.employee?.matricule || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {getTypeBadge(record.type)}
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-medium text-text-primary">
                            {format(new Date(record.timestamp), 'dd MMMM yyyy', { locale: fr })}
                          </div>
                          <div className="text-sm text-text-secondary font-mono">
                            {format(new Date(record.timestamp), 'HH:mm:ss')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-text-secondary">
                            {getSourceBadge(record.method || record.source)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-text-secondary font-mono">
                            {record.device?.name || record.deviceId?.substring(0, 8) || '—'}
                          </div>
                        </td>
                        <td className="p-4">
                          {record.hasAnomaly ? (
                            <Badge variant="danger" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Anomalie
                            </Badge>
                          ) : (
                            <Badge variant="success" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Valide
                            </Badge>
                          )}
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
    </ProtectedRoute>
  );
}
