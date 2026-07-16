import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  Calendar, User, Search, LogOut, Shield, Clock, 
  Menu, X, Settings, Bell, Check, Heart, ChevronDown 
} from 'lucide-react';
import Button from './Button';

const Navbar = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const profileMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Charger les notifications si connecté
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Erreur fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Polling toutes les 30 secondes pour actualiser les notifications
    let interval;
    if (token) {
      interval = setInterval(fetchNotifications, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [token]);

  // Fermer les dropdowns en cliquant en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    setIsOpen(false);
    navigate('/');
  };

  const handleMarkAsRead = async (id) => {
    // 1. Mise à jour locale instantanée (optimiste)
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );

    // 2. Appel API en arrière-plan
    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Erreur backend mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    // 1. Mise à jour locale instantanée (optimiste)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    // 2. Appel API en arrière-plan
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error('Erreur backend mark all as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <nav className="bg-white/70 backdrop-blur-md border-b border-slate-100/40 sticky top-0 z-40 shadow-xs shadow-slate-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center shadow-md shadow-medBlue-200 transition-transform group-hover:scale-105 duration-300">
                <Heart className="w-5 h-5 text-white fill-white/10" />
              </div>
              <span className="font-outfit text-xl font-extrabold tracking-tight text-slate-800">
                Medi<span className="bg-gradient-to-r from-medBlue-600 to-cyan-500 bg-clip-text text-transparent">Rdv</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {user && user.role === 'patient' && (
              <>
                <Link 
                  to="/search" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/search' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Search size={14} /> Rechercher
                </Link>
                <Link 
                  to="/appointments" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/appointments' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Clock size={14} /> Mes RDV
                </Link>
              </>
            )}

            {user && user.role === 'doctor' && (
              <>
                <Link 
                  to="/doctor" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/doctor' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Shield size={14} /> Tableau de bord
                </Link>
                <Link 
                  to="/doctor/availability" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/doctor/availability' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Calendar size={14} /> Disponibilités
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link 
                  to="/admin" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Shield size={14} /> Dashboard
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin/users' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <User size={14} /> Utilisateurs
                </Link>
                <Link 
                  to="/admin/specialties" 
                  className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    location.pathname === '/admin/specialties' 
                      ? 'text-medBlue-600 bg-medBlue-50/60 border border-medBlue-100/40 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/60'
                  }`}
                >
                  <Settings size={14} /> Spécialités
                </Link>
              </>
            )}
          </div>

          {/* Desktop Right Actions (Auth / Profile Dropdown) */}
          <div className="hidden md:flex items-center gap-4">
            
            {user ? (
              <>
                {/* Centre de Notifications */}
                <div className="relative" ref={notifMenuRef}>
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowProfileMenu(false);
                    }}
                    className={`w-9.5 h-9.5 rounded-xl border flex items-center justify-center transition-all ${
                      showNotifications 
                        ? 'border-medBlue-200 bg-medBlue-50/50 text-medBlue-600' 
                        : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Bell className={`w-4.5 h-4.5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Notifications */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <span className="font-outfit font-semibold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs text-medBlue-600 hover:text-medBlue-700 font-medium transition-colors"
                          >
                            Tout lire
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                        {unreadCount > 0 ? (
                          notifications.filter(notif => !notif.isRead).map((notif) => (
                            <div 
                              key={notif._id} 
                              onClick={() => handleMarkAsRead(notif._id)}
                              className="p-3.5 text-left cursor-pointer transition-colors bg-medBlue-50/20 hover:bg-medBlue-50/40"
                            >
                              <div className="flex gap-2.5 items-start">
                                <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-medBlue-500" />
                                <div className="space-y-0.5">
                                  <p className="font-semibold text-slate-800 text-xs">{notif.title}</p>
                                  <p className="text-slate-500 text-xs leading-relaxed">{notif.message}</p>
                                  <p className="text-[10px] text-slate-400">
                                    {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs font-medium">Aucune notification pour l'instant</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profil Dropdown */}
                <div className="relative pl-3 border-l border-slate-100" ref={profileMenuRef}>
                  <button 
                    onClick={() => {
                      setShowProfileMenu(!showProfileMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 group hover:bg-slate-50/80 p-1.5 rounded-xl transition-all"
                  >
                    {user.role === 'doctor' && user.doctorProfile?.profileImage ? (
                      <img 
                        src={user.doctorProfile.profileImage} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 group-hover:ring-medBlue-100 transition-all"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medBlue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-inner uppercase">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="flex flex-col text-left shrink-0">
                      <span className="text-xs font-bold text-slate-800 tracking-tight group-hover:text-medBlue-600 transition-colors">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />
                  </button>

                  {/* Dropdown Menu profil */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-2.5 border-b border-slate-50 bg-slate-50/30">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Compte</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {user.role === 'patient' && (
                          <>
                            <Link 
                              to="/search" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Search size={15} /> Rechercher un médecin
                            </Link>
                            <Link 
                              to="/appointments" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Clock size={15} /> Mes rendez-vous
                            </Link>
                          </>
                        )}

                        {user.role === 'doctor' && (
                          <>
                            <Link 
                              to="/doctor" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Shield size={15} /> Tableau de bord
                            </Link>
                            <Link 
                              to="/doctor/availability" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Calendar size={15} /> Mes disponibilités
                            </Link>
                          </>
                        )}

                        {user.role === 'admin' && (
                          <>
                            <Link 
                              to="/admin" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Shield size={15} /> Dashboard Admin
                            </Link>
                            <Link 
                              to="/admin/users" 
                              onClick={() => setShowProfileMenu(false)}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <User size={15} /> Gérer les utilisateurs
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="border-t border-slate-50 pt-1 mt-1">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition-colors text-left"
                        >
                          <LogOut size={15} /> Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to="/login">
                  <Button variant="outline" size="sm" className="rounded-xl font-semibold border-slate-200">Connexion</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="rounded-xl font-semibold bg-gradient-to-tr from-medBlue-600 to-cyan-500 border-none shadow-md shadow-medBlue-100">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-3">
            {user && (
              <div className="relative" ref={notifMenuRef}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setIsOpen(false);
                  }}
                  className="w-9 h-9 rounded-lg border border-slate-100 flex items-center justify-center text-slate-500"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                </button>

                {/* Mobile Dropdown Notifications */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 z-50 overflow-hidden">
                    <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <span className="font-outfit font-semibold text-slate-800 text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-medBlue-600 hover:text-medBlue-700 font-medium transition-colors"
                        >
                          Tout lire
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                      {unreadCount > 0 ? (
                        notifications.filter(notif => !notif.isRead).map((notif) => (
                          <div 
                            key={notif._id} 
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="p-3 text-left cursor-pointer transition-colors bg-medBlue-50/20 hover:bg-medBlue-50/40"
                          >
                            <div className="flex gap-2.5 items-start">
                              <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 bg-medBlue-500" />
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-800 text-xs">{notif.title}</p>
                                <p className="text-slate-550 text-[11px] leading-relaxed">{notif.message}</p>
                                <p className="text-[9px] text-slate-400">
                                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Bell className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                          <p className="text-slate-400 text-xs font-medium">Aucune notification</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2.5 shadow-lg">
          {user && user.role === 'patient' && (
            <>
              <Link
                to="/search"
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
              <div className="px-3 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-medBlue-500 text-white font-bold text-xs flex items-center justify-center uppercase">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
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
