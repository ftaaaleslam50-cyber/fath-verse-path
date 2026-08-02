import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/setup-admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تفعيل مدير النظام | منصة الفردوس" },
      { name: "description", content: "صفحة الإعداد الأولي لمنح صلاحية مدير النظام لأول حساب في منصة مركز الفردوس القرآني." },
      { property: "og:title", content: "تفعيل مدير النظام | منصة الفردوس" },
      { property: "og:description", content: "الإعداد الأولي لمنح صلاحية مدير النظام لأول حساب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SetupAdminPage,
});

function SetupAdminPage() {
  const { user, roles } = useAuth();
  const [busy, setBusy] = useState(false);

  const claim = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc("claim_admin");
    setBusy(false);
    if (error) return toast.error("تعذر تنفيذ العملية");
    if (data === "granted") return toast.success("تم منحك صلاحية مدير النظام، أعد تحميل الصفحة");
    if (data === "already_admin") return toast.info("أنت بالفعل مدير النظام");
    if (data === "admin_exists") return toast.error("يوجد مدير نظام بالفعل، اطلب منه منحك الصلاحية");
    toast.error("سجّل الدخول أولًا");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-elevated">
        <h1 className="text-xl font-extrabold text-primary-deep">تفعيل مدير النظام</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          تُستخدم هذه الصفحة مرة واحدة فقط: أول حساب يضغط الزر يحصل على صلاحية مدير النظام إذا لم يوجد مدير بعد.
        </p>

        {!user ? (
          <Link to="/auth" className="mt-5 inline-block font-bold text-primary-deep hover:underline">
            سجّل الدخول أولًا
          </Link>
        ) : (
          <>
            <p className="mt-4 text-xs text-muted-foreground">الحساب الحالي: {user.email}</p>
            <p className="text-xs text-muted-foreground">الصلاحيات الحالية: {roles.join("، ") || "بدون"}</p>
            <Button className="mt-5 w-full" disabled={busy} onClick={claim}>
              منحني صلاحية مدير النظام
            </Button>
            <Link to="/dashboard" className="mt-4 inline-block text-xs font-bold text-primary-deep hover:underline">
              الذهاب إلى لوحة التحكم
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
