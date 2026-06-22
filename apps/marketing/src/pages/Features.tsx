import Seo from "../components/Seo";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

const groups = [
  { title: "For gyms", items: ["Member directory & memberships", "QR door check-ins", "Coach assignment", "Gym plans & offers"] },
  { title: "For online coaches", items: ["Client management", "Workout plan builder", "Nutrition & macros", "Daily check-ins & progress"] },
  { title: "For the platform", items: ["Subscription plans", "Invoices & installments", "MRR & tenant insight", "Super-admin console"] },
];

export default function Features() {
  return (
    <>
      <Seo
        title="Features — FitSync Pro"
        description="Everything to run a gym or coaching business: members, check-ins, workouts, nutrition, billing and platform administration."
      />
      <SiteNav />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px" }}>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.02em", color: "var(--ink)" }}>Features</h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 40 }}>
          Two products, one platform — the gym module and the online coaching module.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {groups.map((g) => (
            <div key={g.title} className="fs-card pad">
              <h3 style={{ margin: "0 0 10px", fontSize: 16, color: "var(--ink)" }}>{g.title}</h3>
              <ul style={{ margin: 0, paddingInlineStart: 18, color: "var(--muted)", fontSize: 14, lineHeight: 1.9 }}>
                {g.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
