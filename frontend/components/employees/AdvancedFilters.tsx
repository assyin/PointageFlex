'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { EmployeeFilters } from '@/lib/api/employees';

interface AdvancedFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  onReset: () => void;
  sites: any[];
  departments: any[];
  isOpen: boolean;
  onToggle: () => void;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  sites,
  departments,
  isOpen,
  onToggle,
}: AdvancedFiltersProps) {
  const hasActiveFilters = 
    !!filters.search ||
    !!filters.siteId ||
    !!filters.departmentId ||
    filters.isActive !== undefined;

  const handleFilterChange = (key: keyof EmployeeFilters, value: string) => {
    const newFilters = { ...filters };
    
    if (key === 'isActive') {
      if (value === '' || value === undefined) {
        delete newFilters.isActive;
      } else {
        newFilters.isActive = value === 'true';
      }
    } else {
      newFilters[key] = (value || undefined) as any;
    }
    
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtres avancés
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
              {[
                filters.search && '1',
                filters.siteId && '1',
                filters.departmentId && '1',
                filters.isActive !== undefined && '1',
              ].filter(Boolean).length}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Recherche
                </label>
                <Input
                  type="text"
                  placeholder="Nom, email, matricule..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Site */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Site
                </label>
                <Select
                  value={filters.siteId || ''}
                  onValueChange={(value) => handleFilterChange('siteId', value)}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {filters.siteId
                        ? sites.find((s) => s.id === filters.siteId)?.name || 'Sélectionner'
                        : 'Tous les sites'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les sites</SelectItem>
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id}>
                        {site.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Département */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Département
                </label>
                <Select
                  value={filters.departmentId || ''}
                  onValueChange={(value) => handleFilterChange('departmentId', value)}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {filters.departmentId
                        ? departments.find((d) => d.id === filters.departmentId)?.name || 'Sélectionner'
                        : 'Tous les départements'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les départements</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Statut
                </label>
                <Select
                  value={
                    filters.isActive === undefined
                      ? ''
                      : filters.isActive === true
                      ? 'active'
                      : 'inactive'
                  }
                  onValueChange={(value) => {
                    if (value === '') {
                      handleFilterChange('isActive', '');
                    } else {
                      handleFilterChange('isActive', value === 'active' ? 'true' : 'false');
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {filters.isActive === undefined
                        ? 'Tous les statuts'
                        : filters.isActive === true
                        ? 'Actif'
                        : 'Inactif'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

