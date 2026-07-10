import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { MapPin, Calendar, BookOpen, User, AlertCircle, Sparkles, Star, Award, GraduationCap, CheckCircle2 } from 'lucide-react';
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
  const [recapModalOpen, setRecapModalOpen] = useState(false);

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

  const handlePreBooking = (e) => {
    e.preventDefault();
    if (!token) {
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
    setRecapModalOpen(true);
  };

  const handleBooking = async () => {
    setRecapModalOpen(false);
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
          <p className="text-slate-400 text-xs font-medium">Chargement de la fiche médecin...</p>
        </div>
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

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-8 space-y-8">
      
      {/* Grid Profil */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Infos Médecin (2/3 de l'écran) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card Profil Principale */}
          <div className="glass-effect rounded-3xl p-6 text-left flex flex-col sm:flex-row gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-medBlue-500/5 rounded-full blur-2xl" />
            
            <img
              src={doctor.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250"}
              alt={doctor.name}
              className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-100/80 shadow-md shrink-0 self-start sm:self-center"
            />
            
            <div className="space-y-4 z-10">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 leading-tight flex items-center gap-2">
                  {doctor.name}
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 shrink-0" />
                </h1>
                <p className="text-xs font-bold text-medBlue-600 uppercase tracking-widest">
                  {doctor.doctorProfile?.specialty?.name || 'Médecin Généraliste'}
                </p>
              </div>

              {/* Badges de stats premium */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 shrink-0" /> 
                  4.9
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-medBlue-500 shrink-0" />
                  {doctor.doctorProfile.experience} ans d'expérience
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-800">
                  {doctor.doctorProfile.fees ? `${doctor.doctorProfile.fees.toLocaleString('fr-FR')} FCFA` : 'Non spécifié'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="font-medium">{doctor.doctorProfile.address || 'Sénégal'}</span>
              </div>
            </div>
          </div>

          {/* Biographie & Formation */}
          <div className="glass-effect rounded-3xl p-6 text-left space-y-6">
            {doctor.doctorProfile.biography && (
              <div className="space-y-2">
                <h3 className="font-bold font-outfit text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <User size={16} className="text-medBlue-600 shrink-0" /> 
                  Biographie & Présentation
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{doctor.doctorProfile.biography}</p>
              </div>
            )}

            {doctor.doctorProfile.education && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold font-outfit text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-50">
                  <GraduationCap size={18} className="text-medBlue-600 shrink-0" /> 
                  Formation & Cursus académique
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{doctor.doctorProfile.education}</p>
              </div>
            )}
          </div>
        </div>

        {/* Formulaire de réservation (1/3 de l'écran) */}
        <div className="lg:col-span-1">
          <div className="glass-effect rounded-3xl p-6 text-left sticky top-20 shadow-xl shadow-slate-100/50">
            <h3 className="font-bold font-outfit text-sm text-slate-800 mb-4 flex items-center gap-2 pb-3 border-b border-slate-50 uppercase tracking-wider">
              <Calendar size={16} className="text-medBlue-600 shrink-0" />
              Prendre rendez-vous
            </h3>

            {success ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl p-4 text-center space-y-4 shadow-xs">
                <p className="text-xs font-semibold leading-relaxed">{success}</p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate('/appointments')} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs border-none"
                >
                  Voir mes rendez-vous
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePreBooking} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-700 text-xs">
                    <AlertCircle className="shrink-0 mt-0.5" size={15} />
                    <span className="font-medium leading-normal">{error}</span>
                  </div>
                )}

                {/* Étape 1 : Choisir Date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="booking-date" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    1. Choisir une date
                  </label>
                  <input
                    type="date"
                    id="booking-date"
                    min={todayStr}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3.5 py-3 text-xs rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-medium text-slate-700"
                    required
                  />
                </div>

                {/* Étape 2 : Choisir Créneau */}
                {selectedDate && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                      2. Choisir un créneau horaire
                    </label>

                    {loadingSlots ? (
                      <div className="text-xs text-slate-400 py-4 text-center font-medium">Recherche des créneaux...</div>
                    ) : availableSlots.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-center text-xs text-slate-400 font-bold">
                        Aucun créneau libre pour ce jour.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 text-xs rounded-xl border font-bold transition-all ${
                              selectedSlot === slot
                                ? 'bg-medBlue-600 border-medBlue-600 text-white shadow-md shadow-medBlue-100'
                                : 'bg-white border-slate-150 text-slate-700 hover:bg-slate-50'
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
                      label="3. Motif de la consultation"
                      id="notes"
                      type="textarea"
                      placeholder="Ex: Consultation de contrôle, certificat médical..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                )}

                {/* Bouton Validation */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs border-none shadow-md"
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
      </div>
      </div>
      </div>
    
    {/* Modale récapitulative avant confirmation */}
    <Modal
      isOpen={recapModalOpen}
      onClose={() => setRecapModalOpen(false)}
      title="Récapitulatif de votre rendez-vous"
      footer={
        <div className="flex gap-2 w-full justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRecapModalOpen(false)}
            className="rounded-xl font-bold border-slate-200 text-xs px-4"
          >
            Modifier
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBooking}
            className="rounded-xl font-bold text-xs px-4 bg-slate-900 border-none hover:bg-slate-800 text-white"
          >
            Confirmer la réservation
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs text-slate-600 font-medium text-left p-1">
        <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
          <img 
            src={doctor.doctorProfile.profileImage || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"} 
            alt={doctor.name} 
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100"
          />
          <div>
            <p className="font-bold text-slate-800 text-sm">{doctor.name}</p>
            <p className="text-medBlue-600 font-bold text-[10px] uppercase tracking-wider mt-0.5">
              {doctor.doctorProfile?.specialty?.name || 'Généraliste'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 bg-white/50 p-2.5 rounded-2xl border border-slate-100/50 divide-y divide-slate-100">
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date de consultation</span>
            <span className="font-bold text-slate-850">
              {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Heure / Créneau</span>
            <span className="font-bold text-slate-850">{selectedSlot}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Lieu de consultation</span>
            <span className="font-bold text-slate-850 truncate max-w-[200px]">{doctor.doctorProfile.address || 'Sénégal'}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Honoraires</span>
            <span className="font-extrabold text-slate-800 text-sm">
              {doctor.doctorProfile.fees ? `${doctor.doctorProfile.fees.toLocaleString('fr-FR')} FCFA` : 'Non spécifié'}
            </span>
          </div>
        </div>

        {notes && (
          <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
            <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Motif de consultation</p>
            <p className="text-slate-650 leading-relaxed font-medium italic mt-0.5">"{notes}"</p>
          </div>
        )}
      </div>
    </Modal>
    </div>
  );
};

export default DoctorProfile;
