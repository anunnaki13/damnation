interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const styles = {
  default: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-primary',
};

export function StatusBadge({ status, variant = 'default', className }: StatusBadgeProps) {
  return <span className={`badge ${styles[variant]} ${className || ''}`}>{status}</span>;
}
