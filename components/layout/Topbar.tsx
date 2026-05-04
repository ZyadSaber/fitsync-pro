import React from "react";
import Icon from "@/components/ui/Icon";

export default function Topbar({
  title,
  subtitle,
  actions,
  dir = "ltr",
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  dir?: "ltr" | "rtl";
}) {
  const isRtl = dir === "rtl";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 28px",
        borderBottom: "1px solid var(--hairline)",
        background: "#fff",
        flexShrink: 0,
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.015em" }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: 10, color: "var(--muted2)" }}>
            <Icon name="search" size={14} />
          </span>
          <input
            className="fs-input"
            placeholder={isRtl ? "بحث…" : "Search…"}
            style={{ paddingLeft: 32, width: 220 }}
          />
        </div>
        <button className="fs-btn ghost">
          <Icon name="bell" size={14} />
        </button>
        {actions}
      </div>
    </div>
  );
}
