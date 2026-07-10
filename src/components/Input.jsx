import React from 'react';

const Input = ({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`px-3 py-2 text-base md:text-sm rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-slate-300 focus:ring-medBlue-500 focus:border-medBlue-500'
          }`}
          rows="4"
          {...props}
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`px-3 py-2 text-base md:text-sm rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent ${
            error
              ? 'border-red-300 focus:ring-red-500'
              : 'border-slate-300 focus:ring-medBlue-500 focus:border-medBlue-500'
          }`}
          {...props}
        />
      )}

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
};

export default Input;
