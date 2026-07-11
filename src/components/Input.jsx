import React, { forwardRef } from 'react';

const Input = forwardRef(({
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
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          ref={ref}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`px-3.5 py-3 text-xs rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-semibold text-slate-700 ${
            error
              ? 'border-red-350 focus:ring-red-500'
              : 'border-slate-200 focus:ring-medBlue-500'
          }`}
          rows="4"
          {...props}
        />
      ) : (
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`px-3.5 py-3.5 text-xs rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-medBlue-500 font-semibold text-slate-700 ${
            error
              ? 'border-red-350 focus:ring-red-500'
              : 'border-slate-200 focus:ring-medBlue-500'
          }`}
          {...props}
        />
      )}

      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
});

export default Input;
