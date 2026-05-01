import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <p className="section-label mb-2">{label}</p>
      <h2 className="font-display text-2xl font-bold text-ev-text">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm text-ev-text-secondary">{subtitle}</p>
      )}
    </div>
  );
}
