import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, BookOpenCheck, CalendarCheck, BookMarked } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/app/AppShell";
import { StatCard } from "@/components/app/StatCard";
import { ProgressAreaChart } from "@/components/app/ProgressAreaChart";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | منصة الفردوس" },
      { name: "description", content: "لوحة تحكم منصة مركز الفردوس القرآني: إحصائيات الطلاب والحلقات والحفظ." },
      { property: "og:title", content: "لوحة التحكم | منصة الفردوس" },
      { property: "og:description", content: "إحصائيات الطلاب والحلقات ومتابعة الحفظ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { isStaff, roles, user, primaryRole } = useAuth();
  const isTeacher = roles.includes("teacher");

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id, isStaff, isTeacher],
    queryFn: async () => {
      const [students, circles, requests, records, attendance] = await Promise.all([
        supabase.from("students").select("id, status", { count: "exact" }),
        supabase.from("circles").select("id", { count: "exact" }),
        supabase.from("registration_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("progress_records").select("date, pages"),
        supabase.from("attendance").select("status"),
      ]);
      const att = attendance.data ?? [];
      const present = att.filter((a) => a.status === "present" || a.status === "late").length;
      return {
        students: students.count ?? 0,
        active: (students.data ?? []).filter((s) => s.status === "active").length,
        circles: circles.count ?? 0,
        pending: requests.count ?? 0,
        pages: (records.data ?? []).reduce((sum, r) => sum + Number(r.pages ?? 0), 0),
        attendanceRate: att.length ? Math.round((present / att.length) * 100) : 0,
        records: records.data ?? [],
      };
    },
  });

  const { data: myStudents } = useQuery({
    queryKey: ["my-students", user?.id],
    enabled: !!user && !isStaff && !isTeacher,
    queryFn: async () => {
      const { data } = await supabase
        .from("students")
        .select("id, code, full_name, circles(name)")
        .or(`parent_id.eq.${user!.id},user_id.eq.${user!.id}`);
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        subtitle={`مرحبًا بك في منصة مركز الفردوس القرآني${primaryRole ? "" : ""}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="إجمالي الطلاب" value={stats?.students ?? 0} hint={`${stats?.active ?? 0} نشط`} />
        <StatCard icon={BookOpenCheck} label="الحلقات" value={stats?.circles ?? 0} />
        <StatCard icon={BookMarked} label="مجموع الصفحات المحفوظة" value={stats?.pages ?? 0} />
        <StatCard icon={CalendarCheck} label="نسبة الحضور" value={`${stats?.attendanceRate ?? 0}%`} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h2 className="mb-4 text-base font-extrabold text-primary-deep">تطور الحفظ خلال الأشهر الأخيرة</h2>
        <ProgressAreaChart records={stats?.records ?? []} />
      </div>

      {!isStaff && !isTeacher && (
        <div className="mt-6">
          <h2 className="mb-3 text-base font-extrabold text-primary-deep">الطلاب المرتبطون بحسابك</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(myStudents ?? []).map((s) => (
              <Link
                key={s.id}
                to="/students/$id"
                params={{ id: s.id }}
                className="rounded-2xl border border-border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <p className="font-extrabold text-foreground">{s.full_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.code} — {(s.circles as { name: string } | null)?.name ?? "بدون حلقة"}
                </p>
              </Link>
            ))}
            {(myStudents ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">لا يوجد طلاب مرتبطون بحسابك بعد. تواصل مع إدارة المركز للربط.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
