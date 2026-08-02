import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/circles")({
  head: () => ({
    meta: [
      { title: "الحلقات | منصة الفردوس" },
      { name: "description", content: "إدارة حلقات مركز الفردوس القرآني: المعلمون والمواعيد والسعة والفروع." },
      { property: "og:title", content: "الحلقات | منصة الفردوس" },
      { property: "og:description", content: "إدارة الحلقات والمعلمين والمواعيد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CirclesPage,
});

const DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function CirclesPage() {
  const { isStaff } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    level: "",
    gender: "male",
    branch_id: "",
    teacher_id: "",
    capacity: "20",
    time_from: "17:00",
    time_to: "19:00",
    days: [] as string[],
  });

  const { data: circles, isLoading } = useQuery({
    queryKey: ["circles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circles")
        .select("*, branches(name), profiles:teacher_id(full_name), students(id)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: branches } = useQuery({
    queryKey: ["branches-lite"],
    queryFn: async () => (await supabase.from("branches").select("id, name").eq("is_active", true)).data ?? [],
  });

  const { data: teachers } = useQuery({
    queryKey: ["teachers-lite"],
    enabled: isStaff,
    queryFn: async () => {
      const { data: roleRows } = await supabase.from("user_roles").select("user_id").eq("role", "teacher");
      const ids = (roleRows ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [];
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (form.name.trim().length < 2) throw new Error("اسم الحلقة مطلوب");
      const { error } = await supabase.from("circles").insert({
        name: form.name.trim(),
        level: form.level.trim() || null,
        gender: form.gender,
        branch_id: form.branch_id || null,
        teacher_id: form.teacher_id || null,
        capacity: Number(form.capacity) || 20,
        time_from: form.time_from || null,
        time_to: form.time_to || null,
        days: form.days,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت إضافة الحلقة");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["circles"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذر حفظ الحلقة"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("circles").update({ is_active: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["circles"] }),
    onError: () => toast.error("تعذر تحديث الحلقة"),
  });

  return (
    <>
      <PageHeader
        title="الحلقات"
        subtitle="مواعيد الحلقات والمعلمون المسؤولون وسعة كل حلقة"
        action={
          isStaff ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> إضافة حلقة
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>إضافة حلقة جديدة</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <div className="grid gap-1.5">
                    <Label>اسم الحلقة</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={80} required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>المستوى</Label>
                      <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} maxLength={40} placeholder="مبتدئ / متقدم" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>الفئة</Label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="male">بنين</option>
                        <option value="female">بنات</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>الفرع</Label>
                      <select
                        value={form.branch_id}
                        onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="">بدون</option>
                        {(branches ?? []).map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>المعلم</Label>
                      <select
                        value={form.teacher_id}
                        onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      >
                        <option value="">بدون</option>
                        {(teachers ?? []).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.full_name || "معلم"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="grid gap-1.5">
                      <Label>من</Label>
                      <Input type="time" value={form.time_from} onChange={(e) => setForm({ ...form, time_from: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>إلى</Label>
                      <Input type="time" value={form.time_to} onChange={(e) => setForm({ ...form, time_to: e.target.value })} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>السعة</Label>
                      <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>أيام الحلقة</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map((d) => {
                        const on = form.days.includes(d);
                        return (
                          <button
                            key={d}
                            type="button"
                            onClick={() =>
                              setForm({ ...form, days: on ? form.days.filter((x) => x !== d) : [...form.days, d] })
                            }
                            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                              on ? "border-primary bg-primary-soft text-primary-deep" : "border-border text-muted-foreground"
                            }`}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <Button type="submit" disabled={create.isPending} className="mt-2">
                    حفظ الحلقة
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {(circles ?? []).map((c) => {
          const teacher = c.profiles as { full_name: string } | null;
          const count = (c.students as { id: string }[] | null)?.length ?? 0;
          return (
            <div key={c.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-primary-deep">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {(c.branches as { name: string } | null)?.name ?? "بدون فرع"} — {teacher?.full_name || "بدون معلم"}
                  </p>
                </div>
                <Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "نشطة" : "متوقفة"}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <p>الفئة: {c.gender === "female" ? "بنات" : "بنين"}</p>
                <p>المستوى: {c.level || "—"}</p>
                <p>
                  الوقت: {c.time_from?.slice(0, 5) ?? "—"} - {c.time_to?.slice(0, 5) ?? "—"}
                </p>
                <p>
                  الطلاب: {count} / {c.capacity}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(c.days ?? []).map((d: string) => (
                  <span key={d} className="rounded-md bg-secondary px-2 py-1 text-[11px] font-bold text-secondary-foreground">
                    {d}
                  </span>
                ))}
              </div>
              {isStaff && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => toggleActive.mutate({ id: c.id, value: !c.is_active })}
                >
                  {c.is_active ? "إيقاف الحلقة" : "تفعيل الحلقة"}
                </Button>
              )}
            </div>
          );
        })}
        {!isLoading && (circles ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد حلقات بعد.</p>
        )}
      </div>
    </>
  );
}
