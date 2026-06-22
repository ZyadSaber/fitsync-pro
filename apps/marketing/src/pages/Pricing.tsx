import Seo from "../components/Seo";
import SiteNav from "../components/SiteNav";
import SiteFooter from "../components/SiteFooter";

const tiers = [
  { name: "Starter", price: "499", note: "Small gyms & solo coaches", features: ["Up to 100 members", "QR check-ins", "1 coach seat"] },
  { name: "Pro", price: "1,299", note: "Growing facilities", features: ["Up to 500 members", "Unlimited coaches", "Billing & invoices"] },
  { name: "Enterprise", price: "Contact us", note: "Chains & franchises", features: ["Unlimited members", "Multi-branch", "Priority support"] },
];

export default function Pricing() {
  return (
    <>
      <Seo
        title="Pricing — FitSync Pro"
        description="Simple plans for gyms and online coaches in Egypt. Start small and scale to multi-branch enterprise."
      />
      <SiteNav />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 24px" }}>
        <h1 style={{ fontSize: 40, letterSpacing: "-0.02em", color: "var(--ink)" }}>Pricing</h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginBottom: 40 }}>
          Transparent EGP pricing. Switch plans any time.
        </p>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {tiers.map((t) => (
            <div key={t.name} className="fs-card pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className="fs-eyebrow">{t.note}</span>
              <h3 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>{t.name}</h3>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--ink)" }} className="fs-num">
                {t.price === "Contact us" ? t.price : `${t.price} EGP`}
                {t.price !== "Contact us" && <span style={{ fontSize: 14, color: "var(--muted)" }}> / mo</span>}
              </div>
              <ul style={{ margin: "8px 0 0", paddingInlineStart: 18, color: "var(--muted)", fontSize: 14, lineHeight: 1.8 }}>
                {t.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <a href="/application" className="fs-btn accent" style={{ marginTop: "auto" }}>Choose {t.name}</a>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
