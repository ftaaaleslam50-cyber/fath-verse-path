import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logo from "@/assets/firdaws-logo.jpg.asset.json";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | مركز الفردوس القرآني" },
      { name: "description", content: "الدخول إلى منصة مركز الفردوس القرآني لمتابعة الحلقات والحفظ." },
      { property: "og:title", content: "تسجيل الدخول | مركز الفردوس القرآني" },
      { property: "og:description", content: "الدخول إلى منصة مركز الفردوس القرآني لمتابعة الحلقات والحفظ." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"parent" | "student">("parent");

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error("تعذر تسجيل الدخول: تحقق من البريد وكلمة المرور");
    toast.success("مرحبًا بك");
    navigate({ to: "/dashboard", replace: true });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 3) return toast.error("الرجاء إدخال الاسم الكامل");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName.trim(), phone: phone.trim(), role },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("registered") ? "البريد مسجل مسبقًا" : "تعذر إنشاء الحساب");
    toast.success("تم إنشاء الحساب بنجاح");
    navigate({ to: "/dashboard", replace: true });
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    setBusy(false);
    if (result.error) return toast.error("تعذر الدخول عبر Google");
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated">
        <Link to="/" className="mx-auto mb-4 block w-fit">
          <img src={logo.url} alt="شعار مركز الفردوس القرآني" className="h-14 w-auto rounded-md" />
        </Link>
        <h1 className="text-center text-xl font-extrabold text-primary-deep">منصة مركز الفردوس القرآني</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">سجّل الدخول لمتابعة الحلقات والحفظ</p>

        <Tabs defaultValue="signin" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">دخول</TabsTrigger>
            <TabsTrigger value="signup">حساب جديد</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form className="grid gap-3" onSubmit={signIn}>
              <div className="grid gap-1.5">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="mt-1 w-full">
                تسجيل الدخول
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form className="grid gap-3" onSubmit={signUp}>
              <div className="grid gap-1.5">
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">رقم الجوال</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
              </div>
              <div className="grid gap-1.5">
                <Label>نوع الحساب</Label>
                <div className="flex gap-2">
                  {(["parent", "student"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold transition-colors ${
                        role === r ? "border-primary bg-primary-soft text-primary-deep" : "border-border text-muted-foreground"
                      }`}
                    >
                      {r === "parent" ? "ولي أمر" : "طالب"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email2">البريد الإلكتروني</Label>
                <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="password2">كلمة المرور</Label>
                <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <Button type="submit" disabled={busy} className="mt-1 w-full">
                إنشاء الحساب
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> أو <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={google}>
          المتابعة عبر Google
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="font-bold text-primary-deep hover:underline">
            العودة إلى الموقع
          </Link>
        </p>
      </div>
    </main>
  );
}
