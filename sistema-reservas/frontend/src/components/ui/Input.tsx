import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">{label}</label>}
      <input 
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 transition-all dark:bg-stone-800 dark:text-white ${error ? 'border-red-500' : 'border-stone-300 dark:border-stone-700'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
