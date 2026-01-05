'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <DashboardLayout title="Accès refusé" subtitle="Vous n'avez pas les permissions nécessaires">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">
            Accès refusé
          </h1>
          
          <p className="text-body text-text-secondary mb-8">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-transparent border-2 border-primary text-primary rounded-lg font-semibold transition-all hover:bg-primary hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Link>
            <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg font-semibold transition-all hover:bg-primary-hover">
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

