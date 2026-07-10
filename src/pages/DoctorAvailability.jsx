import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Calendar, AlertCircle, Clock, Save, Trash2, Check, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const DoctorAvailability = () => {
  const { token, user, refreshUser } = useAuth();
  
  // Disponibilités locales
  const [availability, setAvailability] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  // Jour sélectionné dans l'UI pour édition
  const [selectedDay, setSelectedDay] = useState('Monday');

  const daysOfWeek = [
    { key: 'Monday', label: 'Lundi' },
    { key: 'Tuesday', label: 'Mardi' },
    { key: 'Wednesday', label: 'Mercredi' },
    { key: 'Thursday', label: 'Jeudi' },
    { key: 'Friday', label: 'Vendredi' },
    { key: 'Saturday', label: 'Samedi' },
    { key: 'Sunday', label: 'Dimanche' }
  ];

  // Liste de tous les créneaux possibles par défaut (08:00 - 18:30 par pas de 30 min)
  const defaultTimeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    if (user?.doctorProfile?.availability) {
      const userAvail = daysOfWeek.map(d => {
        const found = user.doctorProfile.availability.find(a => a.day === d.key);
        return {
          day: d.key,
          slots: found ? [...found.slots] : []
        };
      });
      setAvailability(userAvail);
    }
  }, [user]);

  // Ajouter/Enlever un créneau pour le jour sélectionné
  const toggleSlot = (slot) => {
    setAvailability(prev => 
      prev.map(item => {
        if (item.day === selectedDay) {
          const exists = item.slots.includes(slot);
          return {
            ...item,
            slots: exists
              ? item.slots.filter(s => s !== slot)
              : [...item.slots, slot].sort()
          };
        }
        return item;
      })
    );
  };

  // Vider tous les créneaux du jour sélectionné
  const clearDaySlots = () => {
    setAvailability(prev => 
      prev.map(item => {
        if (item.day === selectedDay) {
          return { ...item, slots: [] };
        }
        return item;
      })
    );
  };

  // Appliquer les créneaux standards (09:00 - 17:00 avec pause de midi)
  const applyStandardDaySlots = () => {
    const standard = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
    setAvailability(prev => 
      prev.map(item => {
        if (item.day === selectedDay) {
          return { ...item, slots: standard };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/users/doctor/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ availability })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la sauvegarde');
      }

      setSuccess('Vos créneaux de disponibilité ont bien été sauvegardés.');
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentDayConfig = availability.find(a => a.day === selectedDay) || { slots: [] };

  return (
    <div className="max-w-5xl mx-auto px-1 sm:px-4 py-8 space-y-6 text-left relative overflow-hidden">
      
      {/* En-tête de page */}
      <div className="flex justify-between items-center flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Disponibilités</h1>
          <p className="text-xs text-slate-400 font-medium">Définissez vos créneaux de consultation par jour de la semaine</p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 bg-gradient-to-tr from-medBlue-600 to-cyan-500 hover:from-medBlue-700 hover:to-cyan-600 border-none font-bold py-2.5 px-5 rounded-xl text-xs shadow-md shadow-medBlue-100"
        >
          <Save size={14} />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={14} className="text-red-550 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Liste des jours (Gauche) */}
        <div className="md:col-span-1 space-y-2">
          <div className="glass-effect rounded-2xl p-4 shadow-xl shadow-slate-100/50">
            <h3 className="font-bold font-outfit text-xs text-slate-400 mb-3 px-1.5 uppercase tracking-wider">Semaine</h3>
            
            <div className="flex flex-col gap-1.5">
              {daysOfWeek.map((day) => {
                const dayConfig = availability.find(a => a.day === day.key) || { slots: [] };
                const isSelected = selectedDay === day.key;
                const hasSlots = dayConfig.slots.length > 0;
                
                return (
                  <button
                    key={day.key}
                    onClick={() => {
                      setSelectedDay(day.key);
                      setError('');
                      setSuccess('');
                    }}
                    className={`flex justify-between items-center px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-medBlue-600 text-white shadow-md shadow-medBlue-100'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <span>{day.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : hasSlots
                        ? 'bg-medBlue-50 text-medBlue-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {dayConfig.slots.length} slots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Configuration des créneaux (Droite) */}
        <div className="md:col-span-2 space-y-4">
          <div className="glass-effect rounded-2xl p-6 space-y-6 shadow-xl shadow-slate-100/50">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 flex-wrap gap-2">
              <h2 className="text-base font-bold font-outfit text-slate-800 m-0 flex items-center gap-1.5">
                <Clock size={16} className="text-medBlue-600" />
                Horaires du {daysOfWeek.find(d => d.key === selectedDay)?.label}
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={applyStandardDaySlots} 
                  className="text-[10px] font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 py-1.5 px-3"
                >
                  Horaires standards
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearDaySlots} 
                  className="text-[10px] font-bold rounded-xl text-red-600 border-red-100 hover:bg-red-50 py-1.5 px-3 flex items-center gap-1"
                >
                  <Trash2 size={11} /> 
                  Vider
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-medium">
                Cochez les heures auxquelles vos patients peuvent prendre rendez-vous pour ce jour.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                {defaultTimeSlots.map((slot) => {
                  const isSelected = currentDayConfig.slots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={`py-2.5 text-xs rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-medBlue-50/50 border-medBlue-500 text-medBlue-700 ring-2 ring-medBlue-50/50'
                          : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <Clock size={12} className={isSelected ? 'text-medBlue-600 shrink-0' : 'text-slate-400 shrink-0'} />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorAvailability;
