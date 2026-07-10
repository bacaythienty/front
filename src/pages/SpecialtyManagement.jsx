import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Settings, Plus, Edit2, Trash2, AlertCircle, Check, Sparkles } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-1 sm:px-4 py-8 space-y-6 text-left relative overflow-hidden">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Spécialités</h1>
          <p className="text-xs text-slate-400 font-medium">Configurez les spécialités médicales disponibles sur la plateforme</p>
        </div>
        <Button 
          variant="primary" 
          onClick={openCreateModal} 
          className="flex items-center gap-1.5 bg-gradient-to-tr from-medBlue-600 to-cyan-500 border-none font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-medBlue-100"
        >
          <Plus size={14} /> 
          Ajouter une spécialité
        </Button>
      </div>

      {message.text && (
        <div className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <Check size={14} className="text-emerald-500 shrink-0" /> : <AlertCircle size={14} className="text-red-550 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Table des spécialités */}
      <div className="glass-effect rounded-2xl shadow-xl shadow-slate-100/50 overflow-hidden border border-slate-100">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-medBlue-600"></div>
          </div>
        ) : specialties.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-bold">
            <Settings size={38} className="mx-auto text-slate-200 mb-2 shrink-0" />
            Aucune spécialité configurée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-150">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Icône</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-48">Nom</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100 text-xs">
                {specialties.map((spec) => (
                  <tr key={spec._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center px-3 py-1.5 bg-medBlue-50 text-medBlue-600 rounded-xl font-bold uppercase text-[9px] tracking-wider">
                        {spec.icon || 'Activity'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{spec.name}</td>
                    <td className="px-6 py-4 text-slate-500 font-medium max-w-xs truncate">{spec.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(spec)}
                        className="text-slate-500 hover:text-medBlue-600 border-slate-200 hover:bg-slate-50 rounded-xl p-2"
                      >
                        <Edit2 size={12} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteModal(spec._id)}
                        className="text-red-650 hover:text-red-755 hover:bg-red-50/50 border-red-200 rounded-xl p-2"
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
      </div>

      {/* Modale d'édition / création */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'create' ? 'Créer une spécialité' : 'Modifier la spécialité'}
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setModalOpen(false)}
              className="rounded-xl font-bold border-slate-200 text-xs px-4"
            >
              Fermer
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleFormSubmit} 
              disabled={submitting}
              className="rounded-xl font-bold text-xs px-4 bg-slate-900 border-none hover:bg-slate-800 text-white"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left p-1">
          {formError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-750 text-xs flex gap-2 items-center">
              <AlertCircle size={15} />
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
            className="rounded-xl"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="spec-icon" className="text-xs font-bold text-slate-700 uppercase tracking-wider">Icône représentative</label>
            <select
              id="spec-icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="px-3.5 py-3 text-xs rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-semibold text-slate-700"
            >
              <option value="Heart">Cœur (Cardiologie)</option>
              <option value="Eye">Œil (Ophtalmologie)</option>
              <option value="Baby">Bébé (Pédiatrie)</option>
              <option value="Smile">Sourire (Dentiste)</option>
              <option value="Activity">Activité (Généraliste/Autre)</option>
            </select>
          </div>

          <Input
            label="Description optionnelle"
            id="spec-desc"
            type="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description succincte..."
            className="rounded-xl"
          />
        </form>
      </Modal>

      {/* Modale d'effacement */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Supprimer la spécialité"
        footer={
          <div className="flex gap-2 w-full justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setDeleteModalOpen(false)}
              className="rounded-xl font-bold border-slate-200 text-xs px-4"
            >
              Fermer
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleDeleteConfirm} 
              disabled={deleting}
              className="rounded-xl font-bold text-xs px-4"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-500 leading-relaxed text-left p-1 font-medium">
          Êtes-vous sûr de vouloir supprimer cette spécialité ? Cela n'affectera pas directement les comptes des médecins existants, mais ils n'apparaîtront plus sous cette catégorie dans les résultats de recherche.
        </p>
      </Modal>
    </div>
  );
};

export default SpecialtyManagement;
