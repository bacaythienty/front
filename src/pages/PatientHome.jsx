import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { Search, Calendar, Heart, Eye, Baby, Smile, Activity, ChevronRight, MapPin, Star } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

const PatientHome = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [popularDoctors, setPopularDoctors] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchData = async () => {
      try {
        // 1. Spécialités
        const specRes = await fetch(`${API_URL}/specialties`);
        const specData = await specRes.json();
        setSpecialties(specData);

        // 2. Médecins populaires (ou juste les premiers)
        const docRes = await fetch(`${API_URL}/users/doctors`);
        const docData = await docRes.json();
        setPopularDoctors(docData.slice(0, 3));

        // 3. Mes RDV à venir si connecté
        if (token && user?.role === 'patient') {
          const appRes = await fetch(`${API_URL}/appointments/my`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const appData = await appRes.json();
          // Prendre les 2 prochains rendez-vous non annulés
          const upcoming = appData
            .filter(app => app.status !== 'cancelled' && new Date(app.date) >= new Date().setHours(0,0,0,0))
            .slice(0, 2);
          setMyAppointments(upcoming);
        }
      } catch (err) {
        console.error('Erreur chargement données accueil:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/search?q=${search}`);
  };

  const handleSpecialtyClick = (id) => {
    navigate(`/search?specialty=${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header de bienvenue & Barre de recherche */}
      <div className="relative bg-gradient-to-r from-medBlue-600 to-blue-700 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 hidden md:block">
          <Calendar size={300} className="translate-x-10 translate-y-10" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight m-0 text-white text-left">
            Bonjour, {user ? user.name.split(' ')[0] : 'Babacar'} !
          </h1>
          <p className="text-blue-100 text-base sm:text-lg text-left">
            Trouvez votre praticien et prenez rendez-vous en ligne en quelques clics.
          </p>
          <form onSubmit={handleSearchSubmit} className="flex gap-2 bg-white p-2 rounded-2xl shadow-lg mt-4 max-w-lg">
            <div className="flex items-center gap-2 pl-3 text-slate-400 w-full">
              <Search size={18} />
              <input
                type="text"
                placeholder="Médecin, spécialité, ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" variant="primary">
              Rechercher
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Spécialités & Médecins (2/3 de l'écran) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Section Spécialités */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Spécialités</h2>
              <button onClick={() => navigate('/search')} className="text-xs font-semibold text-medBlue-600 flex items-center gap-0.5 hover:underline">
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
                    className="flex flex-col items-center justify-center text-center p-4 gap-3 bg-white"
                  >
                    <div className="p-3 bg-medBlue-50 text-medBlue-600 rounded-2xl">
                      <IconComponent size={24} />
                    </div>
                    <span className="font-semibold text-sm text-slate-800">{spec.name}</span>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section Médecins populaires */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 text-left">Médecins populaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {popularDoctors.map((doc) => (
                <Card
                  key={doc._id}
                  hoverable
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="flex gap-4 p-4 text-left"
                >
                  <img
                    src={doc.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                    alt={doc.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                  />
                  <div className="flex flex-col justify-center min-w-0">
                    <h3 className="font-bold text-sm text-slate-800 truncate m-0">{doc.name}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate mb-1">
                      {doc.doctorProfile?.specialty?.name || 'Généraliste'}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="truncate">{doc.doctorProfile.address || 'Thiès'}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Prochains Rendez-vous (1/3 de l'écran) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 text-left">Vos prochains rendez-vous</h2>
          
          {!token ? (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200 text-center py-8">
              <p className="text-sm text-slate-500 font-medium mb-3">Connectez-vous pour consulter et réserver vos rendez-vous.</p>
              <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </Card>
          ) : myAppointments.length === 0 ? (
            <Card className="bg-slate-50 border-dashed border-2 border-slate-200 text-center py-8">
              <Calendar className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-sm text-slate-500 font-medium mb-3">Aucun rendez-vous planifié.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
                Trouver un médecin
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {myAppointments.map((app) => (
                <Card key={app._id} className="p-4 border-l-4 border-l-medBlue-500 text-left flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{app.doctor.name}</h4>
                      <p className="text-xs text-slate-400">{app.doctor.doctorProfile?.specialty?.name || 'Généraliste'}</p>
                    </div>
                    <Badge>{app.status}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                    <span>⏰ {app.slot}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="truncate">{app.doctor.doctorProfile.address}</span>
                  </div>
                </Card>
              ))}
              <Button variant="outline" size="sm" className="w-full text-center" onClick={() => navigate('/appointments')}>
                Voir tous mes rendez-vous
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
