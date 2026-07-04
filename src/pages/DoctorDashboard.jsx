import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Calendar, User, Clock, AlertCircle, FileText, CheckCircle, XCircle, MapPin, DollarSign, Award, BookOpen } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Modal from '../components/Modal';

const DoctorDashboard = () => {
  const { token, user, refreshUser } = useAuth();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'profile'
  
  // États de mise à jour profil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [biography, setBiography] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState(0);
  const [fees, setFees] = useState(0);
  const [profileImage, setProfileImage] = useState('');
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // États pour les modals d'action
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', appId: null });
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = async () => {
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
      console.error('Erreur chargement RDV:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
    
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBiography(user.doctorProfile?.biography || '');
      setAddress(user.doctorProfile?.address || '');
      setEducation(user.doctorProfile?.education || '');
      setExperience(user.doctorProfile?.experience || 0);
      setFees(user.doctorProfile?.fees || 0);
      setProfileImage(user.doctorProfile?.profileImage || '');
    }
  }, [token, user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdatingProfile(true);

    try {
      const res = await fetch(`${API_URL}/users/doctor/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          phone,
          biography,
          address,
          education,
          experience: Number(experience),
          fees: Number(fees),
          profileImage
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur de mise à jour');
      }

      setProfileSuccess('Votre profil a bien été mis à jour.');
      refreshUser();
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const openActionModal = (type, appId) => {
    setActionModal({ isOpen: true, type, appId });
    setActionError('');
  };

  const handleActionConfirm = async () => {
    setActionLoading(true);
    setActionError('');
    const { type, appId } = actionModal;
    
    let url = `${API_URL}/appointments/${appId}/cancel`;
    if (type === 'confirm') {
      url = `${API_URL}/appointments/${appId}/confirm`;
    }

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors du traitement');
      }

      setActionModal({ isOpen: false, type: '', appId: null });
      fetchAppointments();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Statistiques
  const todayStr = new Date().toISOString().split('T')[0];
  const consultationsToday = appointments.filter(app => {
    if (app.status === 'cancelled') return false;
    const appDateStr = new Date(app.date).toISOString().split('T')[0];
    return appDateStr === todayStr;
  }).length;

  const pendingCount = appointments.filter(app => app.status === 'pending').length;
  const totalCount = appointments.filter(app => app.status !== 'cancelled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 m-0">Bonjour, {user?.name}</h1>
        <p className="text-sm text-slate-500 mt-1">
          Spécialité : <span className="font-bold text-medBlue-600">{user?.doctorProfile?.specialty?.name || 'Généraliste'}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Rendez-vous
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Modifier mon Profil
        </button>
      </div>

      {activeTab === 'appointments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats de gauche */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 flex items-center gap-4 bg-white">
              <div className="p-3 bg-medBlue-50 text-medBlue-600 rounded-xl">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800">{consultationsToday}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase">Consultations aujourd'hui</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 bg-white">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle size={20} />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800">{pendingCount}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase">En attente de validation</p>
              </div>
            </Card>

            <Card className="p-4 flex items-center gap-4 bg-white">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-800">{totalCount}</span>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total consultations actives</p>
              </div>
            </Card>
          </div>

          {/* Liste des rendez-vous */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold text-base text-slate-800 mb-2">Historique et demandes</h3>
            
            {appointments.length === 0 ? (
              <Card className="text-center py-16 bg-slate-50 border-dashed border-2 border-slate-200">
                <Calendar className="mx-auto text-slate-300 mb-2" size={40} />
                <h4 className="font-bold text-slate-700">Aucune demande</h4>
                <p className="text-sm text-slate-400 mt-1">Vous n'avez aucun rendez-vous pour le moment.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <Card key={app._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-slate-800 m-0">{app.patient.name}</h4>
                        <Badge>{app.status}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                        <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                        <span>⏰ {app.slot}</span>
                        <span>📞 {app.patient.phone || 'Non spécifié'}</span>
                      </div>
                      
                      {app.notes && (
                        <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start gap-1 max-w-xl">
                          <FileText size={12} className="shrink-0 mt-0.5" />
                          <span><strong>Motif :</strong> {app.notes}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 self-start sm:self-center shrink-0">
                      {app.status === 'pending' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openActionModal('confirm', app._id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle size={14} /> Valider
                        </Button>
                      )}
                      {app.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal('cancel', app._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-1"
                        >
                          <XCircle size={14} /> Annuler
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Formulaire Modification Profil */
        <Card className="max-w-2xl">
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h3 className="font-bold text-base text-slate-800 border-b border-slate-100 pb-3 mb-2">Informations Générales</h3>
            
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-3 text-sm">
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg p-3 text-sm flex gap-1.5 items-center">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nom complet"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Téléphone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Honoraires Consultation (€)"
                id="fees"
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
              />
              <Input
                label="Années d'expérience"
                id="experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
              <Input
                label="Photo de profil (URL)"
                id="profileImage"
                type="text"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <Input
              label="Adresse du Cabinet"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Rue de la santé, Paris"
            />

            <Input
              label="Formation / Diplômes"
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Doctorat d'État en Médecine..."
            />

            <Input
              label="Biographie / Description"
              id="biography"
              type="textarea"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Décrivez votre parcours..."
            />

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button type="submit" variant="primary" disabled={updatingProfile}>
                {updatingProfile ? 'Enregistrement...' : 'Enregistrer le Profil'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Modal confirmation valider/annuler */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', appId: null })}
        title={actionModal.type === 'confirm' ? 'Valider le rendez-vous' : 'Annuler le rendez-vous'}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal({ isOpen: false, type: '', appId: null })}
            >
              Fermer
            </Button>
            <Button
              variant={actionModal.type === 'confirm' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleActionConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-left">
          {actionError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-sm flex gap-1.5 items-center">
              <AlertCircle size={16} />
              <span>{actionError}</span>
            </div>
          )}
          <p className="text-sm text-slate-500">
            {actionModal.type === 'confirm'
              ? 'Êtes-vous sûr de vouloir valider ce rendez-vous ? Le patient sera averti de la confirmation.'
              : 'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action libérera le créneau.'}
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
