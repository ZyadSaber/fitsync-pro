import Icon from "@/components/ui/Icon";
import HeaderContent from "@/components/layout/Topbar";
import PlanBadge, { type Plan } from "@/components/superadmin/PlanBadge";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Trial"      as Plan,
    priceMo: 0,
    cap: 100,
    count: 11,
    color: "#D97706",
    features: ["14 days", "No card needed", "All Pro features"],
    featured: false,
  },
  {
    name: "Starter"    as Plan,
    priceMo: 1800,
    cap: 200,
    count: 187,
    color: "#475569",
    features: ["200 members", "5 GB storage", "Email support"],
    featured: false,
  },
  {
    name: "Pro"        as Plan,
    priceMo: 4500,
    cap: 1000,
    count: 218,
    color: "#2D5BFF",
    features: ["1,000 members", "100 GB storage", "WhatsApp tier", "Priority support"],
    featured: true,
  },
  {
    name: "Elite"      as Plan,
    priceMo: 9800,
    cap: 3000,
    count: 47,
    color: "#0B0F1A",
    features: ["3,000 members", "500 GB storage", "Multi-branch", "Dedicated CSM"],
    featured: false,
  },
  {
    name: "Custom"     as Plan,
    priceMo: null,
    cap: 6000,
    count: 8,
    color: "#6D28D9",
    features: ["Negotiated cap", "SSO + API access", "SLA 99.95%"],
    featured: false,
  },
  {
    name: "Coach Solo" as Plan,
    priceMo: 1200,
    cap: 50,
    count: 94,
    color: "#059669",
    features: ["50 clients", "Workout builder", "Nutrition plans"],
    featured: false,
  },
  {
    name: "Coach Pro"  as Plan,
    priceMo: 2400,
    cap: 200,
    count: 61,
    color: "#047857",
    features: ["200 clients", "All Solo features", "Analytics", "Priority support"],
    featured: false,
  },
];

const INVOICES = [
  { id: "INV-26-04812", tenant: "Cairo Fit",          amount: 4500,  status: "paid",     due: "01 May 2026", paid: "01 May 2026" },
  { id: "INV-26-04813", tenant: "Apex Fitness",       amount: 9800,  status: "paid",     due: "01 May 2026", paid: "01 May 2026" },
  { id: "INV-26-04814", tenant: "Iron House",         amount: 4500,  status: "past_due", due: "04 May 2026", paid: "—"           },
  { id: "INV-26-04815", tenant: "Olympia Sports Hub", amount: 22000, status: "paid",     due: "02 May 2026", paid: "02 May 2026" },
  { id: "INV-26-04816", tenant: "Salma El-Ghazaly",   amount: 1200,  status: "paid",     due: "03 May 2026", paid: "03 May 2026" },
  { id: "INV-26-04817", tenant: "CoreLab",            amount: 4500,  status: "retrying", due: "07 May 2026", paid: "—"           },
  { id: "INV-26-04818", tenant: "Karim Khalil",       amount: 2400,  status: "paid",     due: "04 May 2026", paid: "04 May 2026" },
  { id: "INV-26-04819", tenant: "FlexFit",            amount: 9800,  status: "open",     due: "12 May 2026", paid: "—"           },
];

const INVOICE_STATUS: Record<string, { badge: string; label: string }> = {
  paid:     { badge: "active",  label: "Paid"     },
  past_due: { badge: "expired", label: "Past due" },
  retrying: { badge: "pending", label: "Retrying" },
  open:     { badge: "frozen",  label: "Open"     },
};

export default function SubscriptionsPage() {
  return (
    <>
      <HeaderContent
        title="Subscriptions & billing"
        subtitle="Plan catalog, MRR per plan, and recent invoices"
        actions={
          <>
            <button className="fs-btn ghost">Download invoices</button>
            <Button variant="accent">
              <Icon name="plus" size={13} color="#fff" />
              New plan
            </Button>
          </>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Plan tiers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 14 }}>
          {PLANS.map((p) => (
            <div
              key={p.name}
              className="fs-card"
              style={{
                padding: 16,
                position: "relative",
                borderColor: p.featured ? p.color : "var(--hairline)",
                borderWidth: p.featured ? 1.5 : 1,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {p.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    left: 12,
                    background: p.color,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 3,
                    letterSpacing: "0.08em",
                  }}
                >
                  MOST POPULAR
                </span>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <PlanBadge plan={p.name} />
                <span className="fs-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                  {p.count} tenants
                </span>
              </div>
              <div>
                <div className="fs-num" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {p.priceMo === null
                    ? "Contact"
                    : p.priceMo === 0
                    ? "Free"
                    : (
                      <>
                        {p.priceMo.toLocaleString()}{" "}
                        <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>EGP/mo</span>
                      </>
                    )}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  up to {p.cap.toLocaleString()} members
                </div>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5, fontSize: 11 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="check" size={11} color={p.color} stroke={2.4} />
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: "1px solid var(--hairline2)", paddingTop: 10, marginTop: "auto" }}>
                <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  MRR
                </div>
                <div className="fs-num" style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
                  {(p.count * (p.priceMo ?? 1800)).toLocaleString()}{" "}
                  <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>EGP</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoices */}
        <div className="fs-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--hairline)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Recent invoices</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                May 2026 billing cycle · 8 of 460 shown
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="fs-btn ghost sm">All</button>
              <button className="fs-btn ghost sm" style={{ color: "var(--red)", borderColor: "var(--red)" }}>
                Past due · 1
              </button>
              <button className="fs-btn ghost sm">Retrying · 1</button>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="fs-th">Invoice</th>
                <th className="fs-th">Tenant</th>
                <th className="fs-th">Amount</th>
                <th className="fs-th">Status</th>
                <th className="fs-th">Due</th>
                <th className="fs-th">Paid</th>
                <th className="fs-th" style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => {
                const st = INVOICE_STATUS[inv.status];
                return (
                  <tr key={inv.id} className="fs-tr">
                    <td className="fs-td fs-mono" style={{ fontSize: 12 }}>
                      {inv.id}
                    </td>
                    <td className="fs-td">
                      <span style={{ fontWeight: 600 }}>{inv.tenant}</span>
                    </td>
                    <td className="fs-td fs-num" style={{ fontWeight: 600 }}>
                      {inv.amount.toLocaleString()}{" "}
                      <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 400 }}>EGP</span>
                    </td>
                    <td className="fs-td">
                      <span className={`fs-badge ${st.badge}`}>
                        <span className="dot" />
                        {st.label}
                      </span>
                    </td>
                    <td className="fs-td" style={{ color: "var(--muted)", fontSize: 12 }}>
                      {inv.due}
                    </td>
                    <td className="fs-td" style={{ color: "var(--muted)", fontSize: 12 }}>
                      {inv.paid}
                    </td>
                    <td className="fs-td">
                      <Icon name="more" size={16} color="var(--muted)" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
