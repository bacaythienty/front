import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { AlertCircle, Heart, Sparkles, User, Shield } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const Register = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'doctor') {
        navigate('/doctor', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('patient');
  const [specialtyId, setSpecialtyId] = useState('');
  const [specialties, setSpecialties] = useState([]);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Charger les spécialités pour l'inscription des médecins
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await fetch(`${API_URL}/specialties`);
        if (response.ok) {
          const data = await response.json();
          setSpecialties(data);
          if (data.length > 0) {
            setSpecialtyId(data[0]._id);
          }
        }
      } catch (err) {
        console.error('Erreur chargement spécialités:', err);
      }
    };
    fetchSpecialties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      email,
      password,
      phone,
      role
    };

    if (role === 'doctor') {
      payload.specialtyId = specialtyId;
    }

    try {
      const data = await register(payload);
      if (data.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'espace");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glows d'arrière-plan */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-medBlue-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Header brand */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-medBlue-100 transition-transform group-hover:scale-105 duration-300">
              <Heart className="w-6 h-6 text-white fill-white/10" />
            </div>
          </Link>
          <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Rejoignez MediRdv</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
            <Sparkles size={12} className="text-cyan-500" />
            <span>Créez votre compte et prenez vos rendez-vous</span>
          </p>
        </div>

        {/* Card Inscription */}
        <Card className="p-8 shadow-xl shadow-slate-100/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="shrink-0 mt-0.5" size={15} />
                <span className="font-medium text-left leading-normal">{error}</span>
              </div>
            )}

            {/* Sélecteur de rôle */}
            <div className="flex flex-col gap-2 w-full">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vous êtes un :</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-3 text-xs rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'patient'
                      ? 'border-medBlue-500 bg-medBlue-50/40 text-medBlue-700'
                      : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <User size={14} />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`py-3 text-xs rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === 'doctor'
                      ? 'border-medBlue-500 bg-medBlue-50/40 text-medBlue-700'
                      : 'border-slate-100 bg-slate-50/50 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <Shield size={14} />
                  Médecin
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Nom complet"
                id="name"
                type="text"
                placeholder="Ex: Jean Dupont"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />

              <Input
                label="Adresse email"
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
              />

              <Input
                label="Numéro de téléphone"
                id="phone"
                type="tel"
                placeholder="Ex: +221 77 000 00 00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl"
              />

              <Input
                label="Mot de passe"
                id="password"
                type="password"
                placeholder="Min. 6 caractères"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />

              {/* Sélection de spécialité si médecin */}
              {role === 'doctor' && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label htmlFor="specialty" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Votre Spécialité <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="specialty"
                    required
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="px-3.5 py-3 text-sm rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 focus:border-transparent font-medium text-slate-700"
                  >
                    {specialties.map((spec) => (
                      <option key={spec._id} value={spec._id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-center bg-gradient-to-tr from-medBlue-600 to-cyan-500 hover:from-medBlue-700 hover:to-cyan-600 border-none font-bold py-3.5 rounded-xl shadow-md shadow-medBlue-100 text-sm mt-2 transition-all duration-300"
              disabled={submitting}
            >
              {submitting ? "Création de l'espace..." : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100/80 pt-6">
            <p className="text-xs text-slate-400 font-medium">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-bold text-medBlue-600 hover:text-medBlue-700 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default Register;
