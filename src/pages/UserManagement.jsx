import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Users, Search, AlertCircle, Check, Sparkles, Filter, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Badge from '../components/Badge';

const UserManagement = () => {
  const { token, user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const url = new URL(`${API_URL}/users`);
      if (search) url.searchParams.append('search', search);
      if (roleFilter) url.searchParams.append('role', roleFilter);

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, roleFilter]); // Re-fetch on filter change. Search triggers on submit.

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    setTogglingId(userId);
    setActionError('');
    setActionSuccess('');
    
    try {
      const res = await fetch(`${API_URL}/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la modification du statut');
      }

      setActionSuccess(data.message);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-4 py-8 space-y-6 text-left relative overflow-hidden">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-end pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Utilisateurs</h1>
          <p className="text-xs text-slate-400 font-medium">Activer, désactiver ou modérer les comptes médecins et patients</p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
          <Sparkles size={12} className="text-medBlue-500" />
          <span>Gestion des rôles</span>
        </div>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} className="text-red-550 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Barre de recherche et filtre */}
      <div className="glass-effect rounded-2xl p-5 shadow-xl shadow-slate-100/50">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Rechercher par nom"
              id="search-user"
              placeholder="Ex: Jean Dupont..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-xl"
            />
          </div>
          
          <div className="flex flex-col gap-1.5 w-full sm:w-48 text-left">
            <label htmlFor="role-filter" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Rôle
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-3 text-xs rounded-xl border border-slate-200 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-semibold text-slate-700"
            >
              <option value="">Tous les utilisateurs</option>
              <option value="patient">Patients</option>
              <option value="doctor">Médecins</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full sm:w-auto h-11 bg-gradient-to-tr from-medBlue-600 to-cyan-500 border-none font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-medBlue-100"
          >
            <Search size={14} />
            Rechercher
          </Button>
        </form>
      </div>

      {/* Table des utilisateurs */}
      <div className="glass-effect rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden border border-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medBlue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold">
            <Users size={38} className="mx-auto text-slate-200 mb-2 shrink-0" />
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Rôle / Spécialité</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{u.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      <div className="flex flex-col text-left">
                        <Badge variant={u.role === 'admin' ? 'danger' : u.role === 'doctor' ? 'success' : 'default'}>
                          {u.role}
                        </Badge>
                        {u.role === 'doctor' && (
                          <span className="text-[10px] text-medBlue-600 font-bold mt-0.5">
                            ({u.doctorProfile?.specialty?.name || 'Généraliste'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.isActive ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      {u._id === user._id ? (
                        <span className="text-xs text-slate-400 font-bold">Vous</span>
                      ) : u.role === 'admin' ? (
                        <span className="text-xs text-slate-400 font-bold">-</span>
                      ) : (
                        <Button
                          variant={u.isActive ? 'outline' : 'primary'}
                          size="sm"
                          disabled={togglingId === u._id}
                          onClick={() => handleToggleStatus(u._id)}
                          className={`font-bold rounded-xl text-xs py-1.5 px-3.5 ${
                            u.isActive 
                              ? 'text-red-650 hover:text-red-755 hover:bg-red-50/50 border-red-200' 
                              : 'bg-slate-900 hover:bg-slate-800 border-none text-white'
                          }`}
                        >
                          {togglingId === u._id
                            ? '...'
                            : u.isActive
                            ? 'Désactiver'
                            : 'Activer'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserManagement;
