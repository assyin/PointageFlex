'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      // Appeler l'API logout
      await authApi.logout();
      toast.success('Déconnexion réussie');
    } catch (error) {
      console.error('Logout error:', error);
      // Continuer même si l'API échoue
    } finally {
      // Nettoyer la session locale
      localStorage.clear();
      setUser(null);
      // Vider tout le cache React Query
      queryClient.clear();
      // Rediriger vers la page de login
      router.push('/login');
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    const firstInitial = firstName?.[0] || '';
    const lastInitial = lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  /**
   * Convertit un rôle en label français lisible
   */
  const getRoleLabel = (): string => {
    if (!user) return 'Utilisateur';
    
    // Priorité aux rôles RBAC (roles array)
    const roles = user.roles || [];
    
    // Vérifier les rôles RBAC d'abord
    if (roles.includes('SUPER_ADMIN') || user.role === 'SUPER_ADMIN') {
      return 'Super Administrateur';
    }
    if (roles.includes('ADMIN_RH') || user.role === 'ADMIN_RH') {
      return 'Administrateur RH';
    }
    if (roles.includes('MANAGER') || user.role === 'MANAGER') {
      return 'Manager';
    }
    if (roles.includes('EMPLOYEE') || user.role === 'EMPLOYEE') {
      return 'Employé';
    }
    
    // Si aucun rôle trouvé, utiliser le role legacy avec mapping
    if (user.role) {
      const roleMap: { [key: string]: string } = {
        'SUPER_ADMIN': 'Super Administrateur',
        'ADMIN_RH': 'Administrateur RH',
        'MANAGER': 'Manager',
        'EMPLOYEE': 'Employé',
      };
      return roleMap[user.role] || user.role;
    }
    
    return 'Utilisateur';
  };

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

        {/* Profil utilisateur avec dropdown */}
        <div className="pl-4 border-l border-border-light">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none">
                <div className="text-right">
                  <p className="text-sm font-semibold text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {getRoleLabel()}
                  </p>
                </div>
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-border-light"
                  />
                ) : (
                  <div className="w-10 h-10 bg-info rounded-full flex items-center justify-center text-white font-semibold">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-danger hover:text-danger hover:bg-danger/10 focus:text-danger focus:bg-danger/10">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
