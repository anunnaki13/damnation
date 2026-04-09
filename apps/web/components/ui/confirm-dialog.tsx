'use client';

import { Modal } from './modal';

interface ConfirmDialogProps {
  isOpen: boolean; onClose: () => void; onConfirm: () => void;
  title: string; message: string; confirmLabel?: string; variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Lanjutkan', variant = 'danger' }: ConfirmDialogProps) {
  const cls = { danger: 'btn-danger', warning: 'btn-primary', info: 'btn-primary' };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-[13px] text-[#8892a4] mb-6">{message}</p>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="btn btn-ghost btn-sm">Batal</button>
        <button onClick={() => { onConfirm(); onClose(); }} className={`btn btn-sm ${cls[variant]}`}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
