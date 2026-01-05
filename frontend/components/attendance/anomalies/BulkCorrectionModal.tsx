'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle, AlertTriangle, Users } from 'lucide-react';
import {
  ANOMALY_LABELS,
  type AnomalyRecord,
  type AnomalyType,
} from '@/lib/api/anomalies';

interface BulkCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  anomalies: AnomalyRecord[];
  onSubmit: (data: {
    generalNote: string;
    forceApproval: boolean;
  }) => void;
  isLoading?: boolean;
}

export function BulkCorrectionModal({
  isOpen,
  onClose,
  anomalies,
  onSubmit,
  isLoading,
}: BulkCorrectionModalProps) {
  const [generalNote, setGeneralNote] = React.useState('');
  const [forceApproval, setForceApproval] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setGeneralNote('');
      setForceApproval(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      generalNote,
      forceApproval,
    });
  };

  // Grouper par type d'anomalie
  const byType = anomalies.reduce((acc, a) => {
    const type = a.anomalyType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(a);
    return acc;
  }, {} as Record<string, AnomalyRecord[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Correction en masse
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de corriger {anomalies.length} anomalie
            {anomalies.length > 1 ? 's' : ''} en une seule action.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Résumé des anomalies sélectionnées */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Anomalies sélectionnées
              </h4>

              {/* Par type */}
              <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(byType).map(([type, items]) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="text-xs"
                  >
                    {ANOMALY_LABELS[type as AnomalyType] || type}: {items.length}
                  </Badge>
                ))}
              </div>

              {/* Liste scrollable */}
              <ScrollArea className="h-[150px] rounded-md border bg-white p-2">
                <div className="space-y-2">
                  {anomalies.map((anomaly) => (
                    <div
                      key={anomaly.id}
                      className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                    >
                      <span className="font-medium">
                        {anomaly.employee
                          ? `${anomaly.employee.firstName} ${anomaly.employee.lastName}`
                          : 'N/A'}
                      </span>
                      <span className="text-muted-foreground">
                        {format(parseISO(anomaly.timestamp), 'dd/MM HH:mm', {
                          locale: fr,
                        })}
                        {' - '}
                        {ANOMALY_LABELS[anomaly.anomalyType as AnomalyType] ||
                          anomaly.anomalyType}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Note générale */}
            <div className="space-y-2">
              <Label htmlFor="generalNote">
                Note de correction générale <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="generalNote"
                placeholder="Cette note sera appliquée à toutes les anomalies sélectionnées..."
                value={generalNote}
                onChange={(e) => setGeneralNote(e.target.value)}
                rows={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Une même note sera appliquée à toutes les corrections
              </p>
            </div>

            {/* Option approbation forcée */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="forceApprovalBulk"
                checked={forceApproval}
                onCheckedChange={(checked) => setForceApproval(!!checked)}
              />
              <Label
                htmlFor="forceApprovalBulk"
                className="text-sm font-normal cursor-pointer"
              >
                Approuver immédiatement toutes les corrections
              </Label>
            </div>

            {/* Avertissement */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
              <strong>Attention:</strong> Cette action est irréversible. Assurez-vous
              que toutes les anomalies sélectionnées doivent être corrigées avec
              la même justification.
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !generalNote.trim()}
              className="gap-2"
            >
              {isLoading ? (
                'Correction en cours...'
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Corriger {anomalies.length} anomalie
                  {anomalies.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BulkCorrectionModal;
