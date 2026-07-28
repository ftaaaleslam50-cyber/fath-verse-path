import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/firdaws-logo.jpg.asset.json";

const links = [
  { label: "الرئيسية", href: "#home" },
  { label: "عن المركز", href: "#about" },
  { label: "الحلقات", href: "#schedule" },
  { label: "الفروع", href: "#branches" },
  { label: "الأنشطة", href: "#gallery" },
  { label: "لوحة الشرف", href: "#honor" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#home" className="flex items-center gap-3">
          <img
            src={logo.url}
            alt="شعار مركز الفردوس القرآني"
            width={160}
            height={90}
            className="h-11 w-auto rounded-md"
          />
          <span className="sr-only">مركز الفردوس القرآني</span>
        </a>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-primary-deep"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/auth"
            className="rounded-lg border border-border px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
          >
            تسجيل الدخول
          </Link>
          <a
            href="#register"
            className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
          >
            تسجيل طالب جديد
          </a>
        </div>

        <button
          type="button"
          aria-label="القائمة"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-border p-2 text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <nav className="grid gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#register"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-gradient-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground"
            >
              تسجيل طالب جديد
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
