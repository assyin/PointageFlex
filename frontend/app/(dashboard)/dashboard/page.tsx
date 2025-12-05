'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '@/lib/hooks/useDashboardStats';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

// Couleurs pour les graphiques
const COLORS = {
  primary: '#0052CC',
  success: '#28A745',
  warning: '#FFC107',
  danger: '#DC3545',
  info: '#17A2B8',
  matin: '#00A3FF',
  soir: '#0052CC',
  nuit: '#212529',
};

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');

  // Calculate date filters
  const dateFilters = useMemo(() => {
    const today = new Date();
    const startDate = new Date();

    if (selectedPeriod === 'aujourd-hui') {
      startDate.setHours(0, 0, 0, 0);
    } else if (selectedPeriod === 'semaine') {
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === 'mois') {
      startDate.setDate(1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: today.toISOString(),
    };
  }, [selectedPeriod]);

  // Fetch dashboard stats
  const { data: stats, isLoading } = useDashboardStats(dateFilters);

  // Mock data for charts (would come from API in production)
  const weeklyAttendanceData = [
    { day: 'Lun', retards: 4, absences: 2 },
    { day: 'Mar', retards: 3, absences: 1 },
    { day: 'Mer', retards: 5, absences: 3 },
    { day: 'Jeu', retards: 2, absences: 1 },
    { day: 'Ven', retards: 6, absences: 4 },
    { day: 'Sam', retards: 1, absences: 0 },
    { day: 'Dim', retards: 0, absences: 0 },
  ];

  const shiftDistribution = [
    { name: 'Matin (6h-14h)', value: 45, color: COLORS.matin },
    { name: 'Soir (14h-22h)', value: 35, color: COLORS.soir },
    { name: 'Nuit (22h-6h)', value: 20, color: COLORS.nuit },
  ];

  const overtimeData = [
    { semaine: 'S1', heures: 12 },
    { semaine: 'S2', heures: 15 },
    { semaine: 'S3', heures: 18 },
    { semaine: 'S4', heures: 14 },
  ];

  return (
    <DashboardLayout title="Tableau de Bord" subtitle="Vue d'ensemble de la gestion RH">
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-secondary">Période:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="aujourd-hui">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Taux de présence</p>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {stats?.attendanceRate || 0}%
              </h3>
              <Badge variant="success">+2.5% vs hier</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Retards</p>
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {stats?.lates || 14}
              </h3>
              <Badge variant="warning">-3 vs semaine dernière</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Pointages</p>
                <Calendar className="h-5 w-5 text-info" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {stats?.totalPointages || 248}
              </h3>
              <Badge variant="info">Aujourd'hui</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-text-secondary">Heures sup</p>
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-2">
                {stats?.overtimeHours || 59}h
              </h3>
              <Badge variant="default">Cette semaine</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Retards & Absences */}
          <Card>
            <CardHeader>
              <CardTitle>Retards & Absences (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6C757D" />
                  <YAxis stroke="#6C757D" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="retards" fill={COLORS.warning} name="Retards" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absences" fill={COLORS.danger} name="Absences" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart - Distribution des Shifts */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={shiftDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {shiftDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart - Heures Supplémentaires */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Évolution des Heures Supplémentaires</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overtimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="semaine" stroke="#6C757D" />
                  <YAxis stroke="#6C757D" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="heures"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: COLORS.primary, r: 6 }}
                    name="Heures sup"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Employés actifs</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {stats?.employees?.total || 0}
                  </p>
                </div>
                <Users className="h-10 w-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Congés en cours</p>
                  <p className="text-2xl font-bold text-text-primary mt-1">
                    {stats?.leaves?.current || 0}
                  </p>
                </div>
                <Calendar className="h-10 w-10 text-info opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-secondary">Anomalies détectées</p>
                  <p className="text-2xl font-bold text-danger mt-1">
                    {stats?.anomalies || 0}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-danger opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
