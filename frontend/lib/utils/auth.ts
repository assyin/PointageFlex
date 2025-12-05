/**
 * Vérifie si l'utilisateur est authentifié et si le token est valide
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  // Vérifier si le token JWT est expiré (basique)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir en millisecondes
    const now = Date.now();
    
    // Si le token est expiré, retourner false
    if (exp < now) {
      // Nettoyer le token expiré
      localStorage.removeItem('accessToken');
      return false;
    }
    
    return true;
  } catch (error) {
    // Si le token n'est pas un JWT valide, retourner false
    return false;
  }
}

