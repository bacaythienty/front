import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medBlue-600"></div>
      </div>
    );
  }

  // Si pas connecté, redirection vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier si le rôle est autorisé
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers l'espace approprié selon son rôle
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'doctor') {
      return <Navigate to="/doctor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
