import { Droplets, Leaf, Scissors, Sprout } from "lucide-react";

const GUIDES = [
  {
    icon: Droplets,
    badge: "الري",
    title: "اسقِ باعتدال في الصباح",
    body: "في مناخ سكيكدة، الري المبكر يقلل التبخر ويساعد الجذور على الثبات في التربة.",
  },
  {
    icon: Scissors,
    badge: "التقليم",
    title: "قمّ الأفرع الجافة فقط",
    body: "إزالة الأفرع الجافة تحفّز النمو الصحي دون إضعاف الغطاء الأخضر للشتلة.",
  },
  {
    icon: Sprout,
    badge: "الغرس",
    title: "احفر حفرة أوسع من الجذور",
    body: "اترك مساحة كافية حول الجذور وغطِّها بطبقة رقيقة من التربة السطحية.",
  },
  {
    icon: Leaf,
    badge: "المتابعة",
    title: "وثّق كل زيارة ميدانية",
    body: "امسح رمز الموقع وأضف حالة الشجرة ليظهر أثر حملتك في تقارير الولاية.",
  },
];

export default function MagazineGuides() {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
          <Leaf className="size-4" />
        </span>
        <div>
          <h2 className="text-[14px] font-extrabold text-emerald-950">
            دليل سكيكدة البيئي
          </h2>
          <p className="text-[9.5px] text-emerald-950/45">
            خطوات بسيطة تصنع غابة مستدامة
          </p>
        </div>
      </div>

      <div className="grid gap-2.5">
        {GUIDES.map((guide) => {
          const Icon = guide.icon;
          return (
            <article
              key={guide.title}
              className="flex gap-3 rounded-3xl border border-emerald-50 bg-emerald-50/40 p-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0">
                <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  {guide.badge}
                </span>
                <h3 className="mt-1 text-[11.5px] font-extrabold text-emerald-950">
                  {guide.title}
                </h3>
                <p className="mt-1 text-[10px] leading-relaxed text-emerald-950/50">
                  {guide.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
