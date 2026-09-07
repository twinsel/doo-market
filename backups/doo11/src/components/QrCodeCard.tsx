import React from 'react';
import { QrCode } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface QrCodeCardProps {
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  variant = 'light',
  compact = false
}) => {
  const { data } = useShop();
  const { showQr, qrImage, qrTitle, qrSubtitle } = data.settings;

  if (!showQr || !qrImage) return null;
  const isDark = variant === 'dark';

  return (
    <div
      className={`flex ${
        compact ? 'flex-row items-center gap-3' : 'flex-col items-center text-center gap-3'
      } rounded-2xl p-4 ${
        isDark
          ? 'bg-white/5 ring-1 ring-white/10'
          : 'bg-gradient-to-br from-orange-50 to-white ring-1 ring-orange-100 shadow-sm'
      }`}
    >
      <div
        className={`shrink-0 overflow-hidden rounded-xl bg-white p-2 shadow ${
          compact ? 'h-24 w-24' : 'h-36 w-36 sm:h-40 sm:w-40'
        }`}
      >
        <img
          src={qrImage}
          alt={qrTitle || 'QR Code'}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>

      <div className={compact ? 'min-w-0 flex-1 text-start' : ''}>
        <div
          className={`mb-1 inline-flex items-center gap-1.5 text-xs font-bold ${
            isDark ? 'text-orange-300' : 'text-orange-600'
          }`}
        >
          <QrCode size={14} />
          <span>رمز QR</span>
        </div>
        <div className={`font-black ${compact ? 'text-sm' : 'text-base'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {qrTitle}
        </div>
        {qrSubtitle && (
          <p className={`mt-1 leading-relaxed ${compact ? 'text-xs' : 'text-sm'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {qrSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};
