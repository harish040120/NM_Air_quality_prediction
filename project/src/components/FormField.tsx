import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder = '',
  icon
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="flex flex-col">
      <label 
        htmlFor={name} 
        className={`mb-1.5 text-sm font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}
      >
        {label}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-lg border ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : `${isDarkMode 
                ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'}`
          } outline-none transition-all duration-200 focus:ring-4 ${
            icon ? 'pl-10' : ''
          }`}
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;