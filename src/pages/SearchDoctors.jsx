import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';
import { Search, MapPin, Stethoscope, Star, Sparkles, Filter, CheckCircle2, RotateCcw } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const SearchDoctors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Filtres locaux liés à l'état URL
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');

  // Charger les spécialités
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const res = await fetch(`${API_URL}/specialties`);
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
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-8 space-y-6">
      
      {/* En-tête de page */}
      <div className="text-left max-w-xl space-y-1">
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Trouver un médecin</h1>
        <p className="text-xs text-slate-400 font-medium">Prenez rendez-vous en ligne avec un praticien spécialisé au Sénégal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Barre de filtres (colonne de gauche) */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-2xl p-5 text-left sticky top-20 shadow-xl shadow-slate-100/50">
            <h3 className="font-bold font-outfit text-sm text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-50 uppercase tracking-wider">
              <Filter size={15} className="text-medBlue-600" />
              Filtres
            </h3>
            
            <form onSubmit={handleFilterSubmit} className="space-y-4">
              <Input
                ref={searchInputRef}
                label="Rechercher par nom"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ex: Dr. Diop..."
                className="rounded-xl"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="specialty-filter" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Spécialité
                </label>
                <select
                  id="specialty-filter"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="px-3.5 py-3 text-xs rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-medium text-slate-700"
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
                label="Ville / Localité"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Thiès, Dakar..."
                className="rounded-xl"
              />

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="flex-1 bg-gradient-to-tr from-medBlue-600 to-cyan-500 border-none font-bold py-2.5 rounded-xl text-xs"
                >
                  Filtrer
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleReset}
                  className="rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  Réinitialiser
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Résultats de recherche (grille centrale) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-xs font-semibold text-slate-400 tracking-wider">
                {loading ? 'Recherche en cours...' : `${doctors.length} praticien(s) disponible(s)`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
                <p className="text-slate-400 text-xs font-medium">Recherche des praticiens...</p>
              </div>
            </div>
          ) : doctors.length === 0 ? (
            <Card className="text-center py-20 glass-effect border-dashed border-2 border-slate-200 rounded-3xl">
              <Stethoscope size={44} className="mx-auto text-slate-300 mb-3" />
              <h4 className="font-bold font-outfit text-slate-800 text-base">Aucun médecin ne correspond à votre recherche</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
                Essayez de modifier vos filtres, de renseigner une autre ville ou de cliquer sur Réinitialiser.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <Card 
                  key={doc._id} 
                  hoverable
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="flex flex-col justify-between"
                >
                  <div className="flex gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={doc.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                        alt={doc.name}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-100/50 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-md shadow-xs px-1 py-0.5 border border-slate-50 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                        <span className="text-[9px] font-bold text-slate-600">4.9</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 min-w-0">
                      <h3 className="font-bold font-outfit text-sm text-slate-800 m-0 truncate flex items-center gap-1.5">
                        {doc.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 shrink-0" />
                      </h3>
                      <p className="text-xs font-semibold text-medBlue-600 flex items-center gap-1.5">
                        <span className="bg-medBlue-50 px-2 py-0.5 rounded-md text-[10px]">
                          {doc.doctorProfile?.specialty?.name || 'Généraliste'}
                        </span>
                        {doc.doctorProfile.experience > 0 && (
                          <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                            • {doc.doctorProfile.experience} ans d'exp
                          </span>
                        )}
                      </p>
                      
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{doc.doctorProfile.address || 'Sénégal'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100/80 mt-5 pt-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Tarif Consultation</span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {doc.doctorProfile.fees ? `${doc.doctorProfile.fees.toLocaleString('fr-FR')} FCFA` : 'Non renseigné'}
                      </span>
                    </div>
                    
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/doctor/${doc._id}`)}
                      className="bg-slate-900 hover:bg-slate-800 border-none font-bold text-white rounded-xl text-xs py-2 px-4 shadow-xs"
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
