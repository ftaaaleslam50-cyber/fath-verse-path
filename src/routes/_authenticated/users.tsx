import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/AppShell";
import { useAuth, ROLE_LABELS, type AppRole } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/users")({
  head: () => ({
    meta: [
      { title: "المستخدمون والصلاحيات | منصة الفردوس" },
      { name: "description", content: "إدارة حسابات المستخدمين وتحديد صلاحياتهم في منصة مركز الفردوس القرآني." },
      { property: "og:title", content: "المستخدمون والصلاحيات | منصة الفردوس" },
      { property: "og:description", content: "إدارة حسابات المستخدمين وصلاحياتهم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UsersPage,
});

const ROLES: AppRole[] = ["admin", "supervisor", "teacher", "parent", "student"];

function UsersPage() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users-roles"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("id, full_name, phone").order("created_at");
      if (error) throw error;
      const { data: roleRows } = await supabase.from("user_roles").select("user_id, role");
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roleRows ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as AppRole),
      }));
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, role, add }: { userId: string; role: AppRole; add: boolean }) => {
      if (add) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("تم تحديث الصلاحية");
      qc.invalidateQueries({ queryKey: ["users-roles"] });
    },
    onError: () => toast.error("تعذر تحديث الصلاحية"),
  });

  return (
    <>
      <PageHeader title="المستخدمون والصلاحيات" subtitle="تحديد أدوار المستخدمين داخل المنصة" />

      {!isAdmin && (
        <p className="mb-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          يمكنك الاطلاع فقط؛ تعديل الصلاحيات متاح لمدير النظام.
        </p>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>}

      <div className="grid gap-3">
        {(data ?? []).map((u) => (
          <div key={u.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-extrabold text-foreground">{u.full_name || "بدون اسم"}</p>
                <p className="text-xs text-muted-foreground">{u.phone || "—"}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {u.roles.map((r) => (
                  <Badge key={r}>{ROLE_LABELS[r]}</Badge>
                ))}
                {u.roles.length === 0 && <Badge variant="secondary">بدون صلاحية</Badge>}
              </div>
            </div>
            {isAdmin && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {ROLES.map((r) => {
                  const on = u.roles.includes(r);
                  return (
                    <Button
                      key={r}
                      size="sm"
                      variant={on ? "default" : "outline"}
                      disabled={setRole.isPending}
                      onClick={() => setRole.mutate({ userId: u.id, role: r, add: !on })}
                    >
                      {ROLE_LABELS[r]}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
