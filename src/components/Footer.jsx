import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo & Slogan en ligne */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Link to="/" className="flex items-center gap-2 text-white shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-medBlue-900/30">
                <Heart className="w-4.5 h-4.5 text-white fill-white/10" />
              </div>
              <span className="font-outfit text-lg font-bold tracking-tight">
                Medi<span className="text-medBlue-400">Rdv</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 font-sans max-w-sm sm:border-l sm:border-slate-800 sm:pl-4">
              Fàjju ci jamono - La santé à votre portée au Sénégal.
            </p>
          </div>

          {/* Navigation & Contacts Compacts */}
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-6 gap-y-2 text-xs font-semibold">
            <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
            <Link to="/search" className="hover:text-white transition-colors">Rechercher</Link>
            <Link to="/login" className="hover:text-white transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-white transition-colors">Inscription</Link>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
              📞 +221 779354678
            </span>
          </div>

        </div>

        {/* Ligne inférieure compacte */}
        <div className="border-t border-slate-800/60 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} MediRdv Sénégal. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Conditions</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Confidentialité</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
