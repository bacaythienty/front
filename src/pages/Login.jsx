import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Calendar } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-medBlue-600 p-2.5 rounded-xl text-white shadow-lg shadow-medBlue-200 mb-3">
            <Calendar size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Ravi de vous revoir !</h2>
          <p className="text-sm text-slate-500 mt-1">Connectez-vous pour gérer vos rendez-vous</p>
        </div>

        <Card className="shadow-xl shadow-slate-100/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="Adresse email"
                id="email"
                type="email"
                placeholder="nom@exemple.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Input
                label="Mot de passe"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-center"
              disabled={submitting}
            >
              {submitting ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <p className="text-sm text-slate-500">
              Nouveau sur MediRdv ?{' '}
              <Link to="/register" className="font-semibold text-medBlue-600 hover:text-medBlue-700 transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
