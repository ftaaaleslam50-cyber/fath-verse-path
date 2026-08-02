import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({
    meta: [
      { title: "طلبات التسجيل | منصة الفردوس" },
      { name: "description", content: "مراجعة طلبات التسجيل الواردة من الموقع وقبولها أو رفضها." },
      { property: "og:title", content: "طلبات التسجيل | منصة الفردوس" },
      { property: "og:description", content: "مراجعة طلبات التسجيل الواردة وقبولها أو رفضها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestsPage,
});

const STATUS: Record<string, string> = { pending: "قيد المراجعة", approved: "مقبول", rejected: "مرفوض" };

function RequestsPage() {
  const qc = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: ["registration-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_requests")
        .select("*, branches(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const req = (requests ?? []).find((r) => r.id === id);
      if (!req) throw new Error("الطلب غير موجود");
      if (approve) {
        const { error: insertError } = await supabase.from("students").insert({
          full_name: req.full_name,
          gender: req.gender,
          birth_date: req.birth_date,
          guardian_name: req.guardian_name,
          guardian_phone: req.guardian_phone,
          branch_id: req.branch_id,
          notes: req.notes,
        });
        if (insertError) throw insertError;
      }
      const { error } = await supabase
        .from("registration_requests")
        .update({ status: approve ? "approved" : "rejected" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.approve ? "تم قبول الطلب وإضافة الطالب" : "تم رفض الطلب");
      qc.invalidateQueries({ queryKey: ["registration-requests"] });
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذر تنفيذ الإجراء"),
  });

  return (
    <>
      <PageHeader title="طلبات التسجيل" subtitle="الطلبات الواردة من نموذج التسجيل في الموقع" />

      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}

      <div className="grid gap-3">
        {(requests ?? []).map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-extrabold text-foreground">{r.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  ولي الأمر: {r.guardian_name || "—"} — {r.guardian_phone}
                </p>
                <p className="text-xs text-muted-foreground">
                  الفرع: {(r.branches as { name: string } | null)?.name ?? "—"} — الوقت المفضل: {r.preferred_time || "—"}
                </p>
                {r.notes && <p className="mt-1 text-xs text-muted-foreground">ملاحظات: {r.notes}</p>}
              </div>
              <Badge variant={r.status === "pending" ? "secondary" : "default"}>{STATUS[r.status]}</Badge>
            </div>
            {r.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.id, approve: true })}>
                  قبول وإضافة كطالب
                </Button>
                <Button size="sm" variant="outline" disabled={decide.isPending} onClick={() => decide.mutate({ id: r.id, approve: false })}>
                  رفض
                </Button>
              </div>
            )}
          </div>
        ))}
        {!isLoading && (requests ?? []).length === 0 && <p className="text-sm text-muted-foreground">لا توجد طلبات حاليًا.</p>}
      </div>
    </>
  );
}
