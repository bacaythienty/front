import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { AlertCircle, Calendar } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-medBlue-600 p-2.5 rounded-xl text-white shadow-lg shadow-medBlue-200 mb-3">
            <Calendar size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Rejoignez-nous !</h2>
          <p className="text-sm text-slate-500 mt-1">Créez votre compte en quelques secondes</p>
        </div>

        <Card className="shadow-xl shadow-slate-100/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Sélecteur de rôle */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-sm font-semibold text-slate-700">Vous êtes un :</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('patient')}
                  className={`py-2 text-sm rounded-lg border font-semibold transition-all ${
                    role === 'patient'
                      ? 'border-medBlue-600 bg-medBlue-50 text-medBlue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('doctor')}
                  className={`py-2 text-sm rounded-lg border font-semibold transition-all ${
                    role === 'doctor'
                      ? 'border-medBlue-600 bg-medBlue-50 text-medBlue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Médecin
                </button>
              </div>
            </div>

            <Input
              label="Nom complet"
              id="name"
              type="text"
              placeholder="Ex: Jean Dupont"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="Adresse email"
              id="email"
              type="email"
              placeholder="nom@exemple.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Numéro de téléphone"
              id="phone"
              type="tel"
              placeholder="Ex: 0612345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <Input
              label="Mot de passe"
              id="password"
              type="password"
              placeholder="Min. 6 caractères"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Sélection de spécialité si médecin */}
            {role === 'doctor' && (
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="specialty" className="text-sm font-semibold text-slate-700">
                  Votre Spécialité <span className="text-red-500">*</span>
                </label>
                <select
                  id="specialty"
                  required
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 focus:border-transparent"
                >
                  {specialties.map((spec) => (
                    <option key={spec._id} value={spec._id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full text-center mt-2"
              disabled={submitting}
            >
              {submitting ? 'Création...' : "S'inscrire"}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-semibold text-medBlue-600 hover:text-medBlue-700 transition-colors">
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
