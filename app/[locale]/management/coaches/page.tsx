import Icon from "@/components/ui/Icon";
import HeaderContent from "@/components/layout/Topbar";
import UsageBar from "@/components/superadmin/UsageBar";
import PlanBadge, { type Plan } from "@/components/superadmin/PlanBadge";
import { Button } from "@/components/ui/button";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const COACHES = [
  { id: "co_8h2x", name: "Salma El-Ghazaly", handle: "@salma.coach", specialty: "Strength · Women",  plan: "Pro"     as Plan, status: "verified", clients: 48, cap: 50,  mrr: 1200, rating: 4.9, joined: "14 Jan 2025" },
  { id: "co_4qmz", name: "Ahmed Coach",      handle: "@ahmed.fit",   specialty: "Powerlifting",       plan: "Pro"     as Plan, status: "verified", clients: 32, cap: 50,  mrr: 1200, rating: 4.8, joined: "03 Sep 2024" },
  { id: "co_7vbn", name: "Mohamed Wagdy",    handle: "@mw.fit",      specialty: "Hypertrophy",        plan: "Starter" as Plan, status: "pending",  clients: 6,  cap: 10,  mrr: 400,  rating: 4.7, joined: "09 May 2026" },
  { id: "co_9qxr", name: "Nada Halim",       handle: "@nadahalim",   specialty: "Yoga · Mobility",    plan: "Pro"     as Plan, status: "verified", clients: 41, cap: 50,  mrr: 1200, rating: 5.0, joined: "22 Apr 2025" },
  { id: "co_2psw", name: "Karim Khalil",     handle: "@kkfit",       specialty: "Bodybuilding",       plan: "Elite"   as Plan, status: "verified", clients: 78, cap: 100, mrr: 2400, rating: 4.9, joined: "11 Feb 2024" },
  { id: "co_kt9m", name: "Hana Rashed",      handle: "@hana.r",      specialty: "Online · Nutrition", plan: "Starter" as Plan, status: "verified", clients: 9,  cap: 10,  mrr: 400,  rating: 4.6, joined: "17 Dec 2025" },
  { id: "co_uy3z", name: "Tarek Sami",       handle: "@tareksami",   specialty: "CrossFit",           plan: "Pro"     as Plan, status: "flagged",  clients: 22, cap: 50,  mrr: 1200, rating: 3.9, joined: "08 Aug 2025" },
  { id: "co_md4l", name: "Reem Faisal",      handle: "@reem.coach",  specialty: "Calisthenics",       plan: "Starter" as Plan, status: "pending",  clients: 0,  cap: 10,  mrr: 0,    rating: null, joined: "10 May 2026" },
];

const STATUS_MAP: Record<string, { badge: string; label: string }> = {
  verified: { badge: "active",  label: "Verified"    },
  pending:  { badge: "pending", label: "Pending KYC" },
  flagged:  { badge: "expired", label: "Flagged"     },
};

const FILTERS = [
  { k: "all",      label: "All",         count: COACHES.length },
  { k: "verified", label: "Verified",    count: COACHES.filter((c) => c.status === "verified").length },
  { k: "pending",  label: "Pending KYC", count: COACHES.filter((c) => c.status === "pending").length  },
  { k: "flagged",  label: "Flagged",     count: COACHES.filter((c) => c.status === "flagged").length  },
];

export default function CoachesPage() {
  return (
    <>
      <HeaderContent
        title="Online coaches"
        subtitle={`${COACHES.length} of 318 coaches · 2,847 active clients`}
        actions={
          <>
            <button className="fs-btn ghost">
              <Icon name="filter" size={13} />
              Export
            </button>
            <Button variant="accent">
              <Icon name="plus" size={13} color="#fff" />
              Invite coach
            </Button>
          </>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            { label: "Verified",            value: "284",    sub: "89% of roster",      valueColor: undefined         },
            { label: "Pending KYC",         value: "27",     sub: "3 over 7 days",      valueColor: "var(--amber)"    },
            { label: "Clients on platform", value: "2,847",  sub: "+182 MoM",           valueColor: undefined         },
            { label: "Coach MRR",           value: "84,200", sub: "EGP · 27% of total", valueColor: undefined         },
          ].map((card) => (
            <div
              key={card.label}
              className="fs-card pad"
              style={{ minHeight: 88, justifyContent: "space-between", display: "flex", flexDirection: "column" }}
            >
              <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {card.label}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <div
                  className="fs-num"
                  style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: card.valueColor ?? "var(--ink)" }}
                >
                  {card.value}
                </div>
                <div style={{ fontSize: 11, color: card.label === "Clients on platform" ? "var(--green)" : "var(--muted)", fontWeight: card.label === "Clients on platform" ? 600 : 400 }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f, idx) => (
            <span
              key={f.k}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: idx === 0 ? "var(--ink)" : "#fff",
                color: idx === 0 ? "#fff" : "var(--ink)",
                border: `1px solid ${idx === 0 ? "var(--ink)" : "var(--hairline)"}`,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {f.label}
              <span style={{ fontSize: 10, opacity: 0.6 }}>{f.count}</span>
            </span>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Sort:</span>
          <button className="fs-btn ghost sm">
            Most clients <Icon name="arrow-down" size={10} />
          </button>
        </div>

        {/* Table */}
        <div className="fs-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="fs-th" style={{ width: 36 }}>
                  <input type="checkbox" />
                </th>
                <th className="fs-th">Coach</th>
                <th className="fs-th">Plan</th>
                <th className="fs-th">Clients</th>
                <th className="fs-th">Rating</th>
                <th className="fs-th">MRR</th>
                <th className="fs-th">Status</th>
                <th className="fs-th">Joined</th>
                <th className="fs-th" style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {COACHES.map((c) => {
                const st = STATUS_MAP[c.status];
                return (
                  <tr key={c.id} className="fs-tr">
                    <td className="fs-td">
                      <input type="checkbox" />
                    </td>
                    <td className="fs-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="fs-av" style={{ flexShrink: 0 }}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 600 }}>{c.name}</span>
                            {c.status === "verified" && (
                              <span
                                title="Verified"
                                style={{
                                  display: "inline-flex",
                                  width: 13,
                                  height: 13,
                                  borderRadius: "50%",
                                  background: "var(--accent)",
                                  color: "#fff",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Icon name="check" size={9} color="#fff" stroke={3} />
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted)",
                              marginTop: 2,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span className="fs-mono">{c.handle}</span>
                            <span style={{ color: "var(--muted2)" }}>·</span>
                            <span>{c.specialty}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fs-td">
                      <PlanBadge plan={c.plan} />
                    </td>
                    <td className="fs-td" style={{ width: 180 }}>
                      <UsageBar used={c.clients} limit={c.cap} compact />
                    </td>
                    <td className="fs-td">
                      {c.rating !== null ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24">
                            <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" fill="var(--amber)" />
                          </svg>
                          <span className="fs-num" style={{ fontWeight: 600 }}>
                            {c.rating!.toFixed(1)}
                          </span>
                        </span>
                      ) : (
                        <span style={{ color: "var(--muted2)", fontSize: 11 }}>—</span>
                      )}
                    </td>
                    <td className="fs-td fs-num" style={{ fontWeight: 600 }}>
                      {c.mrr === 0 ? (
                        <span style={{ color: "var(--muted)" }}>—</span>
                      ) : (
                        <>
                          {c.mrr.toLocaleString()}{" "}
                          <span style={{ color: "var(--muted)", fontSize: 10, fontWeight: 400 }}>EGP</span>
                        </>
                      )}
                    </td>
                    <td className="fs-td">
                      <span className={`fs-badge ${st.badge}`}>
                        <span className="dot" />
                        {st.label}
                      </span>
                    </td>
                    <td className="fs-td" style={{ color: "var(--muted)", fontSize: 12 }}>
                      {c.joined}
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
