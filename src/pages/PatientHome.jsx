import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { getInitialSpecialties, getInitialDoctors, setCachedData } from '../utils/cache';
import { 
  Search, Calendar, Heart, Eye, Baby, Smile, 
  Activity, ChevronRight, MapPin, Star, Sparkles, CheckCircle2 
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const PatientHome = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [specialties, setSpecialties] = useState(getInitialSpecialties);
  const [popularDoctors, setPopularDoctors] = useState(getInitialDoctors);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  // Mappage des icônes Lucide par leur nom
  const iconMap = {
    Heart: Heart,
    Eye: Eye,
    Baby: Baby,
    Smile: Smile,
    Activity: Activity,
    Stethoscope: Activity // Fallback
  };

  useEffect(() => {
    // Avertir discrètement si le serveur Render dort et met plus de 2.5 secondes à répondre
    const warmTimer = setTimeout(() => {
      setIsWarmingUp(true);
    }, 2500);

    const fetchData = async () => {
      // 1. Spécialités en parallèle
      const fetchSpecialties = fetch(`${API_URL}/specialties`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data) && data.length > 0) {
            setSpecialties(data);
            setCachedData('specialties', data);
          }
        })
        .catch(() => {});

      // 2. Médecins populaires en parallèle
      const fetchDoctors = fetch(`${API_URL}/users/doctors`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && Array.isArray(data)) {
            const top3 = data.slice(0, 3);
            setPopularDoctors(top3);
            setCachedData('popular_doctors', top3);
          }
        })
        .catch(() => {});

      // 3. Mes RDV à venir en parallèle si connecté
      const fetchAppointments = (token && user?.role === 'patient')
        ? fetch(`${API_URL}/appointments/my`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && Array.isArray(data)) {
                const upcoming = data
                  .filter(app => app.status !== 'cancelled' && new Date(app.date) >= new Date().setHours(0,0,0,0))
                  .slice(0, 3);
                setMyAppointments(upcoming);
              }
            })
            .catch(() => {})
        : Promise.resolve();

      // Exécution simultanée de toutes les requêtes
      await Promise.allSettled([fetchSpecialties, fetchDoctors, fetchAppointments]);
      clearTimeout(warmTimer);
      setLoading(false);
      setIsWarmingUp(false);
    };

    fetchData();

    return () => clearTimeout(warmTimer);
  }, [token, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${search}`);
  };

  const handleSpecialtyClick = (id) => {
    navigate(`/search?specialty=${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-6 space-y-12">
      
      {/* 1. Hero / Header de bienvenue premium */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-medBlue-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800 overflow-hidden">
        {/* Glows d'arrière-plan */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-medBlue-600/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-2xl animate-pulse-glow delay-150" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Contenu gauche */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-cyan-300 animate-fade-in-up">
                <Sparkles size={14} className="animate-pulse" />
                <span>Votre santé est notre priorité absolue</span>
              </div>
              {isWarmingUp && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-xs font-medium text-cyan-300 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span>Synchronisation avec le serveur...</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-outfit tracking-tight leading-tight text-white text-left animate-fade-in-up delay-75">
              {user ? (
                <>Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-medBlue-400 to-cyan-300 font-extrabold">{user.name.split(' ')[0]}</span> !</>
              ) : (
                <>Prenez soin de vous avec <span className="text-transparent bg-clip-text bg-gradient-to-r from-medBlue-400 to-cyan-300 font-extrabold">MediRdv</span></>
              )}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-left max-w-xl animate-fade-in-up delay-150">
              Trouvez les praticiens les plus qualifiés près de chez vous et réservez une consultation en ligne en moins de 2 minutes.
            </p>

            {/* Formulaire de recherche repensé */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/10 mt-6 max-w-xl animate-fade-in-up delay-300">
              <div className="flex items-center gap-2 pl-3 text-slate-300 flex-1">
                <Search size={18} className="text-cyan-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Spécialité, nom du médecin, ville..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-white text-base md:text-sm focus:outline-none placeholder:text-slate-400 py-2.5"
                />
              </div>
              <Button 
                type="submit" 
                variant="primary" 
                className="bg-gradient-to-tr from-medBlue-600 to-cyan-500 hover:from-medBlue-700 hover:to-cyan-600 border-none font-bold py-3 px-6 rounded-xl shadow-lg shadow-medBlue-900/20"
              >
                Rechercher
              </Button>
            </form>
          </div>

          {/* Avatar Médecin à droite */}
          <div className="hidden md:flex justify-end items-center pr-4">
            <div className="relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-medBlue-500 to-cyan-400 rounded-full blur-2xl opacity-35" />
              <img 
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=280" 
                alt="Médecin Conseil" 
                className="w-44 h-44 rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Gauche & Milieu (Spécialités & Médecins populaires) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section Spécialités */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h2 className="text-xl font-bold font-outfit text-slate-800">Spécialités médicales</h2>
                <p className="text-xs text-slate-400">Trouvez un médecin par discipline</p>
              </div>
              <button 
                onClick={() => navigate('/search')} 
                className="text-xs font-bold text-medBlue-600 flex items-center gap-0.5 hover:text-medBlue-700 transition-colors"
              >
                Voir tout <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {specialties.map((spec) => {
                const IconComponent = iconMap[spec.icon] || Activity;
                return (
                  <Card
                    key={spec._id}
                    hoverable
                    onClick={() => handleSpecialtyClick(spec._id)}
                    className="flex flex-col items-center justify-center text-center p-5 gap-3"
                  >
                    <div className="w-12 h-12 bg-medBlue-50 text-medBlue-600 rounded-2xl flex items-center justify-center transition-transform duration-300">
                      <IconComponent size={24} />
                    </div>
                    <span className="font-bold text-sm text-slate-800">{spec.name}</span>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section Médecins Populaires */}
          <div className="space-y-6">
            <div className="space-y-0.5">
              <h2 className="text-xl font-bold font-outfit text-slate-800 text-left">Médecins recommandés</h2>
              <p className="text-xs text-slate-400 text-left">Les praticiens les plus consultés à Thiès & Dakar</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularDoctors.length > 0 ? (
                popularDoctors.map((doc) => (
                  <Card
                    key={doc._id}
                    hoverable
                    onClick={() => navigate(`/doctor/${doc._id}`)}
                    className="p-4 text-left flex gap-4"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={doc.doctorProfile?.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                        alt={doc.name}
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-slate-100/50 shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-md shadow-xs px-1 py-0.5 border border-slate-50 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400" />
                        <span className="text-[9px] font-bold text-slate-600">4.9</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="font-bold font-outfit text-sm text-slate-800 truncate m-0 flex items-center gap-1.5">
                        {doc.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 shrink-0" />
                      </h3>
                      <p className="text-xs text-medBlue-600 font-semibold truncate mb-1">
                        {doc.doctorProfile?.specialty?.name || 'Généraliste'}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{doc.doctorProfile?.address || 'Sénégal'}</span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                [1, 2].map((placeholder) => (
                  <div key={placeholder} className="p-4 rounded-2xl bg-white/70 border border-slate-100/80 animate-pulse flex gap-4 shadow-xs">
                    <div className="w-16 h-16 rounded-xl bg-slate-200/80 shrink-0" />
                    <div className="flex-1 space-y-2.5 py-1">
                      <div className="h-4 bg-slate-200/80 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                      <div className="h-3 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Colonne Droite (Prochains Rendez-vous / Widget) */}
        <div className="space-y-6">
          <div className="space-y-0.5">
            <h2 className="text-xl font-bold font-outfit text-slate-800 text-left">Vos rendez-vous</h2>
            <p className="text-xs text-slate-400 text-left">Suivi de vos consultations</p>
          </div>
          
          {!token ? (
            <Card className="glass-effect text-center py-10 px-6 rounded-2xl border-dashed border-2 border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                Connectez-vous pour consulter, modifier ou planifier vos rendez-vous en ligne.
              </p>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigate('/login')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
              >
                Se connecter
              </Button>
            </Card>
          ) : myAppointments.length === 0 ? (
            <Card className="glass-effect text-center py-10 px-6 rounded-2xl border-dashed border-2 border-slate-200">
              <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
              <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                Vous n'avez aucun rendez-vous planifié pour le moment.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/search')}
                className="w-full hover:bg-slate-50 font-bold rounded-xl border-slate-200"
              >
                Prendre rendez-vous
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAppointments.map((app) => (
                <div 
                  key={app._id} 
                  className="glass-effect p-4 border-l-4 border-l-medBlue-500 text-left flex flex-col gap-3 rounded-2xl shadow-xs"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold font-outfit text-sm text-slate-800 leading-tight">{app.doctor.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{app.doctor.doctorProfile?.specialty?.name || 'Généraliste'}</p>
                    </div>
                    <Badge variant={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'danger'}>
                      {app.status === 'confirmed' ? 'Validé' : app.status === 'pending' ? 'En attente' : 'Annulé'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                    <span>⏰ {app.slot}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{app.doctor.doctorProfile.address}</span>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-center font-bold rounded-xl border-slate-200 hover:bg-slate-50 py-2.5 text-xs" 
                onClick={() => navigate('/appointments')}
              >
                Voir tous mes rendez-vous ({myAppointments.length})
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PatientHome;
