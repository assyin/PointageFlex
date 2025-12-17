'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface DepartmentsFilters {
  search?: string;
  hasManager?: boolean;
  minEmployees?: number;
  maxEmployees?: number;
}

interface DepartmentsAdvancedFiltersProps {
  filters: DepartmentsFilters;
  onFiltersChange: (filters: DepartmentsFilters) => void;
  onReset: () => void;
  employees: any[];
  isOpen: boolean;
  onToggle: () => void;
}

export function DepartmentsAdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  employees,
  isOpen,
  onToggle,
}: DepartmentsAdvancedFiltersProps) {
  const hasActiveFilters = 
    !!filters.search ||
    filters.hasManager !== undefined ||
    filters.minEmployees !== undefined ||
    filters.maxEmployees !== undefined;

  const handleFilterChange = (key: keyof DepartmentsFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
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
                filters.hasManager !== undefined && '1',
                filters.minEmployees !== undefined && '1',
                filters.maxEmployees !== undefined && '1',
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
                  placeholder="Nom, code..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Manager assigné */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Manager de Direction
                </label>
                <Select
                  value={
                    filters.hasManager === undefined
                      ? ''
                      : filters.hasManager === true
                      ? 'yes'
                      : 'no'
                  }
                  onValueChange={(value) => {
                    if (value === '') {
                      handleFilterChange('hasManager', '');
                    } else {
                      handleFilterChange('hasManager', value === 'yes');
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {filters.hasManager === undefined
                        ? 'Tous'
                        : filters.hasManager === true
                        ? 'Avec manager'
                        : 'Sans manager'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    <SelectItem value="yes">Avec manager</SelectItem>
                    <SelectItem value="no">Sans manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre minimum d'employés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employés (min)
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={filters.minEmployees || ''}
                  onChange={(e) => handleFilterChange('minEmployees', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full"
                />
              </div>

              {/* Nombre maximum d'employés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employés (max)
                </label>
                <Input
                  type="number"
                  placeholder="∞"
                  min="0"
                  value={filters.maxEmployees || ''}
                  onChange={(e) => handleFilterChange('maxEmployees', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

