import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

let tempUrl = import.meta.env.VITE_API_URL || 'https://back-mcq7.onrender.com';
if (tempUrl.endsWith('/')) {
  tempUrl = tempUrl.slice(0, -1);
}
export const API_URL = tempUrl.endsWith('/api') ? tempUrl : `${tempUrl}/api`;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('medirdv_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('medirdv_user');
    return Boolean(savedToken && !savedUser);
  });

  // Pré-chauffer le serveur backend (Render wake up) dès le montage de l'application
  useEffect(() => {
    const wakeUpServer = async () => {
      try {
        const rootUrl = API_URL.replace('/api', '');
        fetch(rootUrl, { keepalive: true }).catch(() => {});
        fetch(`${API_URL}/specialties`, { keepalive: true }).catch(() => {});
      } catch (err) {
        // Ignorer l'erreur
      }
    };
    wakeUpServer();
  }, []);

  // Charger ou rafraîchir le profil de l'utilisateur au démarrage s'il y a un token
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
            try {
              localStorage.setItem('medirdv_user', JSON.stringify(data));
            } catch (e) {}
          } else if (response.status === 401) {
            // Token invalide ou expiré
            logout();
          }
        } catch (error) {
          console.error('Erreur de rafraîchissement du profil :', error);
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
    try {
      localStorage.setItem('medirdv_user', JSON.stringify(data));
    } catch (e) {}
    setToken(data.token);
    setUser(data);
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
    try {
      localStorage.setItem('medirdv_user', JSON.stringify(data));
    } catch (e) {}
    setToken(data.token);
    setUser(data);
    return data;
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('medirdv_user');
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
        try {
          localStorage.setItem('medirdv_user', JSON.stringify(data));
        } catch (e) {}
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
