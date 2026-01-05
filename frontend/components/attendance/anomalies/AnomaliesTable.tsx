'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MoreHorizontal,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  ANOMALY_LABELS,
  ANOMALY_COLORS,
  type AnomalyRecord,
  type AnomalyType,
} from '@/lib/api/anomalies';

interface AnomaliesTableProps {
  data?: AnomalyRecord[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCorrect: (anomaly: AnomalyRecord) => void;
  onViewDetails?: (anomaly: AnomalyRecord) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export function AnomaliesTable({
  data = [],
  isLoading,
  selectedIds,
  onSelectionChange,
  onCorrect,
  onViewDetails,
  pagination,
  onPageChange,
}: AnomaliesTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const uncorrectedIds = data
        .filter((a) => !a.isCorrected)
        .map((a) => a.id);
      onSelectionChange(uncorrectedIds);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    }
  };

  const uncorrectedCount = data.filter((a) => !a.isCorrected).length;
  const allUncorrectedSelected =
    uncorrectedCount > 0 && selectedIds.length === uncorrectedCount;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Liste des Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Liste des Anomalies</CardTitle>
        {selectedIds.length > 0 && (
          <Badge variant="secondary">
            {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune anomalie trouvée pour les critères sélectionnés
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allUncorrectedSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Sélectionner tout"
                      />
                    </TableHead>
                    <TableHead>Employé</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date/Heure</TableHead>
                    <TableHead>Département</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((anomaly) => {
                    const anomalyType = anomaly.anomalyType as AnomalyType;
                    const anomalyLabel =
                      ANOMALY_LABELS[anomalyType] || anomaly.anomalyType;
                    const anomalyColor =
                      ANOMALY_COLORS[anomalyType] || '#6C757D';

                    return (
                      <TableRow
                        key={anomaly.id}
                        className={
                          selectedIds.includes(anomaly.id)
                            ? 'bg-blue-50'
                            : undefined
                        }
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(anomaly.id)}
                            onCheckedChange={(checked) =>
                              handleSelectOne(anomaly.id, !!checked)
                            }
                            disabled={anomaly.isCorrected}
                            aria-label={`Sélectionner ${anomaly.employee?.firstName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {anomaly.employee
                              ? `${anomaly.employee.firstName} ${anomaly.employee.lastName}`
                              : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {anomaly.employee?.matricule || ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: `${anomalyColor}20`,
                              color: anomalyColor,
                              borderColor: anomalyColor,
                            }}
                            className="border"
                          >
                            {anomalyLabel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            {format(parseISO(anomaly.timestamp), 'dd/MM/yyyy', {
                              locale: fr,
                            })}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(anomaly.timestamp), 'HH:mm', {
                              locale: fr,
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {anomaly.employee?.department?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {anomaly.isCorrected ? (
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Corrigée
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-yellow-50 text-yellow-700 border-yellow-200"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              En attente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onViewDetails && (
                                <DropdownMenuItem
                                  onClick={() => onViewDetails(anomaly)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir détails
                                </DropdownMenuItem>
                              )}
                              {!anomaly.isCorrected && (
                                <DropdownMenuItem
                                  onClick={() => onCorrect(anomaly)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Corriger
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages} (
                  {pagination.total} résultats)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AnomaliesTable;
