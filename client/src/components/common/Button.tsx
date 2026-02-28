import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  fullWidth = false,
}) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs min-h-[32px]',
    md: 'px-5 py-2.5 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };
  
  const variantStyles = {
    primary: 'bg-godam-sun hover:bg-yellow-500 text-gray-900 shadow-md',
    secondary: 'bg-white hover:bg-gray-50 text-godam-forest border-2 border-godam-forest shadow-sm',
    success: 'bg-godam-leaf hover:bg-green-600 text-white shadow-md',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''
      } ${
        fullWidth ? 'w-full' : ''
      }`}
    >
      {children}
    </button>
  );
};
