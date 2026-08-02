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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/announcements")({
  head: () => ({
    meta: [
      { title: "الإعلانات | منصة الفردوس" },
      { name: "description", content: "إعلانات مركز الفردوس القرآني الموجهة للطلاب وأولياء الأمور والمعلمين." },
      { property: "og:title", content: "الإعلانات | منصة الفردوس" },
      { property: "og:description", content: "إعلانات المركز للطلاب وأولياء الأمور والمعلمين." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnnouncementsPage,
});

const AUDIENCE: Record<string, string> = { all: "الجميع", parents: "أولياء الأمور", students: "الطلاب", teachers: "المعلمون" };

function AnnouncementsPage() {
  const { isStaff, user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "all" });

  const { data: items, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (form.title.trim().length < 3) throw new Error("عنوان الإعلان مطلوب");
      const { error } = await supabase.from("announcements").insert({
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        created_by: user?.id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم نشر الإعلان");
      setOpen(false);
      setForm({ title: "", body: "", audience: "all" });
      qc.invalidateQueries({ queryKey: ["announcements"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذر نشر الإعلان"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, value }: { id: string; value: boolean }) => {
      const { error } = await supabase.from("announcements").update({ is_published: value }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
    onError: () => toast.error("تعذر تحديث الإعلان"),
  });

  return (
    <>
      <PageHeader
        title="الإعلانات"
        subtitle="تعميمات المركز وأخباره"
        action={
          isStaff ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> إعلان جديد
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إعلان جديد</DialogTitle>
                </DialogHeader>
                <form
                  className="grid gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    create.mutate();
                  }}
                >
                  <div className="grid gap-1.5">
                    <Label>العنوان</Label>
                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>النص</Label>
                    <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} maxLength={2000} required />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>الفئة المستهدفة</Label>
                    <select
                      value={form.audience}
                      onChange={(e) => setForm({ ...form, audience: e.target.value })}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                    >
                      {Object.entries(AUDIENCE).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" disabled={create.isPending} className="mt-2">
                    نشر الإعلان
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}

      <div className="grid gap-3">
        {(items ?? []).map((a) => (
          <article key={a.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-base font-extrabold text-primary-deep">{a.title}</h2>
              <Badge variant={a.is_published ? "default" : "secondary"}>{AUDIENCE[a.audience] ?? a.audience}</Badge>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{a.body}</p>
            {isStaff && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => togglePublish.mutate({ id: a.id, value: !a.is_published })}>
                {a.is_published ? "إخفاء" : "نشر"}
              </Button>
            )}
          </article>
        ))}
        {!isLoading && (items ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد إعلانات بعد.</p>}
      </div>
    </>
  );
}
