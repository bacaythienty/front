import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

let tempUrl = import.meta.env.VITE_API_URL || 'https://back-mcq7.onrender.com';
if (tempUrl.endsWith('/')) {
  tempUrl = tempUrl.slice(0, -1);
}
export const API_URL = tempUrl.endsWith('/api') ? tempUrl : `${tempUrl}/api`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Charger le profil de l'utilisateur au démarrage s'il y a un token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data);
          } else {
            // Token invalide ou expiré
            logout();
          }
        } catch (error) {
          console.error('Erreur de chargement du profil :', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Connexion
  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    // Le useEffect se chargera de charger le profil de l'utilisateur
    return data;
  };

  // Inscription
  const register = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    return data;
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Mettre à jour l'utilisateur local
  const refreshUser = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Erreur refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
