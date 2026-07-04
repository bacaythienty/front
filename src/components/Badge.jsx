import React from 'react';

const Badge = ({
  children,
  variant = 'info',
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';

  const variants = {
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    neutral: 'bg-slate-50 text-slate-700 border-slate-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  };

  // Raccourcis pour les statuts des rendez-vous
  const statusMappings = {
    pending: variants.warning,
    confirmed: variants.success,
    cancelled: variants.danger,
    patient: variants.info,
    doctor: variants.indigo,
    admin: variants.purple
  };

  const selectedStyle = statusMappings[children] || statusMappings[variant] || variants[variant] || variants.info;

  // Traduction pour l'affichage si c'est un statut standard
  const displayLabels = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    cancelled: 'Annulé',
    patient: 'Patient',
    doctor: 'Médecin',
    admin: 'Admin'
  };

  const label = displayLabels[children] || children;

  return (
    <span
      className={`${baseStyle} ${selectedStyle} ${className}`}
      {...props}
    >
      {label}
    </span>
  );
};

export default Badge;
