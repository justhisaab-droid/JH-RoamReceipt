
import React from 'react';
import { APP_CONFIG } from '../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  loading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "py-4 px-6 rounded-2xl font-black text-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-indigo-600 text-white shadow-lg shadow-indigo-100",
    secondary: "bg-emerald-500 text-white shadow-lg shadow-emerald-100",
    danger: "bg-red-500 text-white",
    ghost: "bg-transparent text-indigo-600",
    outline: "bg-white text-indigo-600 border-2 border-indigo-50"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm ${onClick ? 'active:bg-gray-50 cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{label}</label>}
    <input 
      {...props}
      className={`w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800 ${props.className || ''}`}
    />
  </div>
);
