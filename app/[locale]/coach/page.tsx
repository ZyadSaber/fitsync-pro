"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import MetricCard from "@/components/ui/MetricCard";
import ClientCard from "@/components/ui/ClientCard";
import HeaderContent from "@/components/layout/Topbar";
import EmptyState from "@/components/layout/EmptyState";

const CLIENTS = [
  { name: "Ahmed Hassan",   plan: "Hypertrophy 12W", week: 4,  compliance: 86, lastSeen: "today, 6:42 AM",  weight: [82.4,82.1,81.8,81.2,80.9,80.5,80.1], online: false, flag: false },
  { name: "Sara Mohamed",   plan: "Fat-loss 8W",     week: 2,  compliance: 45, lastSeen: "2 days ago",      weight: [68.1,68.0,67.8,67.6,67.5,67.4,67.3], online: true,  flag: false },
  { name: "Omar El-Sayed",  plan: "Strength 10W",    week: 6,  compliance: 18, lastSeen: "5 days ago",      weight: [78.2,78.4,78.5,78.7,79.0,79.2,79.4], online: false, flag: true  },
  { name: "Layla Abdullah", plan: "Hypertrophy 12W", week: 8,  compliance: 92, lastSeen: "today, 5:10 PM",  weight: [62.4,62.6,62.8,63.0,63.2,63.4,63.6], online: false, flag: false },
  { name: "Mahmoud Farouk", plan: "Cut 6W",          week: 3,  compliance: 71, lastSeen: "yesterday",       weight: [88.0,87.6,87.4,87.0,86.8,86.5,86.2], online: true,  flag: false },
  { name: "Mariam Adel",    plan: "Recomp 16W",      week: 11, compliance: 64, lastSeen: "today, 7:30 AM",  weight: [70.0,69.8,69.6,69.5,69.3,69.2,69.0], online: false, flag: false },
  { name: "Karim Mansour",  plan: "Strength 10W",    week: 5,  compliance: 80, lastSeen: "today, 6:00 AM",  weight: [85.0,85.2,85.4,85.6,85.8,86.0,86.2], online: false, flag: false },
  { name: "Hoda El-Sayed",  plan: "Mobility 4W",     week: 1,  compliance: 100,lastSeen: "today, 8:00 AM",  weight: [58.0,57.9,57.8,57.8,57.7,57.7,57.6], online: false, flag: false },
];

type Tab = "all" | "gym" | "online" | "flagged";

export default function CoachDashboardPage() {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = CLIENTS.filter((c) => {
    if (tab === "gym")     return !c.online;
    if (tab === "online")  return c.online;
    if (tab === "flagged") return c.flag;
    return true;
  });

  return (
    <>
      <HeaderContent
        title="Coach dashboard"
        subtitle="8 clients · 6 active this week"
        actions={
          <button className="fs-btn accent">
            <Icon name="plus" size={13} color="#fff" />
            Add client
          </button>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <MetricCard label="Total clients"     value="8"   trend="+2"   trendDir="up"  sub="this month" />
          <MetricCard label="Avg. compliance"   value="69%" trend="+5%"  trendDir="up"  sub="last 7 days" />
          <MetricCard label="Needs attention"   value="1"                               sub="3+ days inactive" />
          <MetricCard label="Sessions this week"value="34"  trend="+8"   trendDir="up"  sub="of 56 planned" />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--hairline)" }}>
          {(
            [
              ["all",     "All clients",    8],
              ["gym",     "Gym clients",    6],
              ["online",  "Online clients", 2],
              ["flagged", "Needs attention",1],
            ] as [Tab, string, number][]
          ).map(([k, label, n]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: "12px 14px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                color: tab === k ? "var(--text)" : "var(--muted)",
                borderBottom: `2px solid ${tab === k ? "var(--text)" : "transparent"}`,
                marginBottom: -1,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {label}
              <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>{n}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="fs-btn ghost sm" style={{ marginBottom: 6 }}>
            <Icon name="filter" size={12} />
            Filter
          </button>
        </div>

        {/* Client grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {filtered.map((c) => (
            <ClientCard key={c.name} {...c} />
          ))}
        </div>
      </div>
    </>
  );
}
