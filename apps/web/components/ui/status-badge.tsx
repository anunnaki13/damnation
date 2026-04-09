interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
};

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-medium border ${variantStyles[variant]} ${className || ''}`}>
      {status}
    </span>
  );
}
