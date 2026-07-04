import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Users, Search, AlertCircle, ShieldAlert, Check, X } from 'lucide-react';
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
      const url = new URL(`${VITE_API_URL}/users`);
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
  }, [token, roleFilter]); // Re-fetch on filter change. Search will trigger on form submit.

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
      // Mettre à jour l'utilisateur localement dans la liste
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 m-0">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Activez ou désactivez les comptes des médecins et des patients.
        </p>
      </div>

      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3 text-sm flex items-center gap-2">
          <Check size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {/* Barre de recherche et filtre */}
      <Card className="p-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <Input
              label="Rechercher par nom"
              id="search-user"
              placeholder="Saisir un nom..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1.5 w-full sm:w-48 text-left">
            <label htmlFor="role-filter" className="text-sm font-semibold text-slate-700">
              Rôle
            </label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-medBlue-500 focus:border-transparent"
            >
              <option value="">Tous</option>
              <option value="patient">Patients</option>
              <option value="doctor">Médecins</option>
              <option value="admin">Administrateurs</option>
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full sm:w-auto h-10 flex items-center gap-1.5">
            <Search size={16} />
            Rechercher
          </Button>
        </form>
      </Card>

      {/* Table des utilisateurs */}
      <Card className="p-0 overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medBlue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle / Spécialité</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{u.phone || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                      <div className="flex flex-col">
                        <Badge>{u.role}</Badge>
                        {u.role === 'doctor' && (
                          <span className="text-[10px] text-medBlue-600 font-semibold mt-0.5">
                            ({u.doctorProfile?.specialty?.name || 'Généraliste'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {u.isActive ? 'Actif' : 'Bloqué'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                      {u._id === user._id ? (
                        <span className="text-xs text-slate-400 font-medium">Vous</span>
                      ) : u.role === 'admin' ? (
                        <span className="text-xs text-slate-400 font-medium">-</span>
                      ) : (
                        <Button
                          variant={u.isActive ? 'outline' : 'primary'}
                          size="sm"
                          disabled={togglingId === u._id}
                          onClick={() => handleToggleStatus(u._id)}
                          className={u.isActive ? 'text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200' : ''}
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
      </Card>
    </div>
  );
};

export default UserManagement;
