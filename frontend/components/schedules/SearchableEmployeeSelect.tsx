'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  matricule: string;
  isActive?: boolean;
}

interface SearchableEmployeeSelectProps {
  value: string;
  onChange: (value: string) => void;
  employees: Employee[];
  isLoading?: boolean;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  excludeEmployeeId?: string;
}

export function SearchableEmployeeSelect({
  value,
  onChange,
  employees,
  isLoading = false,
  placeholder = 'Rechercher un employé...',
  label,
  required = false,
  error,
  excludeEmployeeId,
}: SearchableEmployeeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les employés selon la recherche (nom, prénom ou matricule)
  const filteredEmployees = useMemo(() => {
    // Filtrer d'abord les employés actifs et exclure l'employé spécifié
    const activeEmployees = employees.filter((emp) =>
      emp.isActive !== false && emp.id !== excludeEmployeeId
    );

    if (!searchQuery.trim()) {
      return activeEmployees;
    }

    const query = searchQuery.toLowerCase().trim();
    return activeEmployees.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().trim();
      const matricule = (emp.matricule || '').toLowerCase();
      const firstName = (emp.firstName || '').toLowerCase();
      const lastName = (emp.lastName || '').toLowerCase();

      return (
        fullName.includes(query) ||
        matricule.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query)
      );
    });
  }, [employees, searchQuery, excludeEmployeeId]);

  // Trouver l'employé sélectionné
  const selectedEmployee = useMemo(() => {
    return employees.find((emp) => emp.id === value);
  }, [employees, value]);

  const handleSelect = (employeeId: string) => {
    onChange(employeeId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor="employee-select">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </Label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm',
            'bg-white text-text-primary',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
            error ? 'border-danger' : 'border-input-border',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200'
          )}
          disabled={isLoading}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedEmployee ? (
              <span className="truncate">
                {selectedEmployee.firstName} {selectedEmployee.lastName} ({selectedEmployee.matricule})
              </span>
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {value && (
              <div
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClear(e as any);
                  }
                }}
                className="p-1 hover:bg-gray-100 rounded cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                aria-label="Effacer la sélection"
              >
                <X className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
              aria-hidden="true"
            />

            {/* Dropdown */}
            <div className="absolute z-50 mt-1 w-full rounded-md border border-input-border bg-white shadow-lg">
              {/* Search input */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher par nom ou matricule..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Employees list */}
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Chargement...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {searchQuery ? 'Aucun employé trouvé' : 'Aucun employé disponible'}
                  </div>
                ) : (
                  filteredEmployees.map((employee) => {
                    const isSelected = employee.id === value;
                    return (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => handleSelect(employee.id)}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors',
                          'flex items-center gap-2',
                          isSelected && 'bg-primary/10 text-primary font-medium'
                        )}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            Matricule: {employee.matricule}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
}

