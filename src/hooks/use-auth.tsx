import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "supervisor" | "teacher" | "parent" | "student";

type AuthValue = {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  loading: boolean;
  isStaff: boolean;
  primaryRole: AppRole | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  user: null,
  session: null,
  roles: [],
  loading: true,
  isStaff: false,
  primaryRole: null,
  signOut: async () => {},
});

const ORDER: AppRole[] = ["admin", "supervisor", "teacher", "parent", "student"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadRoles = async (userId: string | undefined) => {
      if (!userId) {
        if (active) setRoles([]);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      if (active) setRoles((data ?? []).map((r) => r.role as AppRole));
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      void loadRoles(s?.user?.id);
    });

    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadRoles(data.session?.user?.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthValue>(() => {
    const primaryRole = ORDER.find((r) => roles.includes(r)) ?? null;
    return {
      user: session?.user ?? null,
      session,
      roles,
      loading,
      isStaff: roles.includes("admin") || roles.includes("supervisor"),
      primaryRole,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    };
  }, [session, roles, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير النظام",
  supervisor: "مشرف",
  teacher: "معلم",
  parent: "ولي أمر",
  student: "طالب",
};
