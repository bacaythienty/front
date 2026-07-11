import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Section Logo & Slogan */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-medBlue-900/30">
                <Heart className="w-5.5 h-5.5 text-white fill-white/10" />
              </div>
              <span className="font-outfit text-xl font-bold tracking-tight">
                Medi<span className="text-medBlue-400">Rdv</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 font-sans leading-relaxed">
              Fàjju ci jamono - La santé à votre portée au Sénégal. Prenez rendez-vous en ligne avec les meilleurs spécialistes.
            </p>
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Section Liens Utiles */}
          <div>
            <h3 className="font-outfit text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-white transition-colors">
                  Rechercher un médecin
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Se connecter
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Spécialités */}
          <div>
            <h3 className="font-outfit text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Nos Centres de Test
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-medBlue-400 shrink-0 mt-0.5" />
                <span>Clinique de Dakar, Plateau, Sénégal</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-medBlue-400 shrink-0 mt-0.5" />
                <span>Cabinet Thiès, Quartier Carrière, Sénégal</span>
              </li>
            </ul>
          </div>

          {/* Section Contacts */}
          <div>
            <h3 className="font-outfit text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
              Support & Contact
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-medBlue-400 shrink-0" />
                <span>+221 779354678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-medBlue-400 shrink-0" />
                <span>bacarythienty803@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">Plateforme 100% sécurisée</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Ligne inférieure de Copyright */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>&copy; {new Date().getFullYear()} MediRdv Sénégal. Tous droits réservés.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition-colors cursor-pointer">Conditions d'utilisation</span>
            <span className="hover:text-white transition-colors cursor-pointer">Politique de confidentialité</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
