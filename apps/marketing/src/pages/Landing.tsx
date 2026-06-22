import { Link } from "react-router";
import Seo from "../components/Seo";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

const features = [
  { title: "Gym management", body: "Members, check-ins via QR, coaches and plans — one facility dashboard." },
  { title: "Online coaching", body: "Independent coaches run clients, workouts and nutrition end-to-end." },
  { title: "Billing & subscriptions", body: "Plans, invoices and installments with MRR insight for the platform." },
];

export default function Landing() {
  return (
    <>
      <Seo
        title="FitSync Pro — Gym management & online coaching for Egypt"
        description="Run your gym or online coaching business: members, check-ins, workouts, nutrition, billing and subscriptions — Arabic-first."
      />
      <SiteNav />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "72px 24px" }}>
        <section style={{ maxWidth: 680 }}>
          <span className="fs-eyebrow">Egypt-first fitness platform</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "12px 0 18px", color: "var(--ink)" }}>
            Run your gym and coaching business in one place.
          </h1>
          <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.6, marginBottom: 28 }}>
            FitSync Pro unifies gym operations and online coaching — members, check-ins,
            workout and nutrition plans, billing and subscriptions — built for the Egyptian market.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/application" className="fs-btn accent">Get started</a>
            <Link to="/features" className="fs-btn ghost">See features</Link>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 72 }}>
          {features.map((f) => (
            <div key={f.title} className="fs-card pad">
              <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "var(--ink)" }}>{f.title}</h3>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 14, lineHeight: 1.55 }}>{f.body}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
