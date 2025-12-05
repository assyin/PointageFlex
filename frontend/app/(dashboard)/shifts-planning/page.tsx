'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Search, Download, Printer, Plus, Calendar, AlertTriangle, ArrowRight, Clock, Loader2, Upload, ChevronLeft, ChevronRight, Trash2, CheckSquare, Square
} from 'lucide-react';
import {
  useWeekSchedule,
  useMonthSchedule,
  useScheduleAlerts,
  useReplacements,
  useApproveReplacement,
  useRejectReplacement,
  useCreateSchedule,
  useDeleteSchedule,
  useBulkDeleteSchedules,
} from '@/lib/hooks/useSchedules';
import { useShifts, useCreateShift } from '@/lib/hooks/useShifts';
import { useTeams } from '@/lib/hooks/useTeams';
import { useEmployees } from '@/lib/hooks/useEmployees';
import { AlertBanner } from '@/components/schedules/AlertBanner';
import { ImportSchedulesModal } from '@/components/schedules/ImportSchedulesModal';
import { X } from 'lucide-react';
import { formatErrorAlert } from '@/lib/utils/errorMessages';
import { toast } from 'sonner';

interface ShiftEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeInfo: string;
  shifts: {
    date: string;
    type: 'matin' | 'soir' | 'nuit' | 'leave' | 'absent' | 'swap';
    startTime?: string;
    endTime?: string;
    status?: string;
    detail?: string;
    scheduleId?: string;
  }[];
}

export default function ShiftsPlanningPage() {
  // Date management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('semaine');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedShiftType, setSelectedShiftType] = useState('tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [calendarView, setCalendarView] = useState<'today' | 'day' | 'week' | 'month'>('week');
  const [replacementTab, setReplacementTab] = useState<'pending' | 'history'>('pending');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const [showShiftDetail, setShowShiftDetail] = useState(false);
  const [showCreateShiftModal, setShowCreateShiftModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newShiftFormData, setNewShiftFormData] = useState({
    name: '',
    code: '',
    startTime: '08:00',
    endTime: '16:00',
    breakDuration: 60,
    isNightShift: false,
    color: '#3B82F6',
  });
  const [shiftFormData, setShiftFormData] = useState({
    employeeId: '',
    shiftId: '',
    dateDebut: format(new Date(), 'yyyy-MM-dd'),
    dateFin: '',
    teamId: '',
    customStartTime: '',
    customEndTime: '',
    notes: '',
  });
  const [scheduleType, setScheduleType] = useState<'single' | 'range'>('single');
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Calculate week/month dates
  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const weekEnd = useMemo(() => endOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const monthStart = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), [selectedDate]);
  const monthEnd = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), [selectedDate]);

  // API hooks
  const { data: weekData, isLoading: weekLoading, error: weekError } = useWeekSchedule(
    format(selectedDate, 'yyyy-MM-dd'),
    {
      teamId: selectedTeam || undefined,
      siteId: selectedSite || undefined,
    }
  );
  
  const createScheduleMutation = useCreateSchedule();
  const deleteScheduleMutation = useDeleteSchedule();
  const bulkDeleteSchedulesMutation = useBulkDeleteSchedules();

  const { data: monthData, isLoading: monthLoading } = useMonthSchedule(
    format(selectedDate, 'yyyy-MM-dd'),
    {
      teamId: selectedTeam || undefined,
      siteId: selectedSite || undefined,
    }
  );

  const { data: alertsData } = useScheduleAlerts(
    format(weekStart, 'yyyy-MM-dd'),
    format(weekEnd, 'yyyy-MM-dd')
  );

  const { data: replacementsData, isLoading: replacementsLoading } = useReplacements({
    status: replacementTab === 'pending' ? 'PENDING' : undefined,
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd'),
  });

  const { data: shiftsData, isLoading: shiftsLoading } = useShifts();
  const { data: teamsData, isLoading: teamsLoading } = useTeams();
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useEmployees();
  const createShiftMutation = useCreateShift();

  // Supprimé les logs de debug pour éviter les erreurs dans la console
  const approveReplacementMutation = useApproveReplacement();
  const rejectReplacementMutation = useRejectReplacement();

  // Filter alerts (remove dismissed)
  const filteredAlerts = useMemo(() => {
    if (!alertsData) return [];
    return alertsData.filter((alert) => !dismissedAlerts.has(alert.id));
  }, [alertsData, dismissedAlerts]);

  // Transform API data to ShiftEntry format
  const shiftEntries: ShiftEntry[] = useMemo(() => {
    if (!weekData?.schedules) return [];

    // Group schedules by employee
    const employeeMap = new Map<string, ShiftEntry>();

    weekData.schedules.forEach((schedule: any) => {
      const employeeId = schedule.employeeId;
      const employee = schedule.employee;

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          id: employeeId,
          employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          employeeInfo: [
            employee.department?.name,
            schedule.shift?.name,
            employee.site?.name,
          ].filter(Boolean).join(' - '),
          shifts: [],
        });
      }

      const entry = employeeMap.get(employeeId)!;
      const scheduleDate = parseISO(schedule.date);
      const dayName = format(scheduleDate, 'EEE d', { locale: fr });

      // Determine shift type from shift name
      let shiftType: 'matin' | 'soir' | 'nuit' = 'matin';
      if (schedule.shift) {
        const shiftName = schedule.shift.name.toLowerCase();
        if (shiftName.includes('soir')) shiftType = 'soir';
        else if (shiftName.includes('nuit')) shiftType = 'nuit';
      }

      entry.shifts.push({
        date: dayName,
        type: shiftType,
        startTime: schedule.customStartTime || schedule.shift?.startTime,
        endTime: schedule.customEndTime || schedule.shift?.endTime,
        scheduleId: schedule.id,
      });
    });

    // Add leaves
    weekData.leaves?.forEach((leave: any) => {
      const employeeId = leave.employeeId;
      if (employeeMap.has(employeeId)) {
        const entry = employeeMap.get(employeeId)!;
        const leaveStart = parseISO(leave.startDate);
        const leaveEnd = parseISO(leave.endDate);
        const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

        weekDays.forEach((day) => {
          if (day >= leaveStart && day <= leaveEnd) {
            const dayName = format(day, 'EEE d', { locale: fr });
            entry.shifts.push({
              date: dayName,
              type: 'leave',
              status: 'Congé validé',
            });
          }
        });
      }
    });

    // Add replacements
    weekData.replacements?.forEach((replacement: any) => {
      const employeeId = replacement.originalEmployeeId;
      if (employeeMap.has(employeeId)) {
        const entry = employeeMap.get(employeeId)!;
        const replacementDate = parseISO(replacement.date);
        const dayName = format(replacementDate, 'EEE d', { locale: fr });
        entry.shifts.push({
          date: dayName,
          type: 'swap',
          status: `Échange avec ${replacement.replacementEmployee?.firstName} ${replacement.replacementEmployee?.lastName}`,
          detail: replacement.status === 'PENDING' ? 'En attente validation' : '',
        });
      }
    });

    // Sort shifts by date
    employeeMap.forEach((entry) => {
      entry.shifts.sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    });

    return Array.from(employeeMap.values());
  }, [weekData, weekStart, weekEnd]);

  // Generate week days headers
  const weekDays = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map((day) => format(day, 'EEE d', { locale: fr }));
  }, [weekStart, weekEnd]);

  // Filter shift entries by search
  const filteredShiftEntries = useMemo(() => {
    if (!searchQuery) return shiftEntries;
    const query = searchQuery.toLowerCase();
    return shiftEntries.filter(
      (entry) =>
        entry.employeeName.toLowerCase().includes(query) ||
        entry.employeeInfo.toLowerCase().includes(query)
    );
  }, [shiftEntries, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredShiftEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedShiftEntries = filteredShiftEntries.slice(startIndex, endIndex);

  // Reset to first page when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allScheduleIds = new Set<string>();
      paginatedShiftEntries.forEach((entry) => {
        entry.shifts.forEach((shift) => {
          if (shift.scheduleId) {
            allScheduleIds.add(shift.scheduleId);
          }
        });
      });
      setSelectedSchedules(allScheduleIds);
      setSelectAll(true);
    } else {
      setSelectedSchedules(new Set());
      setSelectAll(false);
    }
  };

  // Handle individual schedule selection
  const handleToggleSchedule = (scheduleId: string) => {
    const newSelected = new Set(selectedSchedules);
    if (newSelected.has(scheduleId)) {
      newSelected.delete(scheduleId);
    } else {
      newSelected.add(scheduleId);
    }
    setSelectedSchedules(newSelected);
    
    // Update select all state
    const allScheduleIds = new Set<string>();
    paginatedShiftEntries.forEach((entry) => {
      entry.shifts.forEach((shift) => {
        if (shift.scheduleId) {
          allScheduleIds.add(shift.scheduleId);
        }
      });
    });
    setSelectAll(newSelected.size === allScheduleIds.size && allScheduleIds.size > 0);
  };

  // Handle delete single schedule
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce planning ?')) {
      await deleteScheduleMutation.mutateAsync(scheduleId);
      // Remove from selection if selected
      if (selectedSchedules.has(scheduleId)) {
        const newSelected = new Set(selectedSchedules);
        newSelected.delete(scheduleId);
        setSelectedSchedules(newSelected);
      }
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedSchedules.size === 0) {
      toast.error('Veuillez sélectionner au moins un planning à supprimer');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedSchedules.size} planning(s) ?`)) {
      await bulkDeleteSchedulesMutation.mutateAsync(Array.from(selectedSchedules));
      setSelectedSchedules(new Set());
      setSelectAll(false);
    }
  };

  const getShiftBadgeClass = (type: string) => {
    switch (type) {
      case 'matin':
        return 'bg-shift-matin text-white';
      case 'soir':
        return 'bg-shift-soir text-white';
      case 'nuit':
        return 'bg-shift-nuit text-white';
      case 'leave':
        return 'bg-warning text-white';
      case 'absent':
        return 'bg-danger text-white';
      case 'swap':
        return 'bg-info text-white';
      default:
        return 'bg-gray-200 text-text-secondary';
    }
  };

  const getReplacementStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">En attente manager</Badge>;
      case 'APPROVED':
        return <Badge variant="success">Validé RH</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Refusé manager</Badge>;
      default:
        return null;
    }
  };

  const handleCreateSchedule = async () => {
    if (!shiftFormData.employeeId || !shiftFormData.shiftId || !shiftFormData.dateDebut) {
      return;
    }

    // Validate date range if range mode
    if (scheduleType === 'range' && !shiftFormData.dateFin) {
      toast.error('Veuillez sélectionner une date de fin pour l\'intervalle');
      return;
    }

    if (scheduleType === 'range' && shiftFormData.dateFin < shiftFormData.dateDebut) {
      toast.error('La date de fin doit être supérieure ou égale à la date de début');
      return;
    }

    // Prepare data object, only include fields that have values
    const scheduleData: any = {
      employeeId: shiftFormData.employeeId,
      shiftId: shiftFormData.shiftId,
      dateDebut: shiftFormData.dateDebut,
    };

    // Add dateFin only if range mode
    if (scheduleType === 'range' && shiftFormData.dateFin) {
      scheduleData.dateFin = shiftFormData.dateFin;
    }

    // Only add optional fields if they have values
    if (shiftFormData.teamId && shiftFormData.teamId.trim() !== '') {
      scheduleData.teamId = shiftFormData.teamId;
    }
    if (shiftFormData.customStartTime && shiftFormData.customStartTime.trim() !== '') {
      scheduleData.customStartTime = shiftFormData.customStartTime;
    }
    if (shiftFormData.customEndTime && shiftFormData.customEndTime.trim() !== '') {
      scheduleData.customEndTime = shiftFormData.customEndTime;
    }
    if (shiftFormData.notes && shiftFormData.notes.trim() !== '') {
      scheduleData.notes = shiftFormData.notes;
    }

    try {
      await createScheduleMutation.mutateAsync(scheduleData);

      // Reset form only on success
      setShiftFormData({
        employeeId: '',
        shiftId: '',
        dateDebut: format(new Date(), 'yyyy-MM-dd'),
        dateFin: '',
        teamId: '',
        customStartTime: '',
        customEndTime: '',
        notes: '',
      });
      setScheduleType('single');
    } catch (error) {
      // Error is already handled by the mutation hook with toast
      // Ne pas logger en console pour éviter les messages en anglais
    }
  };

  const handleApproveReplacement = async (id: string) => {
    await approveReplacementMutation.mutateAsync(id);
  };

  const handleRejectReplacement = async (id: string) => {
    await rejectReplacementMutation.mutateAsync(id);
  };

  const handleCreateShift = async () => {
    if (!newShiftFormData.name || !newShiftFormData.code) {
      return;
    }

    try {
      await createShiftMutation.mutateAsync({
        name: newShiftFormData.name,
        code: newShiftFormData.code,
        startTime: newShiftFormData.startTime,
        endTime: newShiftFormData.endTime,
        breakDuration: newShiftFormData.breakDuration,
        isNightShift: newShiftFormData.isNightShift,
        color: newShiftFormData.color,
      });

      // Reset form and close modal
      setNewShiftFormData({
        name: '',
        code: '',
        startTime: '08:00',
        endTime: '16:00',
        breakDuration: 60,
        isNightShift: false,
        color: '#3B82F6',
      });
      setShowCreateShiftModal(false);
    } catch (error) {
      // Error is already handled by the mutation hook with toast
      // Ne pas logger en console pour éviter les messages en anglais
    }
  };

  return (
    <DashboardLayout
      title="Shifts & Planning"
      subtitle="Planifier les équipes, gérer les remplacements et les rotations"
    >
      <div className="space-y-6">
        {/* Alert Banner */}
        {filteredAlerts.length > 0 && (
          <AlertBanner
            alerts={filteredAlerts}
            onDismiss={(alertId) => {
              setDismissedAlerts((prev) => new Set([...prev, alertId]));
            }}
          />
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedSchedules.size > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleteSchedulesMutation.isPending}
                  className="text-danger hover:text-danger hover:bg-danger/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedSchedules.size})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSchedules(new Set());
                    setSelectAll(false);
                  }}
                >
                  Annuler sélection
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter planning
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importer plannings
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowCreateShiftModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un shift
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowShiftDetail(!showShiftDetail)}>
              <Plus className="h-4 w-4 mr-2" />
              {showShiftDetail ? 'Masquer' : 'Afficher'} formulaire planning
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-sm font-medium text-text-secondary">Filtrer</p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">Date :</label>
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                  className="w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-text-secondary">Équipe :</label>
                <Select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-40"
                >
                  <option value="">Toutes</option>
                  {teamsData?.data && Array.isArray(teamsData.data) ? (
                    teamsData.data.map((team: any) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))
                  ) : null}
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    type="text"
                    placeholder="Rechercher employé, équipe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Calendar section */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-h4 font-semibold text-text-primary">
                        Planning équipes
                      </h3>
                      <p className="text-small text-text-secondary">
                        Vue hebdomadaire des shifts et remplacements
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-primary">
                        Semaine du
                      </p>
                      <p className="text-sm text-text-secondary">
                        {format(weekStart, 'd MMM', { locale: fr })} au{' '}
                        {format(weekEnd, 'd MMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {/* View toggles */}
                  <div className="flex gap-2">
                    <Button
                      variant={calendarView === 'today' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('today')}
                    >
                      Aujourd'hui
                    </Button>
                    <Button
                      variant={calendarView === 'day' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('day')}
                    >
                      Jour
                    </Button>
                    <Button
                      variant={calendarView === 'week' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('week')}
                    >
                      Semaine
                    </Button>
                    <Button
                      variant={calendarView === 'month' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCalendarView('month')}
                    >
                      Mois
                    </Button>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-shift-matin"></div>
                      <span className="text-text-secondary">Shift matin</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-shift-soir"></div>
                      <span className="text-text-secondary">Shift soir</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-shift-nuit"></div>
                      <span className="text-text-secondary">Shift nuit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-warning"></div>
                      <span className="text-text-secondary">Congé / absence validée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger"></div>
                      <span className="text-text-secondary">Absence non planifiée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-info"></div>
                      <span className="text-text-secondary">Remplacement / swap</span>
                    </div>
                  </div>

                  {/* Calendar grid */}
                  {weekLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : weekError ? (
                    <Alert variant="danger" className="border-red-500 bg-red-50">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div className="flex-1">
                        <AlertDescription>
                          <p className="font-semibold text-red-800 mb-1">
                            {formatErrorAlert(weekError).title}
                          </p>
                          <p className="text-sm text-red-700">
                            {formatErrorAlert(weekError).description}
                          </p>
                          <p className="text-xs text-red-600 mt-2">
                            Veuillez rafraîchir la page ou réessayer plus tard.
                          </p>
                        </AlertDescription>
                      </div>
                    </Alert>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-table-header">
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary border w-12">
                              <button
                                onClick={() => handleSelectAll(!selectAll)}
                                className="flex items-center justify-center w-5 h-5"
                                title={selectAll ? 'Désélectionner tout' : 'Sélectionner tout'}
                              >
                                {selectAll ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-text-secondary" />
                                )}
                              </button>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary border">
                              Employé / Équipe
                            </th>
                            {weekDays.map((day) => (
                              <th
                                key={day}
                                className="px-4 py-3 text-center text-xs font-medium text-text-secondary border"
                              >
                                {day}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedShiftEntries.length === 0 ? (
                            <tr>
                              <td colSpan={weekDays.length + 2} className="px-4 py-8 text-center text-text-secondary">
                                Aucun planning trouvé pour cette période
                              </td>
                            </tr>
                          ) : (
                            paginatedShiftEntries.map((entry) => (
                              <tr key={entry.id} className="hover:bg-table-hover">
                                <td className="px-4 py-3 border">
                                  {/* Checkbox for row selection - only show if entry has schedules */}
                                  {entry.shifts.some((s) => s.scheduleId) && (
                                    <button
                                      onClick={() => {
                                        // Toggle all schedules for this employee
                                        const scheduleIds = entry.shifts
                                          .filter((s) => s.scheduleId)
                                          .map((s) => s.scheduleId!);
                                        const allSelected = scheduleIds.every((id) =>
                                          selectedSchedules.has(id)
                                        );
                                        if (allSelected) {
                                          scheduleIds.forEach((id) => {
                                            const newSelected = new Set(selectedSchedules);
                                            newSelected.delete(id);
                                            setSelectedSchedules(newSelected);
                                          });
                                        } else {
                                          const newSelected = new Set(selectedSchedules);
                                          scheduleIds.forEach((id) => newSelected.add(id));
                                          setSelectedSchedules(newSelected);
                                        }
                                      }}
                                      className="flex items-center justify-center w-5 h-5"
                                    >
                                      {entry.shifts
                                        .filter((s) => s.scheduleId)
                                        .every((s) => selectedSchedules.has(s.scheduleId!)) &&
                                      entry.shifts.some((s) => s.scheduleId) ? (
                                        <CheckSquare className="h-4 w-4 text-primary" />
                                      ) : (
                                        <Square className="h-4 w-4 text-text-secondary" />
                                      )}
                                    </button>
                                  )}
                                </td>
                                <td className="px-4 py-3 border">
                                  <div>
                                    <p className="font-semibold text-sm text-text-primary">
                                      {entry.employeeName}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                      {entry.employeeInfo}
                                    </p>
                                  </div>
                                </td>
                                {weekDays.map((dayName) => {
                                  const shift = entry.shifts.find((s) => s.date === dayName);
                                  return (
                                    <td key={dayName} className="px-2 py-3 border text-center relative group">
                                      {shift ? (
                                        shift.startTime && shift.endTime ? (
                                          <div className="relative">
                                            <div
                                              className={`inline-flex flex-col items-center justify-center rounded-full px-3 py-2 ${getShiftBadgeClass(
                                                shift.type
                                              )}`}
                                            >
                                              <span className="text-xs font-semibold">
                                                {shift.startTime}
                                              </span>
                                              <span className="text-xs capitalize">{shift.type}</span>
                                              <span className="text-xs">-</span>
                                              <span className="text-xs">{shift.endTime}</span>
                                            </div>
                                            {shift.scheduleId && (
                                              <button
                                                onClick={() => handleDeleteSchedule(shift.scheduleId!)}
                                                className="absolute -top-1 -right-1 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger/80"
                                                title="Supprimer ce planning"
                                                disabled={deleteScheduleMutation.isPending}
                                              >
                                                <X className="h-3 w-3" />
                                              </button>
                                            )}
                                          </div>
                                        ) : shift.status ? (
                                          <div>
                                            <div
                                              className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold ${getShiftBadgeClass(
                                                shift.type
                                              )}`}
                                            >
                                              {shift.status}
                                            </div>
                                            {shift.detail && (
                                              <p className="text-xs text-text-secondary mt-1">
                                                {shift.detail}
                                              </p>
                                            )}
                                          </div>
                                        ) : null
                                      ) : null}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {filteredShiftEntries.length > 0 && (
                    <div className="mt-4 flex items-center justify-between border-t border-table-border pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-secondary">
                          Affichage de {startIndex + 1} à {Math.min(endIndex, filteredShiftEntries.length)} sur {filteredShiftEntries.length} employé(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 mr-4">
                          <label className="text-sm text-text-secondary">Lignes par page:</label>
                          <select
                            value={itemsPerPage}
                            onChange={(e) => {
                              setItemsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="border border-border rounded px-2 py-1 text-sm"
                          >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                          </select>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className="min-w-[2.5rem]"
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Replacements section */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-h4 font-semibold text-text-primary">
                        Remplacements & swaps
                      </h3>
                      <p className="text-small text-text-secondary">
                        Suivi des échanges de shifts et validations
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={replacementTab === 'pending' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setReplacementTab('pending')}
                      >
                        En attente
                      </Button>
                      <Button
                        variant={replacementTab === 'history' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setReplacementTab('history')}
                      >
                        Historique
                      </Button>
                    </div>
                  </div>

                  {/* Replacements list */}
                  {replacementsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {!replacementsData || replacementsData.length === 0 ? (
                        <p className="text-center text-text-secondary py-8">
                          Aucun remplacement trouvé
                        </p>
                      ) : (
                        replacementsData.map((replacement: any) => (
                          <div key={replacement.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-text-primary">
                                    {replacement.originalEmployee?.firstName}{' '}
                                    {replacement.originalEmployee?.lastName}{' '}
                                    <ArrowRight className="inline h-4 w-4" />{' '}
                                    {replacement.replacementEmployee?.firstName}{' '}
                                    {replacement.replacementEmployee?.lastName}
                                  </p>
                                  {getReplacementStatusBadge(replacement.status)}
                                </div>
                                <p className="text-sm text-text-secondary">
                                  Swap du {format(parseISO(replacement.date), 'EEEE d MMMM', { locale: fr })}
                                  {replacement.shift && ` - ${replacement.shift.name}`} -{' '}
                                  {replacement.reason || 'Aucune raison spécifiée'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {replacement.status === 'PENDING' && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectReplacement(replacement.id)}
                                      disabled={rejectReplacementMutation.isPending}
                                    >
                                      Rejeter
                                    </Button>
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleApproveReplacement(replacement.id)}
                                      disabled={approveReplacementMutation.isPending}
                                    >
                                      Valider
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shift detail panel - Moved to bottom */}
          {showShiftDetail && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-h4 font-semibold text-text-primary">
                        Créer un planning
                      </h3>
                      <p className="text-small text-text-secondary">
                        Assigner un shift à un employé pour une date spécifique
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShiftDetail(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                    {/* Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="employeeId">Employé *</Label>
                        <Select
                          value={shiftFormData.employeeId}
                          onChange={(e) =>
                            setShiftFormData({ ...shiftFormData, employeeId: e.target.value })
                          }
                          disabled={employeesLoading}
                        >
                          <option value="">Sélectionner un employé</option>
                          {employeesLoading ? (
                            <option value="" disabled>Chargement...</option>
                          ) : employeesError ? (
                            <option value="" disabled>Erreur de chargement</option>
                          ) : Array.isArray(employeesData) && employeesData.length > 0 ? (
                            employeesData.map((employee: any) => (
                              <option key={employee.id} value={employee.id}>
                                {employee.firstName} {employee.lastName} ({employee.matricule})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>Aucun employé disponible</option>
                          )}
                        </Select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="shiftId">Shift *</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCreateShiftModal(true)}
                            className="text-xs h-6"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Créer un shift
                          </Button>
                        </div>
                        <Select
                          value={shiftFormData.shiftId}
                          onChange={(e) =>
                            setShiftFormData({ ...shiftFormData, shiftId: e.target.value })
                          }
                          disabled={shiftsLoading}
                        >
                          <option value="">Sélectionner un shift</option>
                          {shiftsLoading ? (
                            <option value="" disabled>Chargement...</option>
                          ) : shiftsData?.data && Array.isArray(shiftsData.data) && shiftsData.data.length > 0 ? (
                            shiftsData.data.map((shift: any) => (
                              <option key={shift.id} value={shift.id}>
                                {shift.name} ({shift.startTime} - {shift.endTime})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              {shiftsData ? 'Aucun shift disponible' : 'Chargement...'}
                            </option>
                          )}
                        </Select>
                      </div>

                      {/* Type de création */}
                      <div>
                        <Label>Type de création</Label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="scheduleType"
                              value="single"
                              checked={scheduleType === 'single'}
                              onChange={(e) => {
                                setScheduleType('single');
                                setShiftFormData({ ...shiftFormData, dateFin: '' });
                              }}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Une journée</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="scheduleType"
                              value="range"
                              checked={scheduleType === 'range'}
                              onChange={(e) => setScheduleType('range')}
                              className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Intervalle de dates</span>
                          </label>
                        </div>
                      </div>

                      {/* Date(s) */}
                      <div className={scheduleType === 'range' ? 'grid grid-cols-2 gap-4' : ''}>
                        <div>
                          <Label htmlFor="dateDebut">
                            {scheduleType === 'range' ? 'Date de début *' : 'Date *'}
                          </Label>
                          <Input
                            id="dateDebut"
                            type="date"
                            value={shiftFormData.dateDebut}
                            onChange={(e) =>
                              setShiftFormData({ ...shiftFormData, dateDebut: e.target.value })
                            }
                          />
                        </div>
                        {scheduleType === 'range' && (
                          <div>
                            <Label htmlFor="dateFin">Date de fin *</Label>
                            <Input
                              id="dateFin"
                              type="date"
                              value={shiftFormData.dateFin}
                              min={shiftFormData.dateDebut}
                              onChange={(e) =>
                                setShiftFormData({ ...shiftFormData, dateFin: e.target.value })
                              }
                            />
                            {shiftFormData.dateDebut && shiftFormData.dateFin && (
                              <p className="text-xs text-text-secondary mt-1">
                                {Math.ceil(
                                  (new Date(shiftFormData.dateFin).getTime() -
                                    new Date(shiftFormData.dateDebut).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ) + 1}{' '}
                                jour(s) seront créés
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customStartTime">
                            Heure début personnalisée (optionnel)
                          </Label>
                          <Input
                            id="customStartTime"
                            type="time"
                            value={shiftFormData.customStartTime}
                            onChange={(e) =>
                              setShiftFormData({ ...shiftFormData, customStartTime: e.target.value })
                            }
                          />
                          <p className="text-xs text-text-secondary mt-1">
                            Override l'heure du shift standard
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="customEndTime">
                            Heure fin personnalisée (optionnel)
                          </Label>
                          <Input
                            id="customEndTime"
                            type="time"
                            value={shiftFormData.customEndTime}
                            onChange={(e) =>
                              setShiftFormData({ ...shiftFormData, customEndTime: e.target.value })
                            }
                          />
                          <p className="text-xs text-text-secondary mt-1">
                            Override l'heure du shift standard
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="teamId">Équipe (optionnel)</Label>
                        <Select
                          value={shiftFormData.teamId}
                          onChange={(e) =>
                            setShiftFormData({ ...shiftFormData, teamId: e.target.value })
                          }
                          disabled={teamsLoading}
                        >
                          <option value="">Aucune équipe</option>
                          {teamsLoading ? (
                            <option value="" disabled>Chargement...</option>
                          ) : teamsData?.data && Array.isArray(teamsData.data) && teamsData.data.length > 0 ? (
                            teamsData.data.map((team: any) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              {teamsData ? 'Aucune équipe disponible' : 'Chargement...'}
                            </option>
                          )}
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="notes">Notes (optionnel)</Label>
                        <Input
                          id="notes"
                          value={shiftFormData.notes}
                          onChange={(e) =>
                            setShiftFormData({ ...shiftFormData, notes: e.target.value })
                          }
                          placeholder="Notes supplémentaires"
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowShiftDetail(false)}
                        >
                          Annuler
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-1"
                          onClick={handleCreateSchedule}
                          disabled={
                            createScheduleMutation.isPending ||
                            !shiftFormData.employeeId ||
                            !shiftFormData.shiftId ||
                            !shiftFormData.dateDebut ||
                            (scheduleType === 'range' && !shiftFormData.dateFin)
                          }
                        >
                          {createScheduleMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Enregistrer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Create Shift Modal */}
          {showCreateShiftModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Créer un nouveau shift</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowCreateShiftModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shiftName">Nom du shift *</Label>
                    <Input
                      id="shiftName"
                      value={newShiftFormData.name}
                      onChange={(e) =>
                        setNewShiftFormData({ ...newShiftFormData, name: e.target.value })
                      }
                      placeholder="Ex: Matin, Soir, Nuit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="shiftCode">Code du shift *</Label>
                    <Input
                      id="shiftCode"
                      value={newShiftFormData.code}
                      onChange={(e) =>
                        setNewShiftFormData({ ...newShiftFormData, code: e.target.value.toUpperCase() })
                      }
                      placeholder="Ex: M, S, N"
                      maxLength={5}
                    />
                    <p className="text-xs text-text-secondary mt-1">
                      Code court (ex: M pour Matin, S pour Soir)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shiftStartTime">Heure début *</Label>
                      <Input
                        id="shiftStartTime"
                        type="time"
                        value={newShiftFormData.startTime}
                        onChange={(e) =>
                          setNewShiftFormData({ ...newShiftFormData, startTime: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="shiftEndTime">Heure fin *</Label>
                      <Input
                        id="shiftEndTime"
                        type="time"
                        value={newShiftFormData.endTime}
                        onChange={(e) =>
                          setNewShiftFormData({ ...newShiftFormData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="breakDuration">Durée pause (minutes)</Label>
                    <Input
                      id="breakDuration"
                      type="number"
                      min="0"
                      value={newShiftFormData.breakDuration}
                      onChange={(e) =>
                        setNewShiftFormData({
                          ...newShiftFormData,
                          breakDuration: parseInt(e.target.value) || 60,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="isNightShift"
                      type="checkbox"
                      checked={newShiftFormData.isNightShift}
                      onChange={(e) =>
                        setNewShiftFormData({
                          ...newShiftFormData,
                          isNightShift: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <Label htmlFor="isNightShift" className="cursor-pointer font-normal">
                      Shift de nuit
                    </Label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCreateShiftModal(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleCreateShift}
                      disabled={
                        createShiftMutation.isPending ||
                        !newShiftFormData.name ||
                        !newShiftFormData.code
                      }
                    >
                      {createShiftMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Créer le shift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Import Schedules Modal */}
          {showImportModal && (
            <ImportSchedulesModal
              onClose={() => setShowImportModal(false)}
              onSuccess={() => {
                setShowImportModal(false);
                // Schedules will be refreshed automatically by React Query
              }}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
