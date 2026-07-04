import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Shield, Users, Calendar, Settings, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  // Calculer les métriques
  const patientCount = users.filter(u => u.role === 'patient').length;
  const doctorCount = users.filter(u => u.role === 'doctor').length;
  const activeDoctorCount = users.filter(u => u.role === 'doctor' && u.isActive).length;
  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;

  // Prendre les 5 derniers rendez-vous
  const recentAppointments = appointments.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 m-0">Tableau de bord Administrateur</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez le fonctionnement et suivez l'activité de la plateforme.</p>
        </div>
      </div>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-5 flex items-center justify-between bg-white">
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-800">{users.length}</span>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Utilisateurs</p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
            <Users size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-800">{doctorCount}</span>
            <p className="text-xs text-slate-400 font-bold uppercase">Médecins Actifs</p>
            <p className="text-[10px] text-slate-400 font-medium">({activeDoctorCount} validés)</p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Users size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-800">{totalAppointments}</span>
            <p className="text-xs text-slate-400 font-bold uppercase">Rendez-vous créés</p>
            <p className="text-[10px] text-slate-400 font-medium">({pendingAppointments} en attente)</p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Calendar size={22} />
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between bg-white">
          <div className="space-y-1">
            <span className="text-3xl font-black text-slate-800">{specialties.length}</span>
            <p className="text-xs text-slate-400 font-bold uppercase">Spécialités</p>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
            <Settings size={22} />
          </div>
        </Card>
      </div>

      {/* Raccourcis & Activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actions d'administration */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-base text-slate-800 mb-2">Actions rapides</h3>
          
          <Card className="p-4 hover:border-medBlue-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center bg-white" onClick={() => navigate('/admin/users')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 m-0">Gestion Utilisateurs</h4>
                <p className="text-xs text-slate-400">Activer/désactiver les médecins et patients.</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </Card>

          <Card className="p-4 hover:border-medBlue-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center bg-white" onClick={() => navigate('/admin/specialties')}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Settings size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 m-0">Gestion Spécialités</h4>
                <p className="text-xs text-slate-400">Créer ou éditer les spécialités médicales.</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </Card>
        </div>

        {/* Dernières réservations */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-base text-slate-800 mb-2">Rendez-vous récents</h3>
          
          {recentAppointments.length === 0 ? (
            <Card className="text-center py-10 bg-slate-50 border-dashed border-2 border-slate-200">
              <AlertCircle className="mx-auto text-slate-300 mb-1" size={32} />
              <p className="text-sm text-slate-500 font-medium">Aucun rendez-vous dans le système.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((app) => (
                <Card key={app._id} className="p-4 flex justify-between items-center gap-4 bg-white">
                  <div className="text-left space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-800 truncate">Patient: {app.patient.name}</span>
                      <Badge>{app.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      Avec <strong>{app.doctor.name}</strong> ({app.doctor.doctorProfile?.specialty?.name || 'Généraliste'})
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      📅 {new Date(app.date).toLocaleDateString('fr-FR')} à {app.slot}
                    </p>
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

export default AdminDashboard;
