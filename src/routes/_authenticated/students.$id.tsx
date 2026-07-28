import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ProgressAreaChart } from "@/components/app/ProgressAreaChart";

export const Route = createFileRoute("/_authenticated/students/$id")({
  head: () => ({
    meta: [
      { title: "ملف الطالب | منصة الفردوس" },
      { name: "description", content: "ملف الطالب: سجل الحفظ والمراجعة والحضور ورمز QR الخاص به." },
      { property: "og:title", content: "ملف الطالب | منصة الفردوس" },
      { property: "og:description", content: "سجل الحفظ والمراجعة والحضور للطالب." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentDetail,
});

const TYPE_LABEL: Record<string, string> = { hifz: "حفظ", review: "مراجعة", consolidation: "تثبيت" };

function StudentDetail() {
  const { id } = Route.useParams();
  const { isStaff, roles } = useAuth();
  const canEdit = isStaff || roles.includes("teacher");
  const qc = useQueryClient();
  const [qr, setQr] = useState<string | null>(null);

  const { data: student } = useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*, circles(name), branches(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: records } = useQuery({
    queryKey: ["records", id],
    queryFn: async () =>
      (await supabase.from("progress_records").select("*").eq("student_id", id).order("date", { ascending: false }).limit(60)).data ?? [],
  });

  const { data: attendance } = useQuery({
    queryKey: ["attendance", id],
    queryFn: async () =>
      (await supabase.from("attendance").select("*").eq("student_id", id).order("date", { ascending: false }).limit(30)).data ?? [],
  });

  useEffect(() => {
    if (!student?.code) return;
    QRCode.toDataURL(student.code, { width: 320, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [student?.code]);

  const [rec, setRec] = useState({ type: "hifz", pages: "1", surah_from: "", surah_to: "", grade: "", date: new Date().toISOString().slice(0, 10) });

  const addRecord = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("progress_records").insert({
        student_id: id,
        circle_id: student?.circle_id ?? null,
        type: rec.type as "hifz" | "review" | "consolidation",
        pages: Number(rec.pages) || 0,
        surah_from: rec.surah_from.trim() || null,
        surah_to: rec.surah_to.trim() || null,
        grade: rec.grade ? Number(rec.grade) : null,
        date: rec.date,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تسجيل المتابعة");
      qc.invalidateQueries({ queryKey: ["records", id] });
    },
    onError: () => toast.error("تعذر حفظ السجل"),
  });

  const totalPages = (records ?? []).reduce((s, r) => s + Number(r.pages ?? 0), 0);

  return (
    <>
      <PageHeader title={student?.full_name ?? "ملف الطالب"} subtitle={student?.code ? `كود الطالب: ${student.code}` : undefined} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-3 text-base font-extrabold text-primary-deep">بيانات الطالب</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["الحلقة", (student?.circles as { name: string } | null)?.name ?? "—"],
              ["الفرع", (student?.branches as { name: string } | null)?.name ?? "—"],
              ["ولي الأمر", student?.guardian_name ?? "—"],
              ["جوال ولي الأمر", student?.guardian_phone ?? "—"],
              ["تاريخ الالتحاق", student?.join_date ?? "—"],
              ["مجموع الصفحات", `${totalPages}`],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl bg-secondary/50 p-3">
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="font-bold text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
          <h2 className="mb-3 text-base font-extrabold text-primary-deep">بطاقة QR</h2>
          {qr ? (
            <>
              <img src={qr} alt={`رمز QR للطالب ${student?.full_name ?? ""}`} className="mx-auto size-40 rounded-xl border border-border" />
              <a href={qr} download={`${student?.code ?? "student"}.png`} className="mt-3 inline-block text-sm font-bold text-primary-deep hover:underline">
                تحميل البطاقة
              </a>
            </>
          ) : (
            <p className="py-10 text-sm text-muted-foreground">لا يوجد كود للطالب.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-base font-extrabold text-primary-deep">منحنى الحفظ</h2>
        <ProgressAreaChart records={(records ?? []).map((r) => ({ date: r.date, pages: r.pages }))} />
      </div>

      {canEdit && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-4 text-base font-extrabold text-primary-deep">تسجيل متابعة جديدة</h2>
          <form
            className="grid gap-3 sm:grid-cols-3"
            onSubmit={(e) => {
              e.preventDefault();
              addRecord.mutate();
            }}
          >
            <div className="grid gap-1.5">
              <Label>النوع</Label>
              <select
                value={rec.type}
                onChange={(e) => setRec({ ...rec, type: e.target.value })}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                <option value="hifz">حفظ</option>
                <option value="review">مراجعة</option>
                <option value="consolidation">تثبيت</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>عدد الصفحات</Label>
              <Input type="number" step="0.25" min="0" max="60" value={rec.pages} onChange={(e) => setRec({ ...rec, pages: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>التاريخ</Label>
              <Input type="date" value={rec.date} onChange={(e) => setRec({ ...rec, date: e.target.value })} />
            </div>
            <div className="grid gap-1.5">
              <Label>من سورة</Label>
              <Input value={rec.surah_from} onChange={(e) => setRec({ ...rec, surah_from: e.target.value })} maxLength={40} />
            </div>
            <div className="grid gap-1.5">
              <Label>إلى سورة</Label>
              <Input value={rec.surah_to} onChange={(e) => setRec({ ...rec, surah_to: e.target.value })} maxLength={40} />
            </div>
            <div className="grid gap-1.5">
              <Label>التقييم (من 100)</Label>
              <Input type="number" min="0" max="100" value={rec.grade} onChange={(e) => setRec({ ...rec, grade: e.target.value })} />
            </div>
            <Button type="submit" disabled={addRecord.isPending} className="sm:col-span-3">
              حفظ المتابعة
            </Button>
          </form>
        </div>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-base font-extrabold text-primary-deep">آخر سجلات المتابعة</h2>
          <ul className="grid gap-2">
            {(records ?? []).slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                <span className="font-bold">{TYPE_LABEL[r.type] ?? r.type}</span>
                <span className="text-muted-foreground">
                  {r.pages} صفحة — {r.date}
                </span>
              </li>
            ))}
            {(records ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد سجلات بعد.</p>}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="mb-3 text-base font-extrabold text-primary-deep">سجل الحضور</h2>
          <ul className="grid gap-2">
            {(attendance ?? []).slice(0, 10).map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2 text-sm">
                <span>{a.date}</span>
                <Badge variant={a.status === "present" ? "default" : "secondary"}>
                  {a.status === "present" ? "حاضر" : a.status === "late" ? "متأخر" : a.status === "excused" ? "بعذر" : "غائب"}
                </Badge>
              </li>
            ))}
            {(attendance ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا يوجد سجل حضور بعد.</p>}
          </ul>
        </div>
      </div>
    </>
  );
}
