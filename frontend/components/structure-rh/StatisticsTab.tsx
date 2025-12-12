'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useDepartmentStats,
} from '@/lib/hooks/useDepartments';
import {
  usePositionStats,
} from '@/lib/hooks/usePositions';
import { Building2, Briefcase, Users, AlertCircle, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function StatisticsTab() {
  const { data: departmentStats, isLoading: loadingDeptStats } = useDepartmentStats();
  const { data: positionStats, isLoading: loadingPosStats } = usePositionStats();

  const isLoading = loadingDeptStats || loadingPosStats;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-sm p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600"></div>
            <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-100 rounded-lg">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Vue d'ensemble de la structure organisationnelle
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Départements</p>
            <p className="text-3xl font-bold text-gray-900">{departmentStats?.totalDepartments || 0}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl shadow-sm">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Fonctions</p>
            <p className="text-3xl font-bold text-gray-900">{positionStats?.totalPositions || 0}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Employés</p>
            <p className="text-3xl font-bold text-gray-900">{departmentStats?.totalEmployees || 0}</p>
          </div>
        </Card>

        <Card className="border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500 rounded-xl shadow-sm">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Sans fonction</p>
            <p className="text-3xl font-bold text-gray-900">
              {positionStats?.employeesWithoutPosition || 0}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Departments Distribution */}
        <Card className="border border-gray-200 shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Distribution par Département</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Département</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Employés</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentStats?.departments && departmentStats.departments.length > 0 ? (
                    departmentStats.departments.map((dept) => (
                      <TableRow key={dept.id} className="hover:bg-blue-50/30 transition-colors">
                        <TableCell className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{dept.name}</span>
                            {dept.code && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                {dept.code}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900 py-3">
                          {dept.employeeCount}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="default" className="border-gray-300 text-gray-700">
                            {dept.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        Aucun département
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        {/* Positions Distribution */}
        <Card className="border border-gray-200 shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Distribution par Fonction</h3>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Fonction</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Employés</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positionStats?.positions && positionStats.positions.length > 0 ? (
                    positionStats.positions.slice(0, 10).map((pos) => (
                      <TableRow key={pos.id} className="hover:bg-purple-50/30 transition-colors">
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-semibold text-gray-900">{pos.name}</span>
                            {pos.category && (
                              <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs w-fit">
                                {pos.category}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-900 py-3">
                          {pos.employeeCount}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <Badge variant="default" className="border-gray-300 text-gray-700">
                            {pos.percentage}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                        Aucune fonction
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {positionStats && positionStats.positions && positionStats.positions.length > 10 && (
              <p className="text-sm text-gray-500 mt-4 text-center pt-4 border-t border-gray-200">
                Affichage des 10 fonctions les plus utilisées sur {positionStats.positions.length}
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Categories Breakdown */}
      {positionStats?.categories && positionStats.categories.length > 0 && (
        <Card className="border border-gray-200 shadow-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Répartition par Catégorie de Fonction
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {positionStats.categories.map((cat) => (
                <Card
                  key={cat.category}
                  className="p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-gray-900 mb-1">{cat.category}</p>
                      <p className="text-sm text-gray-600">
                        {cat.count} fonction{cat.count > 1 ? 's' : ''}
                      </p>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-base px-3 py-1">
                      {cat.employeeCount}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Alerts */}
      {(departmentStats?.employeesWithoutDepartment || 0) > 0 ||
        (positionStats?.employeesWithoutPosition || 0) > 0 ? (
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-orange-100/30 shadow-md">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-orange-500 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-700 text-lg mb-3">Attention requise</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  {departmentStats && departmentStats.employeesWithoutDepartment > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">
                        {departmentStats.employeesWithoutDepartment}
                      </span>
                      <span>employé{departmentStats.employeesWithoutDepartment > 1 ? 's' : ''} n'{departmentStats.employeesWithoutDepartment > 1 ? 'ont' : 'a'} pas de département assigné</span>
                    </p>
                  )}
                  {positionStats && positionStats.employeesWithoutPosition > 0 && (
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-orange-600">
                        {positionStats.employeesWithoutPosition}
                      </span>
                      <span>employé{positionStats.employeesWithoutPosition > 1 ? 's' : ''} n'{positionStats.employeesWithoutPosition > 1 ? 'ont' : 'a'} pas de fonction assignée</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
