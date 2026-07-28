import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="rounded-xl bg-primary-soft p-2 text-primary-deep">
          <Icon className="size-5" />
        </span>
        {hint && <span className="text-xs font-bold text-accent-foreground">{hint}</span>}
      </div>
      <p className="mt-3 text-2xl font-extrabold text-primary-deep">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
