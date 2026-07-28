import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Record_ = { date: string; pages: number | string | null };

const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export function ProgressAreaChart({ records }: { records: Record_[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of records) {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map.set(key, (map.get(key) ?? 0) + Number(r.pages ?? 0));
    }
    return [...map.entries()]
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-6)
      .map(([key, pages]) => ({ name: MONTHS[Number(key.split("-")[1])], pages: Number(pages.toFixed(1)) }));
  }, [records]);

  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">لا توجد بيانات حفظ مسجلة بعد.</p>;
  }

  return (
    <div className="h-64 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="pagesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
          <YAxis tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
          <Tooltip
            contentStyle={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              fontFamily: "var(--font-sans)",
            }}
            formatter={(v: number) => [`${v} صفحة`, "الحفظ"]}
          />
          <Area type="monotone" dataKey="pages" stroke="var(--color-primary)" strokeWidth={2} fill="url(#pagesFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
