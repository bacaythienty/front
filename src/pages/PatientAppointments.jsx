import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Calendar, MapPin, AlertCircle, XOctagon } from 'lucide-react';
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
      // Rafraîchir
      fetchAppointments();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Séparer les rendez-vous en à venir et passés/annulés
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 m-0">Mes rendez-vous</h1>
        <p className="text-sm text-slate-500 mt-1">Consultez l'historique et gérez vos réservations.</p>
      </div>

      {/* Onglets (Tabs) */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'upcoming'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          À venir ({upcomingApp.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'past'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Historique / Annulés ({pastApp.length})
        </button>
      </div>

      {/* Liste des rendez-vous */}
      {displayedApp.length === 0 ? (
        <Card className="text-center py-16 bg-slate-50 border-dashed border-2 border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-2" size={40} />
          <h4 className="font-bold text-slate-700">Aucun rendez-vous</h4>
          <p className="text-sm text-slate-400 mt-1">Vous n'avez pas de rendez-vous dans cette catégorie.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedApp.map((app) => (
            <Card key={app._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4">
                <img
                  src={app.doctor.doctorProfile?.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"}
                  alt={app.doctor.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 self-center"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-800 m-0">{app.doctor.name}</h3>
                    <Badge>{app.status}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-medBlue-600">
                    {app.doctor.doctorProfile?.specialty?.name || 'Généraliste'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-1.5">
                    <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                    <span>⏰ {app.slot}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{app.doctor.doctorProfile.address}</span>
                  </div>
                </div>
              </div>

              {/* Action Annulation */}
              {activeTab === 'upcoming' && app.status !== 'cancelled' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 self-start md:self-center shrink-0 flex items-center gap-1"
                  onClick={() => handleCancelClick(app._id)}
                >
                  <XOctagon size={14} /> Annuler
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modale confirmation annulation */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Annuler le rendez-vous"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Fermer
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelConfirm} disabled={cancelling}>
              {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-sm flex gap-1.5 items-center">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <p className="text-sm text-slate-500">
            Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible et libérera le créneau horaire pour d'autres patients.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PatientAppointments;
