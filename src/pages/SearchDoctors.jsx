import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import { Search, MapPin, Stethoscope, Star, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const SearchDoctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtres locaux liés à l'état URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  // Charger les spécialités
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch(`${VITE_API_URL}/specialties`);
        const data = await res.json();
        setSpecialties(data);
      } catch (err) {
        console.error('Erreur:', err);
      }
    };
    fetchSpecialties();
  }, []);

  // Déclencher la recherche quand les paramètres URL changent
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const q = searchParams.get('q') || '';
        const spec = searchParams.get('specialty') || '';
        const ct = searchParams.get('city') || '';
        
        const url = new URL(`${API_URL}/users/doctors`);
        if (q) url.searchParams.append('search', q);
        if (spec) url.searchParams.append('specialty', spec);
        if (ct) url.searchParams.append('city', ct);

        const res = await fetch(url);
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error('Erreur recherche médecins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [searchParams]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = {};
    if (search) params.q = search;
    if (selectedSpecialty) params.specialty = selectedSpecialty;
    if (city) params.city = city;
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedSpecialty('');
    setCity('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Barre de filtres (colonne de gauche) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20 text-left">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-1.5">
              <Sparkles size={18} className="text-medBlue-600" />
              Filtres de recherche
            </h3>
            
            <form onSubmit={handleFilterSubmit} className="space-y-4">
              <Input
                label="Nom ou mot-clé"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nom du médecin..."
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="specialty-filter" className="text-sm font-semibold text-slate-700">
                  Spécialité
                </label>
                <select
                  id="specialty-filter"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-medBlue-500"
                >
                  <option value="">Toutes les spécialités</option>
                  {specialties.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Ville"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Thiès, Dakar..."
              />

              <div className="flex gap-2 pt-2">
                <Button type="submit" variant="primary" className="flex-1">
                  Filtrer
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Réinitialiser
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Résultats de recherche (grille centrale) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-left">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Résultats de recherche</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {loading ? 'Recherche en cours...' : `${doctors.length} médecin(s) trouvé(s)`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medBlue-600"></div>
            </div>
          ) : doctors.length === 0 ? (
            <Card className="text-center py-16 bg-slate-50 border-dashed border-2 border-slate-200">
              <Stethoscope size={40} className="mx-auto text-slate-300 mb-2" />
              <h4 className="font-bold text-slate-700">Aucun médecin trouvé</h4>
              <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
                Essayez de modifier vos filtres ou de réinitialiser la recherche pour obtenir plus de résultats.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <Card key={doc._id} className="text-left flex flex-col justify-between h-full bg-white">
                  <div className="flex gap-4">
                    <img
                      src={doc.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                      alt={doc.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold text-base text-slate-800 m-0 truncate">{doc.name}</h3>
                      <p className="text-xs font-semibold text-medBlue-600 flex items-center gap-1">
                        <span className="bg-medBlue-50 px-2 py-0.5 rounded-md">
                          {doc.doctorProfile?.specialty?.name || 'Généraliste'}
                        </span>
                        {doc.doctorProfile.experience > 0 && (
                          <span className="text-slate-400 font-medium">
                            • {doc.doctorProfile.experience} ans d'exp.
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{doc.doctorProfile.address || 'Non spécifié'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Tarif Consultation</span>
                      <span className="text-base font-extrabold text-slate-800">
                        {doc.doctorProfile.fees ? `${doc.doctorProfile.fees} FCFA` : 'Non renseigné'}
                      </span>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/doctor/${doc._id}`)}
                    >
                      Prendre RDV
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDoctors;
