import React from 'react';

interface PkbmLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const PkbmLogo: React.FC<PkbmLogoProps> = ({
  className = '',
  size = 44,
  showText = false,
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        style={{ width: pixelSize, height: pixelSize }}
        className="relative shrink-0 rounded-full overflow-hidden shadow-sm border border-blue-900/20 bg-[#002bdc] flex items-center justify-center"
      >
        <img
          src="/logo-pkbm.jpg"
          alt="Logo PKBM Menara"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback to SVG representation if image file is not found
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.classList.add('bg-blue-700');
            }
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 leading-tight">PKBM MENARA</span>
          <span className="text-[10px] text-slate-500 font-medium leading-none">
            NPSN P9954430 • Konawe Selatan
          </span>
        </div>
      )}
    </div>
  );
};
