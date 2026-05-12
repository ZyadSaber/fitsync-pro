import Icon from "@/components/ui/Icon";
import HeaderContent from "@/components/layout/Topbar";
import UsageBar from "@/components/superadmin/UsageBar";
import PlanBadge, { type Plan } from "@/components/superadmin/PlanBadge";
import TenantTypePill from "@/components/superadmin/TenantTypePill";

const SUMMARY = [
  { label: "Members",              icon: "users"  as const, used: 48206,  cap: 88000,  unit: ""   },
  { label: "Storage",              icon: "card"   as const, used: 2840,   cap: 5200,   unit: "GB" },
  { label: "Video uploads (mo.)",  icon: "play"   as const, used: 1208,   cap: 2400,   unit: ""   },
  { label: "API calls (24h)",      icon: "chart"  as const, used: 142000, cap: 420000, unit: ""   },
];

const TENANTS = [
  { id: "gym_3wpx", name: "Apex Fitness",       type: "gym"   as const, plan: "Elite"   as Plan, members: [2104, 3000], storage: [92, 100],  video: [38, 50],  api: [4.1, 5],  state: "warn" },
  { id: "gym_8eqv", name: "Cairo Fit",          type: "gym"   as const, plan: "Pro"     as Plan, members: [847, 1000],  storage: [102, 100], video: [22, 30],  api: [3.6, 5],  state: "over" },
  { id: "co_8h2x",  name: "Salma El-Ghazaly",  type: "coach" as const, plan: "Pro"     as Plan, members: [48, 50],     storage: [12, 25],   video: [9, 20],   api: [0.8, 2],  state: "warn" },
  { id: "gym_y2rk", name: "Olympia Sports Hub", type: "gym"   as const, plan: "Custom"  as Plan, members: [4280, 6000], storage: [78, 200],  video: [44, 100], api: [8.2, 20], state: "ok"   },
  { id: "gym_2drz", name: "FlexFit",            type: "gym"   as const, plan: "Elite"   as Plan, members: [1842, 3000], storage: [64, 100],  video: [29, 50],  api: [3.1, 5],  state: "ok"   },
  { id: "gym_71fy", name: "CoreLab",            type: "gym"   as const, plan: "Pro"     as Plan, members: [624, 1000],  storage: [71, 100],  video: [16, 30],  api: [2.0, 5],  state: "ok"   },
  { id: "co_2psw",  name: "Karim Khalil",       type: "coach" as const, plan: "Elite"   as Plan, members: [78, 100],    storage: [22, 50],   video: [18, 40],  api: [1.2, 4],  state: "ok"   },
  { id: "co_kt9m",  name: "Hana Rashed",        type: "coach" as const, plan: "Starter" as Plan, members: [9, 10],      storage: [3, 5],     video: [2, 4],    api: [0.18, 0.5], state: "warn" },
];

function gymInitials(name: string) {
  return name.split(" ").slice(0, 2).map((s) => s[0]).join("");
}

export default function QuotasPage() {
  return (
    <>
      <HeaderContent
        title="Quotas & usage"
        subtitle="Live resource utilisation across all tenants"
        actions={
          <>
            <button className="fs-btn ghost">
              <Icon name="filter" size={13} />
              Filters
            </button>
            <button className="fs-btn ghost">Plan limits →</button>
          </>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {SUMMARY.map((s) => {
            const pct = Math.round((s.used / s.cap) * 100);
            const color = pct >= 95 ? "var(--red)" : pct >= 80 ? "var(--amber)" : "var(--accent)";
            return (
              <div key={s.label} className="fs-card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--muted)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Icon name={s.icon} size={12} />
                    {s.label}
                  </div>
                  <span className="fs-num" style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className="fs-num" style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
                      {s.used.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>
                      / {s.cap.toLocaleString()} {s.unit}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>across 460 tenants</div>
                </div>
                <div style={{ height: 4, background: "var(--hairline2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Over-quota alert */}
        <div
          style={{
            background: "#fff",
            border: "1.5px solid var(--red)",
            borderRadius: 8,
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "#FCEAEA",
              color: "var(--red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="flame" size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>2 tenants over quota</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Cairo Fit · storage 102% · uploads disabled. CoreLab · API throttled to 80%.
            </div>
          </div>
          <button className="fs-btn ghost sm">Auto-upgrade</button>
          <button className="fs-btn primary sm">Review now</button>
        </div>

        {/* Per-tenant table */}
        <div className="fs-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid var(--hairline)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Tenant resource usage</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                Showing highest-utilisation tenants · sorted by risk
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {[
                { bg: "var(--accent)", label: "OK" },
                { bg: "var(--amber)",  label: "Warn ≥80%" },
                { bg: "var(--red)",    label: "Over ≥95%" },
              ].map((leg) => (
                <span key={leg.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, color: "var(--muted)" }}>
                  <span style={{ width: 8, height: 8, background: leg.bg, borderRadius: 2, display: "inline-block" }} />
                  {leg.label}
                </span>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="fs-th">Tenant</th>
                <th className="fs-th">Plan</th>
                <th className="fs-th">Members</th>
                <th className="fs-th">Storage (GB)</th>
                <th className="fs-th">Video uploads (mo.)</th>
                <th className="fs-th">API calls / day (M)</th>
                <th className="fs-th" style={{ width: 110 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => (
                <tr key={t.id} className="fs-tr">
                  <td className="fs-td">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {t.type === "gym" ? (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "var(--ink)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {gymInitials(t.name)}
                        </div>
                      ) : (
                        <div className="fs-av" style={{ flexShrink: 0, width: 32, height: 32, fontSize: 11 }}>
                          {t.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.name}</div>
                        <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 6 }}>
                          <TenantTypePill type={t.type} />
                          <span className="fs-mono" style={{ fontSize: 10, color: "var(--muted)" }}>{t.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="fs-td"><PlanBadge plan={t.plan} /></td>
                  <td className="fs-td" style={{ width: 150 }}>
                    <UsageBar used={t.members[0]} limit={t.members[1]} compact />
                  </td>
                  <td className="fs-td" style={{ width: 150 }}>
                    <UsageBar used={t.storage[0]} limit={t.storage[1]} compact />
                  </td>
                  <td className="fs-td" style={{ width: 150 }}>
                    <UsageBar used={t.video[0]} limit={t.video[1]} compact />
                  </td>
                  <td className="fs-td" style={{ width: 150 }}>
                    <UsageBar used={t.api[0]} limit={t.api[1]} compact />
                  </td>
                  <td className="fs-td">
                    <button className="fs-btn ghost sm">
                      {t.state === "over" ? "Upgrade" : t.state === "warn" ? "Notify" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
