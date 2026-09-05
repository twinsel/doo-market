import React from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Youtube, 
  Instagram, 
  Facebook, 
  Send, 
  Phone
} from 'lucide-react';

const XIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768M13.232 10.768L20 4" />
  </svg>
);

export const SocialLinks: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { data } = useShop();
  const s = data.settings;
  if (s.showSocial === false) return null;

  const links = [
    { id: 'youtube', href: s.socialYoutube, label: 'YouTube', icon: <Youtube size={18} strokeWidth={1.75} /> },
    { id: 'instagram', href: s.socialInstagram, label: 'Instagram', icon: <Instagram size={18} strokeWidth={1.75} /> },
    { id: 'facebook', href: s.socialFacebook, label: 'Facebook', icon: <Facebook size={18} strokeWidth={1.75} /> },
    { id: 'x', href: s.socialX, label: 'X', icon: <XIcon size={16} /> },
    { id: 'telegram', href: s.socialTelegram, label: 'Telegram', icon: <Send size={18} strokeWidth={1.75} className="-ms-0.5 mt-0.5" /> },
    { id: 'whatsapp', href: s.whatsapp ? `https://wa.me/${s.whatsapp}` : '', label: 'WhatsApp', icon: <Phone size={18} strokeWidth={1.75} /> }
  ].filter(link => Boolean(link.href && String(link.href).trim()));

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {links.map(link => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/60 ring-1 ring-white/5 transition-all hover:bg-white/10 hover:text-white active:scale-90"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export const Footer: React.FC = () => {
  const { data } = useShop();

  return (
    <footer className="mt-8 bg-[#020617] py-8 text-center">
      <div className="mx-auto max-w-2xl px-4">
        <h2 className="text-xl font-black text-white">{data.settings.siteName}</h2>
        <p className="mt-1 text-xs text-slate-400 font-medium">{data.settings.siteTagline}</p>
        <div className="mt-6">
          <SocialLinks />
        </div>
        <div className="mt-8 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-700">
          © {new Date().getFullYear()} {data.settings.siteName} · جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
};
