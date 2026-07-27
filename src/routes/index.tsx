import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Heart,
  MapPin,
  Megaphone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { StudentLookup } from "@/components/landing/StudentLookup";
import logo from "@/assets/firdaws-logo.jpg.asset.json";
import heroImg from "@/assets/hero-center.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مركز الفردوس القرآني | حلقات تحفيظ ومتابعة إلكترونية" },
      {
        name: "description",
        content:
          "مركز الفردوس القرآني: حلقات تحفيظ ومراجعة، متابعة يومية لأولياء الأمور، تسجيل إلكتروني، ولوحة شرف للمتميزين.",
      },
      { property: "og:title", content: "مركز الفردوس القرآني" },
      {
        property: "og:description",
        content: "حلقات تحفيظ ومراجعة ومتابعة إلكترونية دقيقة لكل طالب في جميع فروع المركز.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const stats = [
  { label: "طالب وطالبة", value: "١٢٤٠", icon: Users },
  { label: "حافظ للقرآن", value: "١٨٦", icon: BookOpen },
  { label: "معلم ومعلمة", value: "٦٤", icon: GraduationCap },
  { label: "فروع", value: "٥", icon: MapPin },
  { label: "سنة خبرة", value: "١٢", icon: Award },
];

const reasons = [
  {
    icon: ClipboardCheck,
    title: "متابعة يومية موثقة",
    text: "سجل متابعة لكل طالب يوضح الدرس والمراجعة والتقدير والملاحظات أولًا بأول.",
  },
  {
    icon: ShieldCheck,
    title: "معلمون مجازون",
    text: "نخبة من المعلمين أصحاب الأسانيد والإجازات في القراءات وأحكام التلاوة.",
  },
  {
    icon: Sparkles,
    title: "خطط حفظ مرنة",
    text: "مستويات تناسب المبتدئ والمتقن، مع جدولة حسب المرحلة الدراسية للطالب.",
  },
  {
    icon: Heart,
    title: "تربية قبل التعليم",
    text: "برامج تزكية وأخلاق وأنشطة ورحلات تحبب الطالب في كتاب الله.",
  },
  {
    icon: Star,
    title: "تحفيز ومكافآت",
    text: "نظام نقاط ولوحة شرف أسبوعية وشهرية وتكريم للمتميزين في نهاية كل فصل.",
  },
  {
    icon: Compass,
    title: "شفافية مع الأسرة",
    text: "ولي الأمر يتابع الحضور والحفظ والاختبارات عبر كود الطالب أو رمز QR.",
  },
];

const schedule = [
  { name: "حلقة الفجر", days: "السبت - الأربعاء", time: "٥:٠٠ ص - ٦:٣٠ ص", level: "متقن" },
  { name: "الحلقة الصباحية", days: "السبت - الخميس", time: "٨:٠٠ ص - ١٠:٠٠ ص", level: "متوسط" },
  { name: "حلقة العصر", days: "السبت - الأربعاء", time: "٤:٠٠ م - ٦:٠٠ م", level: "مبتدئ" },
  { name: "حلقة المغرب", days: "يوميًا", time: "بعد المغرب - العشاء", level: "متقدم" },
  { name: "حضانة الفردوس", days: "الأحد - الخميس", time: "٩:٠٠ ص - ١٢:٠٠ م", level: "تمهيدي" },
];

const branches = [
  { name: "الفرع الرئيسي", area: "حي الأندلس - شارع المسجد الكبير", halaqat: 14 },
  { name: "فرع النور", area: "حي النزهة - بجوار مسجد النور", halaqat: 9 },
  { name: "فرع الرحمة", area: "حي السلام - مجمع الرحمة", halaqat: 7 },
  { name: "فرع البنات", area: "حي الياسمين - مقر المركز النسائي", halaqat: 11 },
  { name: "فرع الحضانة", area: "حي الروضة - روضة الفردوس", halaqat: 4 },
];

const news = [
  "بدء التسجيل للفصل الدراسي الجديد",
  "مسابقة الفردوس الكبرى لحفظ القرآن — الجوائز حتى ٥٠٠٠ ريال",
  "حفل تكريم الحفظة يوم الخميس القادم بعد صلاة العشاء",
  "افتتاح فرع جديد في حي الياسمين",
];

const honor = [
  { name: "عبدالرحمن الحارثي", note: "أفضل الحفظ", value: "٣ أجزاء هذا الشهر" },
  { name: "مريم الشمري", note: "أفضل حضور", value: "١٠٠٪ حضور" },
  { name: "يوسف العتيبي", note: "الأعلى تقييمًا", value: "متوسط ٩٨٪" },
  { name: "سارة القحطاني", note: "الأكثر تقدمًا", value: "+٤٠٪ خلال الفصل" },
];

const gallery = [
  { title: "رحلة الفردوس الترفيهية", tag: "رحلات" },
  { title: "مسابقة الحفظ السنوية", tag: "مسابقات" },
  { title: "حفل تكريم الحفظة", tag: "تكريم" },
  { title: "اليوم المفتوح للأسر", tag: "أنشطة" },
];

const steps = [
  { n: "١", t: "نوع التسجيل", d: "حلقات القرآن أو الحضانة" },
  { n: "٢", t: "المستوى", d: "مبتدئ / متوسط / متقن" },
  { n: "٣", t: "الفرع", d: "اختيار الفرع الأقرب" },
  { n: "٤", t: "بيانات الطالب", d: "البيانات والمستندات ثم الإرسال" },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* شريط الأخبار */}
      <div className="overflow-hidden border-b border-border bg-primary-deep py-2">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">
            <Megaphone className="size-3.5" /> إعلانات
          </span>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm text-primary-foreground/90">{news.join("  •  ")}</p>
          </div>
        </div>
      </div>

      {/* البطل */}
      <section id="home" className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="قاعة تحفيظ القرآن الكريم في مركز الفردوس"
          width={1600}
          height={1008}
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-veil" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <img
              src={logo.url}
              alt="شعار مركز الفردوس القرآني"
              width={320}
              height={180}
              className="h-20 w-auto rounded-xl bg-card/95 p-2 shadow-soft sm:h-24"
            />
            <p className="mt-6 font-quran text-xl leading-[2.4] text-primary-foreground sm:text-2xl">
              ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
            </p>
            <h1 className="mt-4 text-3xl leading-tight text-primary-foreground sm:text-5xl">
              مركز الفردوس القرآني
              <span className="mt-2 block text-xl font-bold text-accent sm:text-2xl">
                منصة متكاملة لتحفيظ القرآن ومتابعة الطلاب
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              حلقات تحفيظ ومراجعة في خمسة فروع، مع نظام إلكتروني يوثق حضور الطالب وحفظه وتقييمه،
              ويتيح لولي الأمر متابعة أبنائه لحظة بلحظة.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#register"
                className="rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground shadow-elevated transition-transform hover:-translate-y-0.5"
              >
                تسجيل طالب جديد
              </a>
              <a
                href="#video"
                className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/40 bg-card/10 px-6 py-3 text-sm font-extrabold text-primary-foreground backdrop-blur transition-colors hover:bg-card/20"
              >
                <PlayCircle className="size-5" /> فيديو تعريفي
              </a>
            </div>
          </div>

          <StudentLookup />
        </div>
      </section>

      {/* الإحصائيات */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 py-8 sm:px-6 md:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-4 text-center">
              <s.icon className="mx-auto size-6 text-accent" />
              <p className="mt-2 text-3xl font-extrabold text-primary-deep">{s.value}</p>
              <p className="text-xs font-semibold text-muted-foreground sm:text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* عن المركز */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="من نحن" title="نبذة عن مركز الفردوس" />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft lg:col-span-1">
            <h3 className="text-lg text-primary-deep">نبذة</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              مركز تعليمي متخصص في تحفيظ القرآن الكريم وتعليم أحكام التلاوة، تأسس ليكون بيتًا ثانيًا
              لأبنائنا، يجمع بين إتقان الحفظ وحسن التربية عبر حلقات منظمة ومعلمين مجازين.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/25 bg-primary-soft p-6 shadow-soft">
            <h3 className="text-lg text-primary-deep">رسالتنا</h3>
            <p className="mt-3 text-sm leading-relaxed text-primary-deep/80">
              تيسير حفظ كتاب الله لكل فئات المجتمع ببيئة تعليمية محفزة، ومنهجية متابعة دقيقة تشارك
              فيها الأسرة والمعلم والإدارة.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 shadow-soft">
            <h3 className="text-lg text-accent-foreground">رؤيتنا</h3>
            <p className="mt-3 text-sm leading-relaxed text-accent-foreground/80">
              أن نكون المرجع الأول في تعليم القرآن الكريم رقميًا وتربويًا، وأن يتخرج من المركز جيل
              حافظ متقن عامل بكتاب الله.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-elevated"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <r.icon className="size-5" />
              </span>
              <h4 className="mt-4 text-base text-foreground">{r.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* فيديو */}
      <section id="video" className="bg-primary-deep py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-primary-foreground/15 bg-card/10 p-8 text-center backdrop-blur">
            <PlayCircle className="mx-auto size-14 text-accent" />
            <h2 className="mt-4 text-2xl text-primary-foreground">فيديو تعريفي بالمركز</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/80">
              جولة داخل حلقات المركز وأنشطته وبرامجه التربوية. سيتم إدراج الفيديو الرسمي هنا.
            </p>
          </div>
        </div>
      </section>

      {/* أوقات الحلقات */}
      <section id="schedule" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="الجدول" title="أوقات الحلقات" />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
          <table className="w-full min-w-[560px] text-right text-sm">
            <thead className="bg-secondary text-primary-deep">
              <tr>
                <th className="px-5 py-3 font-extrabold">الحلقة</th>
                <th className="px-5 py-3 font-extrabold">الأيام</th>
                <th className="px-5 py-3 font-extrabold">الوقت</th>
                <th className="px-5 py-3 font-extrabold">المستوى</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s) => (
                <tr key={s.name} className="border-t border-border">
                  <td className="px-5 py-3 font-bold text-foreground">
                    <CalendarDays className="ml-2 inline size-4 text-accent" />
                    {s.name}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{s.days}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.time}</td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary-deep">
                      {s.level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* الفروع */}
      <section id="branches" className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="أين نحن" title="فروع المركز" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branches.map((b) => (
              <div key={b.name} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-foreground">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-base text-foreground">{b.name}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{b.area}</p>
                    <p className="mt-2 text-xs font-bold text-primary">{b.halaqat} حلقة نشطة</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="pattern-arabesque flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-primary/40 bg-card p-5 text-center">
              <p className="text-sm font-bold text-primary-deep">
                خريطة الفروع التفاعلية
                <span className="mt-1 block text-xs font-medium text-muted-foreground">
                  ستُضاف مع بيانات المواقع الفعلية
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* لوحة الشرف */}
      <section id="honor" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="تميّزوا" title="لوحة الشرف" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {honor.map((h, i) => (
            <div
              key={h.name}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-soft"
            >
              <span className="absolute start-4 top-4 rounded-full bg-gradient-accent px-2.5 py-1 text-[11px] font-extrabold text-primary-foreground">
                #{i + 1}
              </span>
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary-deep">
                <Award className="size-7" />
              </div>
              <h4 className="mt-3 text-base text-foreground">{h.name}</h4>
              <p className="text-xs font-bold text-accent-foreground">{h.note}</p>
              <p className="mt-2 text-sm text-muted-foreground">{h.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* المعرض */}
      <section id="gallery" className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle eyebrow="من أنشطتنا" title="معرض الصور والأنشطة" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {gallery.map((g) => (
              <div
                key={g.title}
                className="pattern-arabesque flex aspect-[4/3] flex-col justify-end rounded-2xl border border-border bg-card p-4 shadow-soft"
              >
                <span className="w-fit rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-extrabold text-primary-deep">
                  {g.tag}
                </span>
                <p className="mt-2 text-sm font-bold text-foreground">{g.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* التسجيل */}
      <section id="register" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle eyebrow="انضم إلينا" title="التسجيل الإلكتروني في أربع خطوات" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-primary text-base font-extrabold text-primary-foreground">
                {s.n}
              </span>
              <h4 className="mt-3 text-base text-foreground">{s.t}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-primary p-6 text-primary-foreground shadow-elevated">
          <p className="text-base font-extrabold sm:text-lg">
            التسجيل مفتوح الآن للفصل الدراسي الجديد
          </p>
          <button
            type="button"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-extrabold text-accent-foreground"
          >
            ابدأ التسجيل
          </button>
        </div>
      </section>

      <footer className="border-t border-border bg-primary-deep py-10 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 md:grid-cols-3">
          <div>
            <img
              src={logo.url}
              alt="شعار مركز الفردوس القرآني"
              width={200}
              height={112}
              loading="lazy"
              className="h-14 w-auto rounded-lg bg-card p-1"
            />
            <p className="mt-4 max-w-xs text-sm text-primary-foreground/80">
              مركز الفردوس القرآني — تحفيظ وإتقان ومتابعة تربوية لكل طالب.
            </p>
          </div>
          <div>
            <h4 className="text-base text-primary-foreground">روابط سريعة</h4>
            <ul className="mt-3 space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#about" className="hover:text-accent">عن المركز</a></li>
              <li><a href="#schedule" className="hover:text-accent">أوقات الحلقات</a></li>
              <li><a href="#branches" className="hover:text-accent">الفروع</a></li>
              <li><a href="#register" className="hover:text-accent">التسجيل</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-base text-primary-foreground">تواصل معنا</h4>
            <p className="mt-3 text-sm text-primary-foreground/80">
              الفرع الرئيسي: حي الأندلس - شارع المسجد الكبير
            </p>
            <p className="mt-1 text-sm text-primary-foreground/80">هاتف: 0500000000</p>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} مركز الفردوس القرآني. جميع الحقوق محفوظة.
        </p>
      </footer>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center">
      <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-extrabold text-accent-foreground">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-2xl text-primary-deep sm:text-3xl">{title}</h2>
      <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-accent" />
    </div>
  );
}
