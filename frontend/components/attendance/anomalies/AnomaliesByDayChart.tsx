'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { AnomalyByDay } from '@/lib/api/anomalies';

interface AnomaliesByDayChartProps {
  data?: AnomalyByDay[];
  isLoading?: boolean;
}

export function AnomaliesByDayChart({
  data,
  isLoading,
}: AnomaliesByDayChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolution par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Agréger les données par jour (au cas où il y aurait des doublons)
  const aggregatedData = (data || []).reduce((acc, item) => {
    const existingDay = acc.find((d) => d.date === item.date);
    if (existingDay) {
      existingDay.count += item.count;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [] as AnomalyByDay[]);

  // Trier par date
  const sortedData = aggregatedData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Formater les données pour le graphique
  const chartData = sortedData.map((item) => ({
    date: item.date,
    count: item.count,
    dayLabel: format(parseISO(item.date), 'EEE', { locale: fr }),
    fullDate: format(parseISO(item.date), 'EEEE d MMMM', { locale: fr }),
  }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolution par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune donnée pour cette période
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...chartData.map((d) => d.count));
  const avgCount = chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium text-gray-800 capitalize">{data.fullDate}</p>
          <p className="text-sm">
            <span className="text-orange-500 font-semibold">
              {data.count}
            </span>{' '}
            anomalie{data.count > 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Evolution par Jour</CardTitle>
          <div className="text-xs text-muted-foreground">
            Moy: {avgCount.toFixed(1)} / jour
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="dayLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={[0, Math.ceil(maxCount * 1.1)]}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="count"
                fill="#FD7E14"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
          <span>
            {chartData.length > 0
              ? format(parseISO(chartData[0].date), 'd MMM', { locale: fr })
              : ''}
          </span>
          <span>
            {chartData.length > 0
              ? format(parseISO(chartData[chartData.length - 1].date), 'd MMM', {
                  locale: fr,
                })
              : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnomaliesByDayChart;
