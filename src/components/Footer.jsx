import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Award, Monitor, Database, Users } from 'lucide-react';
import Modal from './Modal';

function Footer() {
  const [aboutModalOpen, setAboutModalOpen] = useState(false);

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
            <span onClick={() => setAboutModalOpen(true)} className="hover:text-white transition-colors cursor-pointer font-bold">
              L'Équipe (Groupe 2)
            </span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Conditions</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Confidentialité</span>
          </div>
        </div>

      </div>

      {/* Modale de présentation de l'équipe (Groupe 2) */}
      <Modal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        title="Groupe 2 - Équipe de Développement"
        footer={
          <button 
            onClick={() => setAboutModalOpen(false)}
            className="px-4 py-2 bg-slate-905 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        }
      >
        <div className="space-y-4 text-xs text-slate-600 font-medium text-left p-1">
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Cette application a été entièrement développée pour la soutenance de projet par le **Groupe 2**.
          </p>

          {/* Chef de projet */}
          <div className="bg-gradient-to-tr from-medBlue-50/50 to-cyan-50/30 p-4 rounded-2xl border border-medBlue-100/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-medBlue-100/55">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-medBlue-600 font-bold uppercase tracking-wider block">Chef de Projet / Scrum Master</span>
              <span className="text-sm font-extrabold text-slate-800">Bacary Thienty</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frontend */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Monitor className="w-4 h-4 text-cyan-500" />
                <span className="text-[10px] uppercase tracking-wider">Développeurs Frontend</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-semibold pl-1">
                <li>• Bacary THIENTY</li>
                <li>• Boubacar Sall</li>
              </ul>
            </div>

            {/* Backend */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 space-y-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Database className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] uppercase tracking-wider">Développeurs Backend</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 font-semibold pl-1">
                <li>• Ahmadou Ly</li>
                <li>• Mamadou Ndour</li>
                <li>• Amadou Aw</li>
              </ul>
            </div>
          </div>

          {/* Footer membres */}
          <div className="border-t border-slate-100 pt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <Users size={12} className="text-slate-400" />
            <span>Groupe 2 • Soutenance de Projet</span>
          </div>
        </div>
      </Modal>
    </footer>
  );
}

export default Footer;
