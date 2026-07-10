import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Calendar, MapPin, AlertCircle, XOctagon, Sparkles, CheckCircle2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const PatientAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  
  // États d'annulation
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  // États pour les détails du rendez-vous
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/appointments/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Erreur chargement rendez-vous:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const handleCancelClick = (appId) => {
    setSelectedAppId(appId);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    setCancelling(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/appointments/${selectedAppId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'annulation');
      }

      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const today = new Date().setHours(0, 0, 0, 0);

  const upcomingApp = appointments.filter(app => {
    return app.status !== 'cancelled' && new Date(app.date) >= today;
  });

  const pastApp = appointments.filter(app => {
    return app.status === 'cancelled' || new Date(app.date) < today;
  });

  const displayedApp = activeTab === 'upcoming' ? upcomingApp : pastApp;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
          <p className="text-slate-400 text-xs font-medium">Chargement de vos rendez-vous...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-1 sm:px-4 py-8 space-y-6 text-left relative overflow-hidden">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Mes rendez-vous</h1>
          <p className="text-xs text-slate-400 font-medium">Consultez et gérez l'état de vos rendez-vous médicaux</p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
          <Sparkles size={12} className="text-medBlue-500" />
          <span>Mise à jour en direct</span>
        </div>
      </div>

      {/* Onglets Premium */}
      <div className="flex border-b border-slate-100/80 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'upcoming'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          À venir ({upcomingApp.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'past'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Historique ({pastApp.length})
        </button>
      </div>

      {/* Liste des rendez-vous */}
      {displayedApp.length === 0 ? (
        <Card className="text-center py-20 glass-effect border-dashed border-2 border-slate-200 rounded-3xl">
          <Calendar className="mx-auto text-slate-300 mb-3" size={44} />
          <h4 className="font-bold font-outfit text-slate-800 text-sm">Aucun rendez-vous planifié</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Vous n'avez pas de rendez-vous dans cette catégorie pour le moment.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedApp.map((app) => (
            <div 
              key={app._id} 
              className="glass-effect p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl hover-card-effect shadow-xs"
            >
              <div className="flex gap-4">
                <img
                  src={app.doctor.doctorProfile?.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                  alt={app.doctor.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100/80 shadow-xs shrink-0 self-center"
                />
                
                <div className="space-y-1 text-left min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold font-outfit text-sm text-slate-800 m-0 flex items-center gap-1">
                      {app.doctor.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50 shrink-0" />
                    </h3>
                    <Badge variant={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'danger'}>
                      {app.status === 'confirmed' ? 'Validé' : app.status === 'pending' ? 'En attente' : 'Annulé'}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-medBlue-600">
                    {app.doctor.doctorProfile?.specialty?.name || 'Généraliste'}
                  </p>
                  
                  <div className="flex items-center gap-3.5 text-xs font-semibold text-slate-500 pt-1">
                    <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span>⏰ {app.slot}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <MapPin size={11} className="shrink-0 text-slate-400" />
                    <span className="truncate">{app.doctor.doctorProfile.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Annulation / Détails */}
              <div className="flex gap-2 self-start md:self-center shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200 font-bold rounded-xl text-xs py-2 px-4.5"
                  onClick={() => {
                    setSelectedApp(app);
                    setDetailModalOpen(true);
                  }}
                >
                  Détails
                </Button>
                {activeTab === 'upcoming' && app.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-650 hover:text-red-750 hover:bg-red-50/50 border-red-200 font-bold rounded-xl text-xs py-2 px-4.5 flex items-center gap-1.5"
                    onClick={() => handleCancelClick(app._id)}
                  >
                    <XOctagon size={13} /> Annuler
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale confirmation annulation */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler le rendez-vous"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCancelModalOpen(false)}
              className="rounded-xl font-bold border-slate-200 text-xs px-4"
            >
              Fermer
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleCancelConfirm} 
              disabled={cancelling}
              className="rounded-xl font-bold text-xs px-4"
            >
              {cancelling ? 'Annulation...' : "Confirmer l'annulation"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left p-1">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-700 text-xs flex gap-2 items-center">
              <AlertCircle size={15} />
              <span className="font-semibold">{error}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible et libérera immédiatement le créneau horaire pour d'autres patients.
          </p>
        </div>
      </Modal>

      {/* Modale de détails du rendez-vous */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails du rendez-vous"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailModalOpen(false)}
              className="rounded-xl font-bold border-slate-200 text-xs px-4"
            >
              Fermer
            </Button>
            {selectedApp?.status !== 'cancelled' && activeTab === 'upcoming' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  handleCancelClick(selectedApp._id);
                }}
                className="rounded-xl font-bold text-xs px-4"
              >
                Annuler ce rendez-vous
              </Button>
            )}
          </div>
        }
      >
        {selectedApp && (
          <div className="space-y-4 text-xs text-slate-600 font-medium text-left p-1">
            <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
              <img 
                src={selectedApp.doctor.doctorProfile?.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"} 
                alt={selectedApp.doctor.name} 
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
              />
              <div>
                <p className="font-bold text-slate-800 text-sm">{selectedApp.doctor.name}</p>
                <p className="text-medBlue-600 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                  {selectedApp.doctor.doctorProfile?.specialty?.name || 'Généraliste'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 bg-white/50 p-2.5 rounded-2xl border border-slate-100/50 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Statut</span>
                <Badge variant={selectedApp.status === 'confirmed' ? 'success' : selectedApp.status === 'pending' ? 'warning' : 'danger'}>
                  {selectedApp.status === 'confirmed' ? 'Validé' : selectedApp.status === 'pending' ? 'En attente' : 'Annulé'}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date</span>
                <span className="font-bold text-slate-850">
                  {new Date(selectedApp.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Heure</span>
                <span className="font-bold text-slate-850">{selectedApp.slot}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Adresse de consultation</span>
                <span className="font-bold text-slate-850 truncate max-w-[200px]">{selectedApp.doctor.doctorProfile?.address || 'Sénégal'}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Tarif</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {selectedApp.doctor.doctorProfile?.fees ? `${selectedApp.doctor.doctorProfile.fees.toLocaleString('fr-FR')} FCFA` : 'Non spécifié'}
                </span>
              </div>
            </div>

            {selectedApp.notes && (
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Motif de consultation</p>
                <p className="text-slate-650 leading-relaxed font-medium italic mt-0.5">"{selectedApp.notes}"</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientAppointments;
