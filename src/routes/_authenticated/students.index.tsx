import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/students/")({
  head: () => ({
    meta: [
      { title: "الطلاب | منصة الفردوس" },
      { name: "description", content: "إدارة سجلات طلاب مركز الفردوس القرآني وتوزيعهم على الحلقات." },
      { property: "og:title", content: "الطلاب | منصة الفردوس" },
      { property: "og:description", content: "إدارة سجلات الطلاب وتوزيعهم على الحلقات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentsPage,
});

const STATUS_LABEL: Record<string, string> = {
  active: "نشط",
  inactive: "متوقف",
  graduated: "خريج",
  suspended: "موقوف",
};

function StudentsPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    gender: "male",
    guardian_name: "",
    guardian_phone: "",
    birth_date: "",
    circle_id: "",
    branch_id: "",
  });

  const { data: students, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, code, full_name, gender, guardian_phone, status, circles(name), branches(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: circles } = useQuery({
    queryKey: ["circles-lite"],
    queryFn: async () => (await supabase.from("circles").select("id, name").eq("is_active", true)).data ?? [],
  });
  const { data: branches } = useQuery({
    queryKey: ["branches-lite"],
    queryFn: async () => (await supabase.from("branches").select("id, name").eq("is_active", true)).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (form.full_name.trim().length < 3) throw new Error("الاسم مطلوب");
      const { error } = await supabase.from("students").insert({
        full_name: form.full_name.trim(),
        gender: form.gender,
        guardian_name: form.guardian_name.trim() || null,
        guardian_phone: form.guardian_phone.trim() || null,
        birth_date: form.birth_date || null,
        circle_id: form.circle_id || null,
        branch_id: form.branch_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تمت إضافة الطالب");
      setOpen(false);
      setForm({ full_name: "", gender: "male", guardian_name: "", guardian_phone: "", birth_date: "", circle_id: "", branch_id: "" });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذر حفظ الطالب"),
  });

  const filtered = (students ?? []).filter(
    (s) => s.full_name.includes(q) || (s.code ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="الطلاب"
        subtitle="إدارة سجلات الطلاب وتوزيعهم على الحلقات"
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> إضافة طالب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة طالب جديد</DialogTitle>
              </DialogHeader>
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  create.mutate();
                }}
              >
                <div className="grid gap-1.5">
                  <Label>اسم الطالب</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={120} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>الجنس</Label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="male">ذكر</option>
                      <option value="female">أنثى</option>
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>تاريخ الميلاد</Label>
                    <Input type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>اسم ولي الأمر</Label>
                    <Input value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} maxLength={120} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>جوال ولي الأمر</Label>
                    <Input value={form.guardian_phone} onChange={(e) => setForm({ ...form, guardian_phone: e.target.value })} maxLength={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label>الحلقة</Label>
                    <select
                      value={form.circle_id}
                      onChange={(e) => setForm({ ...form, circle_id: e.target.value })}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="">بدون</option>
                      {(circles ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
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
                </div>
                <Button type="submit" disabled={create.isPending} className="mt-2">
                  حفظ الطالب
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو كود الطالب..." className="pr-9" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-secondary/70 text-xs text-secondary-foreground">
              <tr>
                <th className="px-4 py-3 font-extrabold">الكود</th>
                <th className="px-4 py-3 font-extrabold">الاسم</th>
                <th className="px-4 py-3 font-extrabold">الحلقة</th>
                <th className="px-4 py-3 font-extrabold">الفرع</th>
                <th className="px-4 py-3 font-extrabold">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    جارٍ التحميل...
                  </td>
                </tr>
              )}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    لا يوجد طلاب مطابقون.
                  </td>
                </tr>
              )}
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{s.code}</td>
                  <td className="px-4 py-3 font-bold">
                    <Link to="/students/$id" params={{ id: s.id }} className="text-primary-deep hover:underline">
                      {s.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{(s.circles as { name: string } | null)?.name ?? "—"}</td>
                  <td className="px-4 py-3">{(s.branches as { name: string } | null)?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{STATUS_LABEL[s.status] ?? s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
