import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-lg transition-all duration-200 font-medium inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
