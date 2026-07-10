import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Shield, Users, Calendar, Settings, ArrowUpRight, Clock, AlertCircle, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Users
        const usersRes = await fetch(`${API_URL}/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usersData = await usersRes.json();
        setUsers(usersData);

        // Appointments
        const appRes = await fetch(`${API_URL}/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appData = await appRes.json();
        setAppointments(appData);

        // Specialties
        const specRes = await fetch(`${API_URL}/specialties`);
        const specData = await specRes.json();
        setSpecialties(specData);
      } catch (err) {
        console.error('Erreur chargement admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAdminData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
          <p className="text-slate-400 text-xs font-medium">Chargement des données administratives...</p>
        </div>
      </div>
    );
  }

  // Calculer les métriques
  const patientCount = users.filter(u => u.role === 'patient').length;
  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const activeDoctorCount = users.filter(u => u.role === 'doctor' && u.isActive).length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

  // Prendre les 5 derniers rendez-vous
  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-4 py-8 space-y-8 text-left relative overflow-hidden">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Console Admin</h1>
          <p className="text-xs text-slate-400 font-medium">Gérez le fonctionnement et suivez l'activité de la plateforme MediRdv</p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
          <Sparkles size={12} className="text-medBlue-500" />
          <span>Accès Super-Administrateur</span>
        </div>
      </div>

      {/* Grid de Stats Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-effect p-5 flex items-center justify-between rounded-2xl shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl font-black font-outfit text-slate-800">{users.length}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Utilisateurs</p>
          </div>
          <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-effect p-5 flex items-center justify-between rounded-2xl shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl font-black font-outfit text-slate-800">{doctorCount}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Médecins Actifs</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">({activeDoctorCount} validés)</p>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
        </div>

        <div className="glass-effect p-5 flex items-center justify-between rounded-2xl shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl font-black font-outfit text-slate-800">{totalAppointments}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rendez-vous créés</p>
            <p className="text-[9px] text-slate-400 font-semibold uppercase">({pendingAppointments} en attente)</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
            <Calendar size={20} />
          </div>
        </div>

        <div className="glass-effect p-5 flex items-center justify-between rounded-2xl shadow-xs">
          <div className="space-y-1">
            <span className="text-3xl font-black font-outfit text-slate-800">{specialties.length}</span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spécialités</p>
          </div>
          <div className="w-11 h-11 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <Settings size={20} />
          </div>
        </div>
      </div>

      {/* Raccourcis & Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions d'administration */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold font-outfit text-sm text-slate-800 mb-2 uppercase tracking-wider">Raccourcis rapides</h3>
          
          <div 
            className="glass-effect hover-card-effect p-4.5 cursor-pointer flex justify-between items-center rounded-2xl shadow-xs" 
            onClick={() => navigate('/admin/users')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                <Users size={18} />
              </div>
              <div className="text-left">
                <h4 className="font-bold font-outfit text-sm text-slate-800 m-0">Gestion Utilisateurs</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Activer/désactiver des comptes médecins ou patients.</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 shrink-0" />
          </div>

          <div 
            className="glass-effect hover-card-effect p-4.5 cursor-pointer flex justify-between items-center rounded-2xl shadow-xs" 
            onClick={() => navigate('/admin/specialties')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <Settings size={18} />
              </div>
              <div className="text-left">
                <h4 className="font-bold font-outfit text-sm text-slate-800 m-0">Gestion Spécialités</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Ajouter, modifier ou supprimer des spécialités médicales.</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Dernières réservations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold font-outfit text-sm text-slate-800 mb-2 uppercase tracking-wider font-bold">Rendez-vous récents</h3>
          
          {recentAppointments.length === 0 ? (
            <Card className="text-center py-10 glass-effect border-dashed border-2 border-slate-200 rounded-2xl">
              <AlertCircle className="mx-auto text-slate-300 mb-1" size={32} />
              <p className="text-xs text-slate-400 font-bold">Aucun rendez-vous enregistré.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((app) => (
                <div key={app._id} className="glass-effect p-4 flex justify-between items-center gap-4 rounded-2xl shadow-xs hover-card-effect">
                  <div className="text-left space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold font-outfit text-sm text-slate-800 truncate">Patient: {app.patient.name}</span>
                      <Badge variant={app.status === 'confirmed' ? 'success' : app.status === 'pending' ? 'warning' : 'danger'}>
                        {app.status === 'confirmed' ? 'Validé' : app.status === 'pending' ? 'En attente' : 'Annulé'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate leading-relaxed">
                      Avec <strong>{app.doctor.name}</strong> ({app.doctor.doctorProfile?.specialty?.name || 'Généraliste'})
                    </p>
                    <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-bold">
                      <span>📅 {new Date(app.date).toLocaleDateString('fr-FR')}</span>
                      <span>⏰ {app.slot}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
