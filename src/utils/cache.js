// Utilitaire de cache ultra-rapide (Stale-While-Revalidate)
// Permet d'afficher instantanément les données (0ms) sans attendre le serveur Render

const DEFAULT_SPECIALTIES = [
  { _id: 'spec_cardio', name: 'Cardiologie', icon: 'Heart', description: 'Santé cardiaque et vasculaire' },
  { _id: 'spec_dentiste', name: 'Dentiste', icon: 'Smile', description: 'Soins dentaires et hygiène buccale' },
  { _id: 'spec_ophtalmo', name: 'Ophtalmologie', icon: 'Eye', description: 'Vision et santé des yeux' },
  { _id: 'spec_generaliste', name: 'Généraliste', icon: 'Activity', description: 'Médecine générale et prévention' },
  { _id: 'spec_pediatrie', name: 'Pédiatrie', icon: 'Baby', description: 'Santé des enfants et nourrissons' }
];

export const getCachedData = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(`medirdv_${key}`);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed.data || fallback;
  } catch (err) {
    return fallback;
  }
};

export const setCachedData = (key, data) => {
  try {
    localStorage.setItem(`medirdv_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (err) {
    // Quota ou mode privé ignoré
  }
};

export const getInitialSpecialties = () => {
  const cached = getCachedData('specialties');
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  return DEFAULT_SPECIALTIES;
};

export const getInitialDoctors = () => {
  const cached = getCachedData('popular_doctors');
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  return [];
};
