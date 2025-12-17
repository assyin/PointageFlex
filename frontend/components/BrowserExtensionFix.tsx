'use client';

import { useEffect } from 'react';

/**
 * Composant pour supprimer les attributs injectés par les extensions de navigateur
 * qui causent des warnings de hydration dans Next.js
 */
export function BrowserExtensionFix() {
  useEffect(() => {
    // Supprimer l'attribut bis_skin_checked injecté par les extensions (Bitwarden, etc.)
    const removeExtensionAttributes = () => {
      const elements = document.querySelectorAll('[bis_skin_checked]');
      elements.forEach((element) => {
        element.removeAttribute('bis_skin_checked');
      });
    };

    // Exécuter immédiatement
    removeExtensionAttributes();

    // Observer les changements du DOM pour nettoyer les nouveaux éléments
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
          const target = mutation.target as Element;
          target.removeAttribute('bis_skin_checked');
        }
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as Element;
              if (element.hasAttribute('bis_skin_checked')) {
                element.removeAttribute('bis_skin_checked');
              }
              // Vérifier les enfants
              element.querySelectorAll('[bis_skin_checked]').forEach((child) => {
                child.removeAttribute('bis_skin_checked');
              });
            }
          });
        }
      });
    });

    // Observer tout le document
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['bis_skin_checked'],
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
