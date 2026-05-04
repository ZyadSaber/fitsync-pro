"use client";

import { useState } from "react";
import PhoneFrame from "@/components/layout/PhoneFrame";
import TabBar from "@/components/layout/TabBar";
import Ring from "@/components/ui/Ring";
import Icon from "@/components/ui/Icon";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const DAY_STATE: Record<string, "done" | "rest" | "today" | "pending"> = {
  Mon: "done", Tue: "done", Wed: "rest", Thu: "today",
  Fri: "pending", Sat: "pending", Sun: "rest",
};

const EXERCISES = [
  { name: "Bench press",      sets: "4 × 8",  rest: "90s", done: true,  notes: "Add 2.5kg if all reps clean" },
  { name: "Incline DB press", sets: "4 × 10", rest: "60s", done: true,  notes: "" },
  { name: "Cable fly",        sets: "3 × 12", rest: "45s", done: false, notes: "" },
  { name: "Overhead press",   sets: "4 × 8",  rest: "90s", done: false, notes: "" },
  { name: "Lateral raise",    sets: "3 × 15", rest: "45s", done: false, notes: "" },
  { name: "Triceps pushdown", sets: "3 × 12", rest: "45s", done: false, notes: "" },
];

export default function MyPlanPage() {
  const [day, setDay] = useState("Thu");
  const completed = EXERCISES.filter((e) => e.done).length;

  return (
    <PhoneFrame label="My plan · /app/plan">
      <div style={{ padding: "8px 20px 8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div className="fs-eyebrow">Hypertrophy 12W · Week 4</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.015em", marginTop: 4 }}>My plan</div>
          </div>
          <button className="fs-btn ghost sm">
            <Icon name="more" size={14} />
          </button>
        </div>

        {/* Day tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            overflowX: "auto",
            margin: "0 -20px",
            padding: "4px 20px 12px",
            scrollbarWidth: "none",
          }}
        >
          {DAYS.map((d, idx) => {
            const s = DAY_STATE[d];
            const isActive = day === d;
            const isDone = s === "done";
            const isRest = s === "rest";
            return (
              <button
                key={d}
                onClick={() => setDay(d)}
                style={{
                  minWidth: 50,
                  padding: "8px 4px",
                  borderRadius: 8,
                  background: isActive ? "var(--ink)" : "#fff",
                  color: isActive ? "#fff" : isRest ? "var(--muted2)" : "var(--text)",
                  border: `1px solid ${isActive ? "var(--ink)" : "var(--hairline)"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.7 }}>{d}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{idx + 1}</span>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: isDone
                      ? "var(--green)"
                      : s === "today"
                      ? "var(--accent)"
                      : isRest
                      ? "transparent"
                      : isActive
                      ? "#fff"
                      : "var(--hairline)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Progress strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Push day · Today</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {completed} of {EXERCISES.length} done · ~52 min
            </div>
          </div>
          <Ring value={Math.round((completed / EXERCISES.length) * 100)} size={44} stroke={4} />
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {EXERCISES.map((e, i) => (
          <div
            key={i}
            className="fs-card"
            style={{ padding: 14, display: "flex", gap: 12, alignItems: "flex-start", opacity: e.done ? 0.6 : 1 }}
          >
            <button
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                marginTop: 2,
                border: `1.5px solid ${e.done ? "var(--green)" : "var(--hairline)"}`,
                background: e.done ? "var(--green)" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {e.done && <Icon name="check" size={12} color="#fff" stroke={2.5} />}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, textDecoration: e.done ? "line-through" : "none" }}>
                {e.name}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 11, color: "var(--muted)" }}>
                <span className="fs-num">
                  <strong style={{ color: "var(--text)" }}>{e.sets}</strong>
                </span>
                <span>
                  rest <strong style={{ color: "var(--text)" }}>{e.rest}</strong>
                </span>
              </div>
              {e.notes && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontStyle: "italic",
                    marginTop: 6,
                    paddingTop: 6,
                    borderTop: "1px dashed var(--hairline)",
                  }}
                >
                  {e.notes}
                </div>
              )}
            </div>
            <button
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: "1px solid var(--hairline)",
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Icon name="play" size={11} />
            </button>
          </div>
        ))}
      </div>
      <TabBar active="plan" />
    </PhoneFrame>
  );
}
