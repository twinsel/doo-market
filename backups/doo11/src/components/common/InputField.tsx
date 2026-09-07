import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export interface InputFieldProps {
  label: string;
  type: string;
  placeholder: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
  rightElement?: React.ReactNode;
  register?: any;
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  placeholder,
  icon,
  required = true,
  error,
  rightElement,
  register,
  name,
  value,
  onChange,
}) => {
  const registerProps = register ? register(name) : { value, onChange };

  return (
    <div className="space-y-1.5 text-right">
      <label className="block text-xs font-bold text-slate-300">
        {label}
        {required && <span className="text-red-400 me-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          {...registerProps}
          className={`w-full rounded-2xl border ${
            error ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-white/10'
          } bg-slate-950/50 p-3.5 ps-11 pe-11 text-sm font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-orange-500 focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/20`}
        />
        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-500">
          {icon}
        </span>
        {rightElement && (
          <span className="absolute end-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 text-[11px] font-bold text-red-400 justify-start"
        >
          <AlertCircle size={13} />
          {error}
        </motion.p>
      )}
    </div>
  );
};
