import React from "react";

export default function PhoneFrame({
  children,
  label,
  dark = false,
}: {
  children: React.ReactNode;
  label?: string;
  dark?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </div>
      )}
      <div
        style={{
          width: 375,
          height: 780,
          borderRadius: 40,
          background: dark ? "var(--ink)" : "var(--paper)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 0 0 10px #1a1a1a, 0 0 0 12px #333",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Status bar */}
        <div
          style={{
            height: 44,
            padding: "0 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            className="fs-num"
            style={{ fontSize: 14, fontWeight: 600, color: dark ? "#fff" : "var(--text)" }}
          >
            9:41
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: dark ? "#fff" : "var(--text)" }}>
            <svg width="16" height="10" viewBox="0 0 16 10">
              <path d="M0 9h2v1H0zM4 7h2v3H4zM8 4h2v6H8zM12 1h2v9h-2z" fill="currentColor" />
            </svg>
            <svg width="14" height="10" viewBox="0 0 14 10">
              <path d="M7 2C5 2 3 3 1.5 4.5l1 1C3.5 4.5 5 4 7 4s3.5.5 4.5 1.5l1-1C11 3 9 2 7 2zM7 6c-1 0-2 .5-2.5 1l1 1c.5-.5 1-.5 1.5-.5s1 0 1.5.5l1-1C9 6.5 8 6 7 6z" fill="currentColor" />
            </svg>
            <svg width="22" height="10" viewBox="0 0 22 10">
              <rect x="0" y="1" width="18" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" />
              <rect x="2" y="3" width="14" height="4" rx="1" fill="currentColor" />
              <rect x="19" y="4" width="2" height="2" fill="currentColor" />
            </svg>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", minHeight: 0 }}>{children}</div>
      </div>
    </div>
  );
}
