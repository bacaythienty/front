import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { MapPin, Calendar, BookOpen, User, AlertCircle, MessageSquare } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';

const DoctorProfile = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);

  // États pour la réservation
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [booking, setBooking] = useState(false);

  // Charger le médecin
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`${API_URL}/users/doctors/${id}`);
        if (!res.ok) throw new Error('Médecin non trouvé');
        const data = await res.json();
        setDoctor(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDoctor();
  }, [id]);

  // Charger les créneaux quand la date change
  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setSelectedSlot('');
      try {
        const res = await fetch(`${API_URL}/appointments/available-slots?doctorId=${id}&date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data);
        }
      } catch (err) {
        console.error('Erreur de chargement des créneaux :', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!token) {
      // Rediriger vers la page de connexion s'il n'est pas connecté
      navigate('/login');
      return;
    }

    if (user.role !== 'patient') {
      setError('Seuls les patients peuvent réserver des rendez-vous.');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError('Veuillez sélectionner une date et un créneau horaire.');
      return;
    }

    setError('');
    setSuccess('');
    setBooking(true);

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doctorId: id,
          date: selectedDate,
          slot: selectedSlot,
          notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la réservation');
      }

      setSuccess('Votre rendez-vous a bien été réservé et est en attente de validation par le médecin.');
      setSelectedSlot('');
      setNotes('');
      // Recharger les créneaux disponibles
      const slotsRes = await fetch(`${API_URL}/appointments/available-slots?doctorId=${id}&date=${selectedDate}`);
      const updatedSlots = await slotsRes.json();
      setAvailableSlots(updatedSlots);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  if (loadingDoc) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  if (error && !doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Erreur</h3>
        <p className="text-slate-500 mt-1">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    );
  }

  // Date minimale de réservation : aujourd'hui
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profil Médecin */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Infos Médecin (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="text-left flex flex-col sm:flex-row gap-6 p-6">
            <img
              src={doctor.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250"}
              alt={doctor.name}
              className="w-32 h-32 rounded-2xl object-cover border border-slate-100 shrink-0 self-start sm:self-center"
            />
            <div className="space-y-3">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-800 m-0 leading-tight">{doctor.name}</h1>
                <p className="text-sm font-bold text-medBlue-600 uppercase tracking-wide">
                  {doctor.doctorProfile?.specialty?.name || 'Généraliste'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl self-start">
                <span>⭐ 4.9 (104 avis)</span>
                <span>•</span>
                <span>💼 {doctor.doctorProfile.experience} ans d'expérience</span>
                <span>•</span>
                <span>💶 {doctor.doctorProfile.fees} FCFA / consultation</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>{doctor.doctorProfile.address || 'Non renseigné'}</span>
              </div>
            </div>
          </Card>

          {/* Biographie & Formation */}
          <Card className="text-left space-y-5 p-6">
            {doctor.doctorProfile.biography && (
              <div className="space-y-2">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <User size={18} className="text-medBlue-600" /> Biographie
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{doctor.doctorProfile.biography}</p>
              </div>
            )}

            {doctor.doctorProfile.education && (
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <BookOpen size={18} className="text-medBlue-600" /> Formation & Études
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{doctor.doctorProfile.education}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Réservation (1/3) */}
        <div className="lg:col-span-1">
          <Card className="text-left sticky top-20 shadow-lg p-6">
            <h3 className="font-bold text-base text-slate-800 mb-4 flex items-center gap-1.5">
              <Calendar size={18} className="text-medBlue-600" />
              Prendre rendez-vous
            </h3>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 text-center space-y-4">
                <p className="text-sm font-medium">{success}</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/appointments')} className="w-full">
                  Voir mes rendez-vous
                </Button>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Étape 1 : Choisir Date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-date" className="text-sm font-semibold text-slate-700">
                    Saisir une date
                  </label>
                  <input
                    type="date"
                    id="booking-date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Étape 2 : Choisir Créneau */}
                {selectedDate && (
                  <div className="space-y-2.5">
                    <label className="text-sm font-semibold text-slate-700 block">
                      Créneaux horaires disponibles
                    </label>

                    {loadingSlots ? (
                      <div className="text-xs text-slate-400 py-4 text-center">Recherche des créneaux...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center text-xs text-slate-400 font-medium">
                        Aucun créneau libre pour ce jour.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-1.5 text-xs rounded-lg border font-semibold transition-all ${
                              selectedSlot === slot
                                ? 'bg-medBlue-600 border-medBlue-600 text-white'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 3 : Notes */}
                {selectedSlot && (
                  <div className="relative">
                    <Input
                      label="Notes / Motif de consultation"
                      id="notes"
                      type="textarea"
                      placeholder="Indiquez brièvement le motif du rendez-vous..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}

                {/* Bouton Validation */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-center"
                  disabled={booking || (selectedDate && !selectedSlot)}
                >
                  {!token
                    ? 'Se connecter pour réserver'
                    : booking
                    ? 'Réservation en cours...'
                    : 'Confirmer le rendez-vous'}
                </Button>
              </form>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

export default DoctorProfile;
