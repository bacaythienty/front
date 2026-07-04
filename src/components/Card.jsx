import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-100 shadow-sm p-5 transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-slate-200 cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
