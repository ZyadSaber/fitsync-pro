import MetricCard from "@/components/ui/MetricCard";
import Icon from "@/components/ui/Icon";
import RevenueArea from "@/components/superadmin/RevenueArea";
import { type Plan } from "@/components/superadmin/PlanBadge";
import { Button } from "@/components/ui/button";
import HeaderContent from "../../layout/HeaderContent";

const MRR_SERIES = [180, 192, 205, 211, 224, 238, 247, 263, 278, 286, 294, 312];
const SIGNUPS = [4, 6, 5, 8, 7, 11, 9, 12, 10, 14, 13, 18, 16, 21, 19, 23, 26, 24, 28, 31, 29, 33, 30, 36];

const RECENT_SIGNUPS = [
  { type: "gym", name: "Pulse Gym · Alexandria", plan: "Trial" as Plan, when: "12m ago", who: "Karim Saad" },
  { type: "coach", name: "Salma El-Ghazaly", plan: "Pro" as Plan, when: "38m ago", who: "@salma.coach" },
  { type: "gym", name: "Iron House · Maadi", plan: "Pro" as Plan, when: "1h ago", who: "Hassan Adel" },
  { type: "coach", name: "Mohamed Wagdy", plan: "Starter" as Plan, when: "2h ago", who: "@mw.fit" },
  { type: "gym", name: "FlexFit · 6 October", plan: "Elite" as Plan, when: "3h ago", who: "Rasha Magdy" },
  { type: "coach", name: "Nada Halim", plan: "Pro" as Plan, when: "4h ago", who: "@nadahalim" },
];

const TRIALS_ENDING = [
  { name: "Pulse Gym · Alex", days: 2, members: 28, health: "good" },
  { name: "CoreLab · Heliopolis", days: 4, members: 7, health: "low" },
  { name: "Strong Studio", days: 5, members: 14, health: "good" },
  { name: "FitZone · Tanta", days: 6, members: 3, health: "low" },
];

const INCIDENTS = [
  { sev: "red", title: "Cairo Fit · Zamalek", msg: "Storage 102% over quota — uploads disabled", when: "3m ago" },
  { sev: "amber", title: "Salma El-Ghazaly", msg: "Approaching client limit · 48 / 50", when: "22m ago" },
  { sev: "amber", title: "Iron House · Maadi", msg: "Payment retry scheduled for tomorrow", when: "1h ago" },
];

const PLAN_DIST = [
  { plan: "Starter", count: 187, mrr: 56100, color: "#475569" },
  { plan: "Pro", count: 218, mrr: 152600, color: "#2D5BFF" },
  { plan: "Elite", count: 47, mrr: 89300, color: "#0B0F1A" },
  { plan: "Custom", count: 8, mrr: 14400, color: "#6D28D9" },
];

export default function ManagementOverviewPage() {
  return (
    <>
      <HeaderContent
        title="Platform overview"
        subtitle="Monday, 11 May 2026 · all regions"
        noSearch
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
          <MetricCard label="MRR" value="312,400" trend="+8.6%" trendDir="up" sub="EGP · vs Apr" />
          <MetricCard label="Active gyms" value="142" trend="+6" trendDir="up" sub="11 in trial" />
          <MetricCard label="Online coaches" value="318" trend="+24" trendDir="up" sub="2,847 clients" />
          <MetricCard label="Platform members" value="48,206" trend="+1,820" trendDir="up" sub="across all tenants" />
          <MetricCard label="Net churn" value="1.8%" trend="−0.4pp" trendDir="down" sub="logo + revenue" />
        </div>

        {/* Revenue + Signups */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
          {/* Revenue area chart */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Revenue · last 12 months</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  MRR trending up · 73% from gyms, 27% from coaches
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["12M", "6M", "3M", "30D"].map((p, i) => (
                  <span
                    key={p}
                    style={{
                      padding: "4px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: i === 0 ? "var(--ink)" : "transparent",
                      color: i === 0 ? "#fff" : "var(--muted)", cursor: "pointer",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: "20px 24px 8px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                <div className="fs-num" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  312,400{" "}
                  <span style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>EGP MRR</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                  <Icon name="arrow-up" size={12} />
                  +8.6%
                </div>
              </div>
              <div className="fs-mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                ARR ≈ 3.75M EGP
              </div>
            </div>
            <div style={{ padding: "0 24px 20px" }}>
              <RevenueArea data={MRR_SERIES} height={150} />
            </div>
          </div>

          {/* Signups bar chart */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--hairline)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Signups · last 24 days</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>30 new tenants this month</div>
              </div>
              <span className="fs-num" style={{ fontSize: 11, color: "var(--green)", fontWeight: 700 }}>+38% MoM</span>
            </div>
            <div style={{ padding: "24px 20px 12px", display: "flex", alignItems: "flex-end", gap: 4, height: 154 }}>
              {SIGNUPS.map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1, height: `${(v / 36) * 100}%`,
                    background: i === SIGNUPS.length - 1 ? "var(--accent)" : i > 18 ? "var(--ink)" : "var(--hairline)",
                    borderRadius: 2, minHeight: 4,
                  }}
                />
              ))}
            </div>
            <div className="fs-mono" style={{ display: "flex", justifyContent: "space-between", padding: "4px 20px 16px", fontSize: 10, color: "var(--muted)" }}>
              <span>Apr 18</span>
              <span>May 11</span>
            </div>
          </div>
        </div>

        {/* Plan distribution + Recent signups + Trials ending */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Plan distribution */}
          <div className="fs-card pad">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
              Plan distribution
            </div>
            {PLAN_DIST.map((p) => (
              <div key={p.plan} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, background: p.color, borderRadius: 2, display: "inline-block" }} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{p.plan}</span>
                    <span className="fs-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{p.count}</span>
                  </div>
                  <span className="fs-num" style={{ fontSize: 12, fontWeight: 600 }}>
                    {p.mrr.toLocaleString()}{" "}
                    <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 10 }}>EGP</span>
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--hairline2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(p.count / 460) * 100}%`, background: p.color, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recent signups */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Recent signups
              </div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>View all →</span>
            </div>
            {RECENT_SIGNUPS.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
                  borderBottom: i < RECENT_SIGNUPS.length - 1 ? "1px solid var(--hairline2)" : "none",
                }}
              >
                <span
                  style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: s.type === "coach" ? "#F4EFFF" : "var(--hairline2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: s.type === "coach" ? "#6D28D9" : "#475569", flexShrink: 0,
                  }}
                >
                  <Icon name={s.type === "coach" ? "user" : "home"} size={13} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.name}
                  </div>
                  <div className="fs-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
                    {s.who} · {s.when}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trials ending */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Trials ending
              </div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>11 total →</span>
            </div>
            {TRIALS_ENDING.map((tr, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "13px 16px",
                  borderBottom: i < TRIALS_ENDING.length - 1 ? "1px solid var(--hairline2)" : "none",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{tr.name}</div>
                  <div className="fs-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                    {tr.members} members · health{" "}
                    <span style={{ color: tr.health === "good" ? "var(--green)" : "var(--amber)", fontWeight: 600 }}>
                      {tr.health}
                    </span>
                  </div>
                </div>
                <span className={`fs-badge ${tr.days <= 3 ? "expired" : "pending"}`}>
                  <span className="dot" />
                  {tr.days}d
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents */}
        <div className="fs-card" style={{ padding: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", boxShadow: "0 0 0 4px #FCEAEA" }} />
              <div style={{ fontSize: 14, fontWeight: 600 }}>Quota & billing incidents</div>
              <span className="fs-mono" style={{ fontSize: 11, color: "var(--muted)" }}>3 open</span>
            </div>
            <button className="fs-btn ghost sm">Open audit log</button>
          </div>
          {INCIDENTS.map((inc, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: 14, padding: "14px 20px",
                borderBottom: i < INCIDENTS.length - 1 ? "1px solid var(--hairline2)" : "none",
              }}
            >
              <span style={{ width: 4, height: 32, background: inc.sev === "red" ? "var(--red)" : "var(--amber)", borderRadius: 2, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{inc.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{inc.msg}</div>
              </div>
              <span className="fs-mono" style={{ fontSize: 11, color: "var(--muted)" }}>{inc.when}</span>
              <button className="fs-btn ghost sm">Resolve</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
