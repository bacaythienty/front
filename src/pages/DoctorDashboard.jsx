import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  Calendar, User, Clock, AlertCircle, FileText, CheckCircle, 
  XCircle, MapPin, DollarSign, Award, BookOpen, Sparkles, CheckCircle2 
} from 'lucide-react';
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
  
  // États pour les détails du rendez-vous
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setProfileError("La photo de profil est trop volumineuse (max. 2 Mo)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
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
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
          <p className="text-slate-400 text-xs font-medium">Chargement de votre espace médecin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-8 space-y-8 text-left">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Espace Médecin</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 mt-1">
            Spécialité : <span className="text-medBlue-600 font-bold">{user?.doctorProfile?.specialty?.name || 'Généraliste'}</span>
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
          <Sparkles size={12} className="text-medBlue-500" />
          <span>Tableau de bord sécurisé</span>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex border-b border-slate-100/80 gap-6">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'appointments'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Demandes & Consultations
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-medBlue-600 text-medBlue-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Mon Profil Médecin
        </button>
      </div>

      {activeTab === 'appointments' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Section Stats (colonne de gauche) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-effect p-4 flex items-center gap-4 rounded-2xl shadow-xs">
              <div className="w-10 h-10 bg-medBlue-50 text-medBlue-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-2xl font-black font-outfit text-slate-800">{consultationsToday}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aujourd'hui</p>
              </div>
            </div>

            <div className="glass-effect p-4 flex items-center gap-4 rounded-2xl shadow-xs">
              <div className="w-10 h-10 bg-amber-50 text-amber-650 rounded-xl flex items-center justify-center shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-2xl font-black font-outfit text-slate-800">{pendingCount}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">En attente</p>
              </div>
            </div>

            <div className="glass-effect p-4 flex items-center gap-4 rounded-2xl shadow-xs">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-emerald-500 fill-emerald-50" />
              </div>
              <div className="min-w-0">
                <span className="text-2xl font-black font-outfit text-slate-800">{totalCount}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultations actives</p>
              </div>
            </div>
          </div>

          {/* Liste des rendez-vous */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-bold font-outfit text-sm text-slate-800 mb-2 uppercase tracking-wider">Demandes de rendez-vous</h3>
            
            {appointments.length === 0 ? (
              <Card className="text-center py-20 glass-effect border-dashed border-2 border-slate-200 rounded-3xl">
                <Calendar className="mx-auto text-slate-300 mb-3" size={44} />
                <h4 className="font-bold font-outfit text-slate-800 text-sm">Aucun rendez-vous pour le moment</h4>
                <p className="text-xs text-slate-400 mt-1">Les demandes de vos patients s'afficheront ici.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {appointments.map((app) => (
                  <div 
                    key={app._id} 
                    className="glass-effect p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl hover-card-effect shadow-xs"
                  >
                    <div className="space-y-2 text-left min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold font-outfit text-sm text-slate-800 m-0">{app.patient.name}</h4>
                        <Badge variant={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'danger'}>
                          {app.status === 'confirmed' ? 'Validé' : app.status === 'pending' ? 'En attente' : 'Annulé'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
                        <span>📅 {new Date(app.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                        <span>⏰ {app.slot}</span>
                        <span>📞 {app.patient.phone || 'Aucun numéro'}</span>
                      </div>
                      
                      {app.notes && (
                        <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 max-w-xl">
                          <FileText size={13} className="shrink-0 mt-0.5 text-slate-400" />
                          <span className="leading-relaxed font-medium"><strong>Motif :</strong> {app.notes}</span>
                        </div>
                      )}
                    {/* Boutons d'actions */}
                    <div className="flex gap-2 self-start sm:self-center shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailModalOpen(true);
                        }}
                        className="text-slate-650 hover:text-slate-755 hover:bg-slate-50 border-slate-200 font-bold rounded-xl text-xs py-2 px-4"
                      >
                        Détails
                      </Button>
                      {app.status === 'pending' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openActionModal('confirm', app._id)}
                          className="flex items-center gap-1 text-white bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl text-xs py-2 px-4"
                        >
                          <CheckCircle size={13} /> Valider
                        </Button>
                      )}
                      {app.status !== 'cancelled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal('cancel', app._id)}
                          className="text-red-650 hover:text-red-755 hover:bg-red-50/50 border-red-200 flex items-center gap-1.5 font-bold rounded-xl text-xs py-2 px-4"
                        >
                          <XCircle size={13} /> Annuler
                        </Button>
                      )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Formulaire Modification Profil */
        <div className="glass-effect rounded-3xl p-6 shadow-xl shadow-slate-100/50 max-w-2xl text-left">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div>
              <h3 className="font-bold font-outfit text-sm text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-50">
                Informations du cabinet
              </h3>
            </div>
            
            {profileSuccess && (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-xs font-semibold">
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="bg-red-50 border border-red-100 text-red-705 rounded-xl p-3 text-xs font-semibold flex gap-2 items-center">
                <AlertCircle size={15} />
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
                className="rounded-xl"
              />
              <Input
                label="Téléphone de contact"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Honoraires (FCFA)"
                id="fees"
                type="number"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="rounded-xl"
              />
              <Input
                label="Expérience (Années)"
                id="experience"
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="rounded-xl"
              />
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Photo de profil</label>
                <div className="flex items-center gap-3">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Aperçu"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 ring-2 ring-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">IMG</div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-slate-500
                      file:mr-2 file:py-1.5 file:px-3
                      file:rounded-xl file:border-0
                      file:text-xs file:font-semibold
                      file:bg-medBlue-50 file:text-medBlue-700
                      hover:file:bg-medBlue-100 transition-colors cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <Input
              label="Adresse du Cabinet / Clinique"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex: Quartier Escale, Thiès"
              className="rounded-xl"
            />

            <Input
              label="Formation, Diplômes & Cursus"
              id="education"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Ex: Doctorat d'État en Médecine..."
              className="rounded-xl"
            />

            <Input
              label="Biographie & Présentation"
              id="biography"
              type="textarea"
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Présentez votre spécialité, votre approche et vos horaires..."
              className="rounded-xl"
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                disabled={updatingProfile}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs border-none"
              >
                {updatingProfile ? 'Enregistrement...' : 'Enregistrer mon Profil'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modal confirmation valider/annuler */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', appId: null })}
        title={actionModal.type === 'confirm' ? 'Valider le rendez-vous' : 'Annuler le rendez-vous'}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActionModal({ isOpen: false, type: '', appId: null })}
              className="rounded-xl font-bold border-slate-200 text-xs px-4"
            >
              Fermer
            </Button>
            <Button
              variant={actionModal.type === 'confirm' ? 'primary' : 'danger'}
              size="sm"
              onClick={handleActionConfirm}
              disabled={actionLoading}
              className="rounded-xl font-bold text-xs px-4 border-none"
            >
              {actionLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-left p-1">
          {actionError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-750 text-xs flex gap-2 items-center">
              <AlertCircle size={15} />
              <span>{actionError}</span>
            </div>
          )}
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {actionModal.type === 'confirm'
              ? 'Êtes-vous sûr de vouloir valider ce rendez-vous ? Le patient sera notifié instantanément.'
              : 'Êtes-vous sûr de vouloir annuler ce rendez-vous ? Le patient sera averti de cette annulation.'}
          </p>
        </div>
      </Modal>

      {/* Modale de détails du rendez-vous pour le médecin */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Détails du rendez-vous patient"
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
            {selectedApp?.status === 'pending' && (
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  openActionModal('confirm', selectedApp._id);
                }}
                className="rounded-xl font-bold text-xs px-4 text-white bg-emerald-600 border-none"
              >
                Valider
              </Button>
            )}
            {selectedApp?.status !== 'cancelled' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setDetailModalOpen(false);
                  openActionModal('cancel', selectedApp._id);
                }}
                className="rounded-xl font-bold text-xs px-4"
              >
                Annuler RDV
              </Button>
            )}
          </div>
        }
      >
        {selectedApp && (
          <div className="space-y-4 text-xs text-slate-600 font-medium text-left p-1">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Informations du Patient</p>
              <p className="font-bold text-slate-800 text-sm">{selectedApp.patient.name}</p>
              <p className="text-slate-500 font-semibold mt-1">📞 {selectedApp.patient.phone || 'Non spécifié'}</p>
              <p className="text-slate-500 font-semibold">📧 {selectedApp.patient.email}</p>
            </div>

            <div className="space-y-2.5 bg-white/50 p-2.5 rounded-2xl border border-slate-100/50 divide-y divide-slate-100">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Statut du rendez-vous</span>
                <Badge variant={selectedApp.status === 'confirmed' ? 'success' : selectedApp.status === 'pending' ? 'warning' : 'danger'}>
                  {selectedApp.status === 'confirmed' ? 'Validé' : selectedApp.status === 'pending' ? 'En attente' : 'Annulé'}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Date de consultation</span>
                <span className="font-bold text-slate-850">
                  {new Date(selectedApp.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Heure</span>
                <span className="font-bold text-slate-850">{selectedApp.slot}</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Honoraires</span>
                <span className="font-extrabold text-slate-800 text-sm">
                  {fees ? `${fees.toLocaleString('fr-FR')} FCFA` : 'Non spécifié'}
                </span>
              </div>
            </div>

            {selectedApp.notes && (
              <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Motif de consultation (Notes du patient)</p>
                <p className="text-slate-650 leading-relaxed font-medium mt-0.5">"{selectedApp.notes}"</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
