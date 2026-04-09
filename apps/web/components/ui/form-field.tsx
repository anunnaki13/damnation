interface FormFieldProps {
  label: string; error?: string; required?: boolean; children: React.ReactNode; className?: string;
}

export function FormField({ label, error, required, children, className }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className || ''}`}>
      <label className="block text-[12px] font-semibold text-[#8892a4] uppercase tracking-[0.05em]">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}
