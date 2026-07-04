import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Settings, Plus, Edit2, Trash2, AlertCircle, Check } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Modal from '../components/Modal';

const SpecialtyManagement = () => {
  const { token } = useAuth();
  
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États de la modale d'édition/création
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  
  // Champs formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Activity');
  
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // État de la modale d'effacement
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchSpecialties = async () => {
    try {
      const res = await fetch(`${API_URL}/specialties`);
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data);
      }
    } catch (err) {
      console.error('Erreur chargement spécialités:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const openCreateModal = () => {
    setModalType('create');
    setEditingId(null);
    setName('');
    setDescription('');
    setIcon('Activity');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (spec) => {
    setModalType('edit');
    setEditingId(spec._id);
    setName(spec.name);
    setDescription(spec.description || '');
    setIcon(spec.icon || 'Activity');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const payload = { name, description, icon };
    const method = modalType === 'create' ? 'POST' : 'PUT';
    const url = modalType === 'create' 
      ? `${API_URL}/specialties` 
      : `${API_URL}/specialties/${editingId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur d'enregistrement");
      }

      setModalOpen(false);
      setMessage({
        type: 'success',
        text: `Spécialité ${modalType === 'create' ? 'créée' : 'modifiée'} avec succès.`
      });
      fetchSpecialties();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch(`${API_URL}/specialties/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      setDeleteModalOpen(false);
      setMessage({ type: 'success', text: 'Spécialité supprimée avec succès.' });
      fetchSpecialties();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 m-0">Gestion des spécialités</h1>
          <p className="text-sm text-slate-500 mt-1">Créez ou modifiez les spécialités affichées pour la recherche.</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-1.5 shadow-md shadow-medBlue-100">
          <Plus size={16} /> Ajouter une spécialité
        </Button>
      </div>

      {message.text && (
        <div className={`rounded-xl p-3 text-sm flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table des spécialités */}
      <Card className="p-0 overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medBlue-600"></div>
          </div>
        ) : specialties.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            <Settings size={32} className="mx-auto text-slate-300 mb-2" />
            Aucune spécialité configurée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Icône</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-sm">
                {specialties.map((spec) => (
                  <tr key={spec._id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex p-2 bg-medBlue-50 text-medBlue-600 rounded-xl font-bold">
                        {spec.icon || 'Activity'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{spec.name}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{spec.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(spec)}
                        className="text-slate-600 hover:text-medBlue-600 border-slate-200"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(spec._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modale d'édition / création */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'create' ? 'Créer une spécialité' : 'Modifier la spécialité'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Fermer
            </Button>
            <Button variant="primary" size="sm" onClick={handleFormSubmit} disabled={submitting}>
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          {formError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-sm flex gap-1.5 items-center">
              <AlertCircle size={16} />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Nom de la spécialité"
            id="spec-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Cardiologie, Dentiste..."
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="spec-icon" className="text-sm font-semibold text-slate-700">Icône</label>
            <select
              id="spec-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-medBlue-500"
            >
              <option value="Heart">Cœur (Cardiologie)</option>
              <option value="Eye">Œil (Ophtalmologie)</option>
              <option value="Baby">Bébé (Pédiatrie)</option>
              <option value="Smile">Sourire (Dentiste)</option>
              <option value="Activity">Activité (Généraliste/Autre)</option>
            </select>
          </div>

          <Input
            label="Description"
            id="spec-desc"
            type="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la spécialité..."
          />
        </form>
      </Modal>

      {/* Modale d'effacement */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer la spécialité"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Fermer
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500 text-left">
          Êtes-vous sûr de vouloir supprimer cette spécialité ? Cela n'affectera pas directement les comptes des médecins existants, mais ils n'apparaîtront plus sous cette catégorie dans les résultats de recherche.
        </p>
      </Modal>
    </div>
  );
};

export default SpecialtyManagement;
