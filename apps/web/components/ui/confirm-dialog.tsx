'use client';

import { Modal } from './modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Ya, Lanjutkan', cancelLabel = 'Batal', variant = 'danger',
}: ConfirmDialogProps) {
  const btnClass = {
    danger: 'bg-gradient-to-r from-red-500 to-red-600',
    warning: 'bg-gradient-to-r from-amber-500 to-amber-600',
    info: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-slate-400 mb-6 text-sm">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm glass-btn-outline rounded-xl">{cancelLabel}</button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className={`px-4 py-2 text-sm text-white rounded-xl ${btnClass[variant]}`}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
