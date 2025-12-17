'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

export interface PositionsFilters {
  search?: string;
  category?: string;
  minEmployees?: number;
  maxEmployees?: number;
}

interface PositionsAdvancedFiltersProps {
  filters: PositionsFilters;
  onFiltersChange: (filters: PositionsFilters) => void;
  onReset: () => void;
  categories: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export function PositionsAdvancedFilters({
  filters,
  onFiltersChange,
  onReset,
  categories,
  isOpen,
  onToggle,
}: PositionsAdvancedFiltersProps) {
  const hasActiveFilters = 
    !!filters.search ||
    !!filters.category ||
    filters.minEmployees !== undefined ||
    filters.maxEmployees !== undefined;

  const handleFilterChange = (key: keyof PositionsFilters, value: any) => {
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
                filters.category && '1',
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
                  placeholder="Nom, code, catégorie..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Catégorie
                </label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="w-full">
                    <span className="truncate">
                      {filters.category || 'Toutes les catégories'}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
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

