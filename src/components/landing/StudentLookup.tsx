import { useState } from "react";
import { QrCode, Search, Camera } from "lucide-react";

export function StudentLookup() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-elevated sm:p-6">
      <div className="flex items-center gap-2 text-primary-deep">
        <QrCode className="size-5" />
        <h3 className="text-base font-extrabold sm:text-lg">استعراض متابعة الطالب</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        أدخل كود الطالب أو امسح رمز الـ QR الخاص به للاطلاع على تقدمه في الحفظ والمراجعة.
      </p>

      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setMessage(
            code.trim()
              ? "سيتم ربط هذا البحث بقاعدة بيانات الطلاب في المرحلة القادمة."
              : "الرجاء إدخال كود الطالب.",
          );
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="مثال: FRD-2026-0184"
          className="h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-primary px-4 text-sm font-bold text-primary-foreground"
        >
          <Search className="size-4" />
          استعراض
        </button>
        <button
          type="button"
          onClick={() => setMessage("قارئ الـ QR سيُفعَّل مع لوحة الطالب.")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-accent bg-accent-soft px-4 text-sm font-bold text-accent-foreground"
        >
          <Camera className="size-4" />
          مسح QR
        </button>
      </form>

      {message && <p className="mt-3 text-xs font-semibold text-accent-foreground">{message}</p>}
    </div>
  );
}
