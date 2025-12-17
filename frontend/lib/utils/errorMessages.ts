/**
 * Utilitaires pour la gestion des messages d'erreur en français
 */

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
      statusCode?: number;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Vérifie si un message contient de l'anglais
 */
function containsEnglish(text: string): boolean {
  const englishKeywords = [
    'error', 'failed', 'invalid', 'unauthorized', 'forbidden', 'not found',
    'bad request', 'internal server', 'validation', 'user not found',
    'invalid credentials', 'token expired', 'already exists', 'request',
    'server', 'access denied', 'permission', 'authentication', 'authorization'
  ];
  const lowerText = text.toLowerCase();
  return englishKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Traduit les messages d'erreur de l'API en français
 */
export function translateErrorMessage(error: ApiError | any): string {
  // Si c'est une chaîne, vérifier si elle contient de l'anglais
  if (typeof error === 'string') {
    if (containsEnglish(error)) {
      // Essayer de traduire
      return translateText(error);
    }
    return error;
  }

  // Récupérer le message d'erreur de l'API
  const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
  const statusCode = error?.response?.status || error?.response?.data?.statusCode;
  
  // Vérifier s'il y a des erreurs de validation dans le tableau errors
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const validationErrors = error.response.data.errors
      .map((err: string) => extractFrenchOnly(err))
      .filter((err: string) => err.length > 0);
    if (validationErrors.length > 0) {
      return validationErrors.join('. ');
    }
  }

  // Messages d'erreur HTTP standards - TOUJOURS retourner en français
  if (statusCode) {
    switch (statusCode) {
      case 400:
        return translateText(apiMessage) || 'Requête invalide. Veuillez vérifier les données saisies.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires pour effectuer cette action.';
      case 404:
        return 'Ressource introuvable.';
      case 409:
        return translateText(apiMessage) || 'Conflit : cette ressource existe déjà.';
      case 422:
        return translateText(apiMessage) || 'Données invalides. Veuillez vérifier les champs du formulaire.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard ou contacter le support.';
      case 503:
        return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      default:
        break;
    }
  }

  // Messages d'erreur spécifiques de l'API
  if (apiMessage) {
    // Toujours traduire si le message contient de l'anglais
    if (containsEnglish(apiMessage)) {
      return translateText(apiMessage);
    }
    // Si le message est déjà en français, le retourner tel quel
    return apiMessage;
  }

  // Message d'erreur par défaut
  return 'Une erreur est survenue. Veuillez réessayer.';
}

/**
 * Extrait uniquement la partie française d'un message mixte
 */
function extractFrenchOnly(text: string): string {
  // Si le message contient des parties en français et en anglais séparées
  // (par exemple: "Erreur: Error message" ou "Error: Message d'erreur")
  const parts = text.split(/[:;,\n]/).map(p => p.trim()).filter(p => p);
  
  // Chercher les parties en français (contiennent des caractères accentués ou mots français courants)
  const frenchKeywords = ['erreur', 'échec', 'invalide', 'session', 'expirée', 'reconnecter', 
    'vérifier', 'données', 'saisies', 'ressource', 'introuvable', 'accès', 'refusé', 
    'permissions', 'serveur', 'réessayer', 'support', 'conflit', 'existe', 'déjà'];
  
  const frenchParts = parts.filter(part => {
    const lowerPart = part.toLowerCase();
    return frenchKeywords.some(keyword => lowerPart.includes(keyword)) ||
           /[àâäéèêëïîôùûüÿç]/.test(part); // Contient des accents
  });
  
  if (frenchParts.length > 0) {
    return frenchParts.join('. ').trim();
  }
  
  return '';
}

/**
 * Traduit un texte d'erreur spécifique
 */
function translateText(text: string | undefined | null): string {
  if (!text) return '';

  // D'abord, essayer d'extraire uniquement la partie française si le message est mixte
  const frenchOnly = extractFrenchOnly(text);
  if (frenchOnly) {
    return frenchOnly;
  }

  const lowerText = text.toLowerCase();

  // Dictionnaire de traduction complet
  const translations: Record<string, string> = {
    // Erreurs HTTP
    'unauthorized': 'Non autorisé. Veuillez vous connecter.',
    'forbidden': 'Accès refusé.',
    'not found': 'Ressource introuvable.',
    'bad request': 'Requête invalide.',
    'internal server error': 'Erreur serveur interne.',
    'validation failed': 'Échec de la validation des données.',
    'user not found': 'Utilisateur introuvable.',
    'invalid credentials': 'Identifiants invalides.',
    'token expired': 'Token expiré. Veuillez vous reconnecter.',
    'access denied': 'Accès refusé.',
    'permission denied': 'Permission refusée.',
    'authentication failed': 'Échec de l\'authentification.',
    'authorization failed': 'Échec de l\'autorisation.',
    
    // Erreurs métier
    'shift code already exists': 'Ce code de shift existe déjà.',
    'team code already exists': 'Ce code d\'équipe existe déjà.',
    'employee with this matricule already exists': 'Un employé avec ce matricule existe déjà.',
    'schedule already exists': 'Un planning existe déjà pour cette date.',
    'invalid date': 'Date invalide.',
    'invalid time': 'Heure invalide.',
    'invalid shift': 'Shift invalide.',
    'invalid employee': 'Employé invalide.',
    'invalid team': 'Équipe invalide.',
    
    // Erreurs spécifiques aux plannings
    'employee not found': 'L\'employé sélectionné n\'existe pas ou n\'appartient pas à votre entreprise.',
    'shift not found': 'Le shift sélectionné n\'existe pas ou n\'appartient pas à votre entreprise.',
    'team not found': 'L\'équipe sélectionnée n\'existe pas ou n\'appartient pas à votre entreprise.',
    'tous les plannings pour cette période existent déjà': 'Tous les jours de cette période sont déjà planifiés. Veuillez choisir une autre période ou modifier les plannings existants.',
    'l\'intervalle ne peut pas dépasser': 'L\'intervalle sélectionné dépasse la limite autorisée.',
    'la date de fin doit être supérieure ou égale à la date de début': 'La date de fin doit être supérieure ou égale à la date de début.',
    'l\'heure de fin doit être supérieure à l\'heure de début': 'L\'heure de fin doit être supérieure à l\'heure de début.',
    'n\'est pas actif': 'Cet élément n\'est pas actif. Impossible de créer un planning.',
    'n\'appartient pas à cette équipe': 'L\'employé n\'appartient pas à l\'équipe sélectionnée.',
    
    // Messages génériques
    'error': 'Erreur',
    'failed': 'Échec',
    'invalid': 'Invalide',
    'request failed': 'La requête a échoué.',
    'network error': 'Erreur réseau. Vérifiez votre connexion.',
    'timeout': 'Délai d\'attente dépassé. Veuillez réessayer.',
    'request failed with status code': 'La requête a échoué.',
  };

  // Chercher une traduction exacte ou partielle
  for (const [key, translation] of Object.entries(translations)) {
    if (lowerText.includes(key)) {
      return translation;
    }
  }

  // Si aucune traduction trouvée mais contient de l'anglais, retourner un message générique
  if (containsEnglish(text)) {
    return 'Une erreur est survenue. Veuillez réessayer.';
  }

  // Retourner le texte original s'il est déjà en français
  return text;
}

/**
 * Formate un message d'erreur avec un titre et une description
 */
export function formatErrorAlert(error: ApiError | any): {
  title: string;
  description: string;
} {
  const message = translateErrorMessage(error);
  const statusCode = error?.response?.status || error?.response?.data?.statusCode;

  let title = 'Erreur';
  if (statusCode === 401) {
    title = 'Session expirée';
  } else if (statusCode === 403) {
    title = 'Accès refusé';
  } else if (statusCode === 404) {
    title = 'Ressource introuvable';
  } else if (statusCode === 500) {
    title = 'Erreur serveur';
  }

  return {
    title,
    description: message,
  };
}

