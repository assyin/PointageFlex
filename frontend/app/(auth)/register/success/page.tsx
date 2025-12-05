'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="inline-flex w-16 h-16 bg-primary rounded-xl items-center justify-center">
          <span className="text-white font-bold text-2xl">PF</span>
        </div>

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Title and message */}
        <div className="space-y-4">
          <h1 className="text-h2 font-bold text-text-primary">
            Félicitations ! Votre espace a été créé
          </h1>
          <p className="text-body text-text-secondary max-w-xl mx-auto">
            Votre organisation est maintenant configurée et prête à l'emploi. Un email de bienvenue vous a été envoyé avec un lien de vérification.
          </p>
        </div>

        {/* Next steps card */}
        <div className="bg-white rounded-card p-8 shadow-card space-y-6">
          <h2 className="text-h4 font-semibold text-text-primary">Prochaines étapes</h2>

          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">
                  Vérifiez votre email
                </h3>
                <p className="text-sm text-text-secondary">
                  Un email de vérification a été envoyé à votre adresse. Cliquez sur le lien pour activer votre compte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">
                  Connectez-vous à votre espace
                </h3>
                <p className="text-sm text-text-secondary">
                  Accédez à votre tableau de bord pour commencer à configurer vos employés, équipes et terminaux.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary mb-1">
                  Configurez vos paramètres
                </h3>
                <p className="text-sm text-text-secondary">
                  Ajoutez vos sites, départements, shifts et configurez vos terminaux de pointage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Email reminder */}
        <div className="bg-info/10 border-l-4 border-info rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-info flex-shrink-0 mt-1" />
            <div className="text-left">
              <h3 className="font-semibold text-text-primary mb-1">
                Vous n'avez pas reçu l'email ?
              </h3>
              <p className="text-sm text-text-secondary">
                Vérifiez votre dossier spam ou courrier indésirable. Si vous ne trouvez toujours pas l'email, vous pourrez demander un nouvel envoi depuis la page de connexion.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="gap-2">
              Accéder à la connexion
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Support link */}
        <p className="text-sm text-text-secondary">
          Besoin d'aide ?{' '}
          <Link href="/support" className="text-primary hover:underline">
            Contactez notre support
          </Link>
        </p>
      </div>
    </div>
  );
}
