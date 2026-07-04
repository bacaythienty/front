import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, Search, LogOut, Shield, Clock, Menu, X, Settings } from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-medBlue-600 font-extrabold text-xl tracking-tight">
              <Calendar className="h-6 w-6 stroke-[2.5]" />
              <span>MediRdv</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user && user.role === 'patient' && (
              <>
                <Link to="/" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Search size={16} /> Rechercher
                </Link>
                <Link to="/appointments" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Clock size={16} /> Mes RDV
                </Link>
              </>
            )}

            {user && user.role === 'doctor' && (
              <>
                <Link to="/doctor" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Shield size={16} /> Tableau de bord
                </Link>
                <Link to="/doctor/availability" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Calendar size={16} /> Disponibilités
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Shield size={16} /> Admin Dashboard
                </Link>
                <Link to="/admin/users" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <User size={16} /> Utilisateurs
                </Link>
                <Link to="/admin/specialties" className="text-slate-600 hover:text-medBlue-600 font-medium text-sm transition-colors flex items-center gap-1.5">
                  <Settings size={16} /> Spécialités
                </Link>
              </>
            )}

            {/* Auth Buttons / Profile Dropdown */}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                  <span className="text-xs text-slate-400 capitalize">{user.role}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
                  <LogOut size={14} /> Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 shadow-inner">
          {user && user.role === 'patient' && (
            <>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Rechercher un médecin
              </Link>
              <Link
                to="/appointments"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Mes rendez-vous
              </Link>
            </>
          )}

          {user && user.role === 'doctor' && (
            <>
              <Link
                to="/doctor"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Tableau de bord
              </Link>
              <Link
                to="/doctor/availability"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Gérer mes disponibilités
              </Link>
            </>
          )}

          {user && user.role === 'admin' && (
            <>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Gérer les utilisateurs
              </Link>
              <Link
                to="/admin/specialties"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-medBlue-600 font-semibold"
              >
                Gérer les spécialités
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-4 border-t border-slate-100">
              <div className="px-3 mb-3">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1.5"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">Connexion</Button>
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full">S'inscrire</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
