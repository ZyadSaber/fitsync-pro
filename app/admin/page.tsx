import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import MetricCard from "@/components/ui/MetricCard";
import StatusBadge from "@/components/ui/StatusBadge";
import CheckinHeatmap from "@/components/ui/CheckinHeatmap";
import Topbar from "@/components/layout/Topbar";

const CHECKINS = [
  { name: "Karim Mansour",  time: "32s ago",  status: "active"  },
  { name: "Layla Abdullah", time: "1m ago",   status: "active"  },
  { name: "Youssef Ibrahim",time: "4m ago",   status: "pending" },
  { name: "Hoda El-Sayed",  time: "7m ago",   status: "active"  },
  { name: "Tarek Nabil",    time: "12m ago",  status: "frozen"  },
] as const;

const EXPIRING = [
  { name: "Sara Mohamed",   plan: "Monthly · 1,500 EGP",    days: "2 days" },
  { name: "Mahmoud Farouk", plan: "Quarterly · 4,000 EGP",  days: "3 days" },
  { name: "Nour El-Din",    plan: "Annual · 14,000 EGP",    days: "5 days" },
  { name: "Dina Hassan",    plan: "Monthly · 1,500 EGP",    days: "6 days" },
];

export default function AdminDashboard() {
  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Thursday, 4 May 2026"
        actions={
          <>
            <button className="fs-btn ghost">
              <Icon name="tag" size={13} />
              Create offer
            </button>
            <button className="fs-btn accent">
              <Icon name="plus" size={13} color="#fff" />
              Add member
            </button>
          </>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Ramadan strip */}
        <div
          style={{
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 8,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="flame" size={18} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Ramadan campaign</div>
            <div style={{ fontSize: 11, color: "#9AA1AE", marginTop: 2 }}>
              Discount overlay active · ends 30 May
            </div>
          </div>
          <button
            className="fs-btn ghost sm"
            style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
          >
            Configure
          </button>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <MetricCard label="Active members"    value="847"     trend="+24"  trendDir="up"   sub="vs last month" />
          <MetricCard label="Active today"      value="142"     trend="+8"   trendDir="up"   sub="avg. 121" />
          <MetricCard label="Expiring this week"value="18"      trend="−4"   trendDir="down" sub="renewal needed" />
          <MetricCard label="Revenue (May)"     value="284,500" trend="+12%" trendDir="up"   sub="EGP" />
        </div>

        {/* Two-col: live feed + expiring */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>

          {/* Live check-ins */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Live check-in feed</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>42 members so far today</div>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                <span
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)" }}
                  className="fs-blink"
                />
                Live
              </div>
            </div>
            <div>
              {CHECKINS.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: i < CHECKINS.length - 1 ? "1px solid var(--hairline2)" : "none",
                  }}
                >
                  <Avatar name={c.name} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{c.time}</div>
                  </div>
                  <StatusBadge status={c.status} />
                  <Icon name="qr" size={14} color="var(--muted)" />
                </div>
              ))}
            </div>
          </div>

          {/* Expiring memberships */}
          <div className="fs-card" style={{ padding: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>Memberships expiring soon</div>
              <span style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, cursor: "pointer" }}>
                View all →
              </span>
            </div>
            <div>
              {EXPIRING.map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 20px",
                    borderBottom: i < EXPIRING.length - 1 ? "1px solid var(--hairline2)" : "none",
                  }}
                >
                  <Avatar name={e.name} size="md" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{e.plan}</div>
                  </div>
                  <span className="fs-badge expired">
                    <span className="dot" />
                    {e.days}
                  </span>
                  <button className="fs-btn ghost sm" style={{ gap: 6 }}>
                    <Icon name="whatsapp" size={12} color="var(--whatsapp)" />
                    Remind
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance heatmap */}
        <div className="fs-card pad">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Attendance activity · 12 weeks</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Peak days: Mon, Thu</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "var(--muted)" }}>
              <span>Less</span>
              {["#EEF0F4", "#C7D2FE", "#6B85FF", "#2D5BFF"].map((c) => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              ))}
              <span>More</span>
            </div>
          </div>
          <CheckinHeatmap weeks={14} />
        </div>

      </div>
    </>
  );
}
