'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) { document.addEventListener('keydown', fn); document.body.style.overflow = 'hidden'; }
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === ref.current && onClose()}>
      <div className={`w-full mx-4 ${sizes[size]} bg-[#11112a]/98 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/40`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
          <h3 className="text-[15px] font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#4a5268] hover:text-[#8892a4] hover:bg-white/[0.04] transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
