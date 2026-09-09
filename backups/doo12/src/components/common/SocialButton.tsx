import React from 'react';

export interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
  hoverBg?: string;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  icon,
  label,
  onClick,
  bgColor = 'bg-white/10',
  textColor = 'text-white/70',
  hoverBg = 'hover:bg-white/20',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2.5 rounded-2xl border border-white/10 ${bgColor} py-3 text-xs font-bold ${textColor} ${hoverBg} transition-all duration-300 active:scale-95`}
  >
    {icon}
    <span>{label}</span>
  </button>
);
