'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';
import type { AnomalySummary } from '@/lib/api/anomalies';

interface AnomaliesSummaryCardsProps {
  summary?: AnomalySummary;
  isLoading?: boolean;
}

export function AnomaliesSummaryCards({
  summary,
  isLoading,
}: AnomaliesSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Anomalies',
      value: summary?.total ?? 0,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      description: 'Anomalies détectées',
    },
    {
      title: 'En Attente',
      value: summary?.pending ?? 0,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Corrections requises',
    },
    {
      title: 'Corrigées',
      value: summary?.corrected ?? 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Anomalies résolues',
    },
    {
      title: 'Taux de Correction',
      value: `${(summary?.correctionRate ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: getCorrectionRateColor(summary?.correctionRate ?? 0),
      bgColor: getCorrectionRateBgColor(summary?.correctionRate ?? 0),
      description: 'Résolution',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getCorrectionRateColor(rate: number): string {
  if (rate >= 80) return 'text-green-500';
  if (rate >= 50) return 'text-yellow-500';
  return 'text-red-500';
}

function getCorrectionRateBgColor(rate: number): string {
  if (rate >= 80) return 'bg-green-50';
  if (rate >= 50) return 'bg-yellow-50';
  return 'bg-red-50';
}

export default AnomaliesSummaryCards;
