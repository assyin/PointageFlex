'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AlertTriangle, ChevronDown, UserCircle } from 'lucide-react';
import type { HighAnomalyEmployee } from '@/lib/api/anomalies';

interface HighAnomalyRateAlertProps {
  employees?: HighAnomalyEmployee[];
  isLoading?: boolean;
  onEmployeeClick?: (employeeId: string) => void;
}

export function HighAnomalyRateAlert({
  employees = [],
  isLoading,
  onEmployeeClick,
}: HighAnomalyRateAlertProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (isLoading || employees.length === 0) {
    return null;
  }

  const topEmployees = employees.slice(0, 3);
  const remainingCount = Math.max(0, employees.length - 3);

  return (
    <Alert variant="danger" className="bg-red-50 border-red-200">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="font-semibold">Attention requise</AlertTitle>
      <AlertDescription>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between mt-2">
            <span>
              <span className="font-medium">{employees.length}</span> employé
              {employees.length > 1 ? 's' : ''} avec un taux d'anomalies élevé
            </span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 h-7">
                Détails
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-3 space-y-2">
              {employees.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="flex items-center justify-between p-2 bg-white rounded-md border border-red-100"
                >
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {employee.employeeName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {employee.department || 'Sans département'} •{' '}
                        {employee.matricule || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="danger"
                      className="bg-red-100 text-red-700 hover:bg-red-100"
                    >
                      {employee.anomalyCount} anomalies
                    </Badge>
                    {onEmployeeClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onEmployeeClick(employee.employeeId)}
                      >
                        Voir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {employees.length > 0 && (
              <div className="mt-3 text-xs text-gray-500">
                <strong>Recommandations:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {employees.slice(0, 2).map((emp) => (
                    <li key={`rec-${emp.employeeId}`}>
                      {emp.employeeName}: {emp.recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}

export default HighAnomalyRateAlert;
