'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean; // Si true, nécessite toutes les permissions. Si false, nécessite au moins une.
  fallback?: ReactNode;
  showFallback?: boolean; // Si true, affiche le fallback. Si false, ne rend rien.
}

/**
 * Composant pour conditionner l'affichage d'éléments UI selon les permissions
 * 
 * @example
 * // Afficher seulement si l'utilisateur a la permission 'employee.create'
 * <PermissionGate permission="employee.create">
 *   <Button>Créer un employé</Button>
 * </PermissionGate>
 * 
 * @example
 * // Afficher si l'utilisateur a au moins une des permissions
 * <PermissionGate permissions={['employee.create', 'employee.update']}>
 *   <Button>Modifier</Button>
 * </PermissionGate>
 * 
 * @example
 * // Afficher si l'utilisateur a toutes les permissions
 * <PermissionGate permissions={['employee.view', 'employee.update']} requireAll>
 *   <Button>Modifier</Button>
 * </PermissionGate>
 * 
 * @example
 * // Afficher un message si l'utilisateur n'a pas la permission
 * <PermissionGate 
 *   permission="employee.delete" 
 *   fallback={<span className="text-gray-400">Accès refusé</span>}
 *   showFallback
 * >
 *   <Button>Supprimer</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  showFallback = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(permissions);
    } else {
      hasAccess = hasAnyPermission(permissions);
    }
  } else {
    // Si aucune permission n'est spécifiée, afficher par défaut
    hasAccess = true;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (showFallback && fallback !== null) {
    return <>{fallback}</>;
  }

  return null;
}

