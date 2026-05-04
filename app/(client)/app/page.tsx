import Link from "next/link";
import PhoneFrame from "@/components/layout/PhoneFrame";
import TabBar from "@/components/layout/TabBar";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import Ring from "@/components/ui/Ring";

function GymMemberHome() {
  return (
    <PhoneFrame label="Gym member · /app">
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Thursday, May 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em" }}>Hi, Ahmed</div>
          </div>
          <Avatar name="Ahmed Hassan" size="md" />
        </div>

        {/* Streak */}
        <div
          style={{
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 12,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: "#9AA1AE", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Current streak
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
              <span className="fs-num" style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>14</span>
              <span style={{ fontSize: 13, color: "#9AA1AE" }}>days</span>
            </div>
            <div style={{ fontSize: 11, color: "#9AA1AE", marginTop: 6 }}>
              Keep going — beat your record of 18
            </div>
          </div>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(45,91,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="flame" size={28} color="var(--accent)" />
          </div>
        </div>

        {/* Today's workout */}
        <div className="fs-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="fs-eyebrow">Today's workout</div>
            <span className="fs-badge active"><span className="dot" />Push day</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Chest, shoulders & triceps</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>6 exercises · ~52 min · Week 4 / 12</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="fs-btn accent" style={{ flex: 1 }}>
              Start workout <Icon name="arrow-right" size={13} color="#fff" />
            </button>
            <button className="fs-btn ghost" style={{ width: 36, padding: 0 }}>
              <Icon name="more" size={16} />
            </button>
          </div>
        </div>

        {/* GYM-ONLY: QR shortcut */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="qr" size={26} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Check in at the door</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Tap to show your QR code</div>
          </div>
          <span className="fs-badge gym"><span className="dot" />Gym only</span>
        </div>

        {/* Daily check-in nudge */}
        <div
          style={{
            borderRadius: 12,
            padding: 14,
            background: "var(--accent-soft)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="check" size={16} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Daily check-in</div>
            <div style={{ fontSize: 11, color: "#1F47E0", marginTop: 1 }}>Log weight, energy & sleep · 60s</div>
          </div>
          <Icon name="arrow-right" size={16} color="var(--accent)" />
        </div>

        {/* Membership */}
        <div className="fs-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: "var(--green)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>Membership</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>Annual · expires 12 Mar 2027</div>
          </div>
          <StatusBadge status="active" />
        </div>
      </div>
      <TabBar active="home" />
    </PhoneFrame>
  );
}

function OnlineClientHome() {
  return (
    <PhoneFrame label="Online client · /app (zero gym UI)">
      <div style={{ padding: "8px 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>Thursday, May 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em" }}>Hi, Sara</div>
          </div>
          <Avatar name="Sara Mohamed" size="md" />
        </div>

        {/* Coach card */}
        <div className="fs-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name="Ahmed Coach" size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>Your coach</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 1 }}>Ahmed El-Masry</div>
          </div>
          <button
            className="fs-btn ghost sm"
            style={{ background: "#E7F8EC", borderColor: "transparent", color: "var(--whatsapp)" }}
          >
            <Icon name="whatsapp" size={13} color="var(--whatsapp)" /> Message
          </button>
        </div>

        {/* Today's workout */}
        <div className="fs-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="fs-eyebrow">Today's workout</div>
            <span className="fs-badge active"><span className="dot" />Lower</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Legs & glutes</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>5 exercises · ~45 min · Week 2 / 8</div>
          <button className="fs-btn accent" style={{ width: "100%" }}>
            Start workout <Icon name="arrow-right" size={13} color="#fff" />
          </button>
        </div>

        {/* Daily check-in (more prominent for online) */}
        <div
          style={{
            borderRadius: 12,
            padding: 16,
            background: "var(--ink)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "#9AA1AE", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Today's check-in
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>How are you feeling?</div>
            </div>
            <Icon name="whatsapp" size={16} color="var(--whatsapp)" />
          </div>
          <div style={{ fontSize: 11, color: "#9AA1AE", marginBottom: 14 }}>
            Coach gets pinged on WhatsApp when you submit
          </div>
          <button className="fs-btn accent" style={{ width: "100%" }}>
            Start check-in <Icon name="arrow-right" size={13} color="#fff" />
          </button>
        </div>

        {/* Progress photos prompt */}
        <div className="fs-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: "var(--hairline2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chart" size={18} color="var(--text)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Weekly photos due</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              Front · Side · Back · Only your coach sees these
            </div>
          </div>
          <Icon name="arrow-right" size={16} color="var(--muted)" />
        </div>

        {/* Compliance ring */}
        <div className="fs-card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <Ring value={64} size={72} stroke={6} />
          <div style={{ flex: 1 }}>
            <div className="fs-eyebrow" style={{ marginBottom: 4 }}>This week</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>4 of 6 sessions done</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>2 more before Sunday</div>
          </div>
        </div>
      </div>
      <TabBar active="home" online />
    </PhoneFrame>
  );
}

export default function ClientHomePage() {
  return (
    <>
      <GymMemberHome />
      <OnlineClientHome />
    </>
  );
}
