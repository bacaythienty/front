import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Heart, Sparkles } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
  const { login, user } = useAuth();
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password);
      
      // Redirection selon le rôle
      if (data.role === 'admin') {
        navigate('/admin');
      } else if (data.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          <h2 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">Ravi de vous revoir</h2>
          <p className="text-xs text-slate-400 mt-1.5 font-medium flex items-center gap-1">
            <Sparkles size={12} className="text-cyan-500" />
            <span>Gérez vos rendez-vous en toute sérénité</span>
          </p>
        </div>

        {/* Card Connexion */}
        <div className="glass-effect rounded-3xl p-8 shadow-xl shadow-slate-100/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-700 text-xs">
                <AlertCircle className="shrink-0 mt-0.5" size={15} />
                <span className="font-medium text-left leading-normal">{error}</span>
              </div>
            )}

            <div className="space-y-4">
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
                label="Mot de passe"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-center bg-gradient-to-tr from-medBlue-600 to-cyan-500 hover:from-medBlue-700 hover:to-cyan-600 border-none font-bold py-3.5 rounded-xl shadow-md shadow-medBlue-100 text-sm mt-2 transition-all duration-300"
              disabled={submitting}
            >
              {submitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100/80 pt-6">
            <p className="text-xs text-slate-400 font-medium">
              Nouveau sur MediRdv ?{' '}
              <Link to="/register" className="font-bold text-medBlue-600 hover:text-medBlue-700 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
