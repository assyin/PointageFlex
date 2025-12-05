'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="h-header bg-background-card border-b border-border-light px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Titre de la page */}
      <div>
        <h1 className="text-h2 font-bold text-text-primary">{title}</h1>
        {subtitle && <p className="text-small text-text-secondary mt-1">{subtitle}</p>}
      </div>

      {/* Actions & Profil */}
      <div className="flex items-center gap-4">
        {/* Bouton Alertes */}
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Alertes de pointage
        </Button>

        {/* Profil utilisateur */}
        <div className="flex items-center gap-3 pl-4 border-l border-border-light">
          <div className="text-right">
            <p className="text-sm font-semibold text-text-primary">Rania Admin</p>
            <p className="text-xs text-text-secondary">Admin RH</p>
          </div>
          <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center text-white font-semibold">
            RA
          </div>
        </div>
      </div>
    </header>
  );
}
