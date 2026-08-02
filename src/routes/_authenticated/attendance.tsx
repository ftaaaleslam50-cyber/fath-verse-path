import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "التحضير اليومي | منصة الفردوس" },
      { name: "description", content: "تسجيل حضور وغياب طلاب الحلقات يوميًا في مركز الفردوس القرآني." },
      { property: "og:title", content: "التحضير اليومي | منصة الفردوس" },
      { property: "og:description", content: "تسجيل حضور وغياب طلاب الحلقات يوميًا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AttendancePage,
});

type Status = "present" | "absent" | "late" | "excused";

const STATUSES: { key: Status; label: string }[] = [
  { key: "present", label: "حاضر" },
  { key: "late", label: "متأخر" },
  { key: "excused", label: "بعذر" },
  { key: "absent", label: "غائب" },
];

function AttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [circleId, setCircleId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Status>>({});

  const { data: circles } = useQuery({
    queryKey: ["circles-attendance"],
    queryFn: async () => (await supabase.from("circles").select("id, name").eq("is_active", true).order("name")).data ?? [],
  });

  const { data: students } = useQuery({
    queryKey: ["circle-students", circleId],
    enabled: !!circleId,
    queryFn: async () =>
      (await supabase.from("students").select("id, full_name, code").eq("circle_id", circleId).eq("status", "active").order("full_name")).data ?? [],
  });

  const { data: existing } = useQuery({
    queryKey: ["attendance-day", circleId, date],
    enabled: !!circleId,
    queryFn: async () => {
      const { data } = await supabase.from("attendance").select("id, student_id, status").eq("circle_id", circleId).eq("date", date);
      const map: Record<string, { id: string; status: Status }> = {};
      (data ?? []).forEach((r) => {
        map[r.student_id] = { id: r.id, status: r.status as Status };
      });
      setMarks(Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.status])));
      return map;
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const rows = students ?? [];
      if (rows.length === 0) throw new Error("لا يوجد طلاب في هذه الحلقة");
      for (const s of rows) {
        const status = marks[s.id] ?? "present";
        const prev = existing?.[s.id];
        if (prev) {
          const { error } = await supabase.from("attendance").update({ status }).eq("id", prev.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("attendance").insert({
            student_id: s.id,
            circle_id: circleId,
            date,
            status,
            recorded_by: user?.id ?? null,
          });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("تم حفظ التحضير");
      qc.invalidateQueries({ queryKey: ["attendance-day", circleId, date] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذر حفظ التحضير"),
  });

  return (
    <>
      <PageHeader title="التحضير اليومي" subtitle="اختر الحلقة والتاريخ ثم سجّل حالة كل طالب" />

      <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>الحلقة</Label>
          <select
            value={circleId}
            onChange={(e) => {
              setCircleId(e.target.value);
              setMarks({});
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">اختر الحلقة</option>
            {(circles ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label>التاريخ</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {circleId && (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          {(students ?? []).map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
              <div>
                <p className="text-sm font-extrabold text-foreground">{s.full_name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{s.code}</p>
              </div>
              <div className="flex gap-1.5">
                {STATUSES.map((st) => {
                  const on = (marks[s.id] ?? "present") === st.key;
                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => setMarks((m) => ({ ...m, [s.id]: st.key }))}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                        on ? "border-primary bg-primary-soft text-primary-deep" : "border-border text-muted-foreground"
                      }`}
                    >
                      {st.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {(students ?? []).length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">لا يوجد طلاب في هذه الحلقة.</p>}
        </div>
      )}

      {circleId && (students ?? []).length > 0 && (
        <Button className="mt-4" disabled={save.isPending} onClick={() => save.mutate()}>
          حفظ التحضير
        </Button>
      )}
    </>
  );
}
