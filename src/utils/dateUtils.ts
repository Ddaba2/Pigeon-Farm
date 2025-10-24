/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Convertit une date ISO en format YYYY-MM-DD pour les champs input[type="date"]
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Retourner au format YYYY-MM-DD
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return '';
  }
}

/**
 * Convertit une date au format YYYY-MM-DD en objet Date
 */
export function parseInputDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString + 'T00:00:00.000Z');
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Erreur lors du parsing de la date:', error);
    return null;
  }
}

/**
 * Formate une date pour l'affichage (DD/MM/YYYY)
 */
export function formatDateForDisplay(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('fr-FR');
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return '';
  }
}

/**
 * Formate une date pour l'API (YYYY-MM-DD)
 */
export function formatDateForAPI(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erreur lors du formatage de la date pour l\'API:', error);
    return '';
  }
}
