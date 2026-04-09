interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">{title}</h1>
        {description && <p className="text-[13px] text-[#8892a4] mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
