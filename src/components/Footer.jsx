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
        <div className="border-t border-slate-800/60 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} MediRdv Sénégal. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            {/* Bouton cliquable hautement visible */}
            <button 
              onClick={() => setAboutModalOpen(true)} 
              className="bg-gradient-to-tr from-medBlue-600 to-cyan-500 hover:from-medBlue-700 hover:to-cyan-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-full shadow-md shadow-medBlue-900/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer border-none"
            >
              <Users size={11} className="text-white fill-white/10" /> L'Équipe (Groupe 2)
            </button>
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
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer border-none"
          >
            Fermer
          </button>
        }
      >
        <div className="space-y-4 text-xs text-slate-650 font-medium text-left p-1">
          {/* Section Logos Académiques */}
          <div className="flex justify-center items-center gap-6 bg-white p-4 rounded-2xl border border-slate-100">
            <img src="/assets/logos/isep.png" alt="ISEP Thiès" className="h-10 object-contain" />
            <img src="/assets/logos/eit.png" alt="EIT" className="h-9 object-contain" />
            <img src="/assets/logos/dwm.png" alt="DWM" className="h-9 object-contain" />
          </div>

          {/* Informations Académiques */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/60 space-y-2">
            <div className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100 pb-1.5">
              <span>Institution académique</span>
              <span className="bg-medBlue-50 text-medBlue-650 px-2 py-0.5 rounded-md text-[9px]">Promo 13</span>
            </div>
            <div className="space-y-1 text-slate-700">
              <p className="text-[11px] font-bold">
                Institut : <span className="text-slate-500 font-semibold">ISEP de Thiès (Institut Supérieur d'Enseignement Professionnel)</span>
              </p>
              <p className="text-[11px] font-bold">
                Département : <span className="text-slate-500 font-semibold">EIT (Électronique, Informatique et Télécommunication)</span>
              </p>
              <p className="text-[11px] font-bold">
                Métier : <span className="text-slate-500 font-semibold">DWM (Développement Web & Mobile)</span>
              </p>
              <p className="text-[11px] font-bold">
                Équipe : <span className="text-slate-500 font-semibold">Groupe 2</span>
              </p>
            </div>
          </div>

          {/* Chef de projet */}
          <div className="bg-gradient-to-tr from-medBlue-50/50 to-cyan-50/30 p-4 rounded-2xl border border-medBlue-100/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-medBlue-100/55">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-medBlue-600 font-bold uppercase tracking-wider block">Chef de Projet / Scrum Master</span>
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
              <ul className="space-y-2 text-xs text-slate-500 font-semibold pl-1">
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
              <ul className="space-y-2 text-xs text-slate-500 font-semibold pl-1">
                <li>• Ahmadou Ly</li>
                <li>• Mamadou Ndour</li>
                <li>• Amadou Aw</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </footer>
  );
}

export default Footer;
