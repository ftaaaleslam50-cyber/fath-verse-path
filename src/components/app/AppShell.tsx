import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Megaphone,
  ShieldCheck,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, ROLE_LABELS } from "@/hooks/use-auth";
import logo from "@/assets/firdaws-logo.jpg.asset.json";

type NavItem = { to: string; label: string; icon: typeof Users; roles: string[] };

const NAV: NavItem[] = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, roles: ["admin", "supervisor", "teacher", "parent", "student"] },
  { to: "/students", label: "الطلاب", icon: Users, roles: ["admin", "supervisor", "teacher"] },
  { to: "/circles", label: "الحلقات", icon: BookOpen, roles: ["admin", "supervisor", "teacher"] },
  { to: "/attendance", label: "التحضير اليومي", icon: CalendarCheck, roles: ["admin", "supervisor", "teacher"] },
  { to: "/requests", label: "طلبات التسجيل", icon: ClipboardList, roles: ["admin", "supervisor"] },
  { to: "/announcements", label: "الإعلانات", icon: Megaphone, roles: ["admin", "supervisor", "teacher", "parent", "student"] },
  { to: "/users", label: "المستخدمون", icon: ShieldCheck, roles: ["admin", "supervisor"] },
];


export function AppShell({ children }: { children: ReactNode }) {
  const { roles, primaryRole, user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const items = NAV.filter((i) => i.roles.some((r) => roles.includes(r as never)));

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = (
    <nav className="grid gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to as never}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-sidebar p-4 lg:flex">
        <div>
          <Link to="/" className="mb-6 flex items-center gap-2">
            <img src={logo.url} alt="شعار المركز" className="h-10 w-auto rounded-md" />
            <span className="text-sm font-extrabold text-sidebar-foreground">منصة الفردوس</span>
          </Link>
          {nav}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-sidebar-foreground/80 hover:bg-sidebar-accent"
        >
          <LogOut className="size-4" /> تسجيل الخروج
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur">
          <button className="rounded-lg border border-border p-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="القائمة">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-foreground">
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground">{primaryRole ? ROLE_LABELS[primaryRole] : "مستخدم"}</p>
          </div>
        </header>

        {open && (
          <div className="border-b border-border bg-sidebar p-3 lg:hidden">
            {nav}
            <button
              onClick={handleSignOut}
              className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-sidebar-foreground/80"
            >
              <LogOut className="size-4" /> تسجيل الخروج
            </button>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-primary-deep">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
