import { useState } from "react";
import Icon from "@/components/ui/Icon";
import ExerciseCard from "@/components/ui/ExerciseCard";
import HeaderContent from "../../layout/HeaderContent";

const EXERCISES = [
  { name: "Barbell back squat",    muscles: ["Quads", "Glutes"],   difficulty: "Intermediate", equip: "Barbell"    },
  { name: "Romanian deadlift",     muscles: ["Hamstrings", "Back"],difficulty: "Intermediate", equip: "Barbell"    },
  { name: "Bench press",           muscles: ["Chest", "Triceps"],  difficulty: "Intermediate", equip: "Barbell"    },
  { name: "Pull-up",               muscles: ["Back", "Biceps"],    difficulty: "Advanced",     equip: "Bodyweight" },
  { name: "Walking lunge",         muscles: ["Quads", "Glutes"],   difficulty: "Beginner",     equip: "Dumbbells"  },
  { name: "Seated row",            muscles: ["Back"],              difficulty: "Beginner",     equip: "Cable"      },
  { name: "Overhead press",        muscles: ["Shoulders"],         difficulty: "Intermediate", equip: "Barbell"    },
  { name: "Hanging leg raise",     muscles: ["Core"],              difficulty: "Advanced",     equip: "Bar"        },
  { name: "Goblet squat",          muscles: ["Quads", "Glutes"],   difficulty: "Beginner",     equip: "Kettlebell" },
  { name: "Incline DB press",      muscles: ["Chest"],             difficulty: "Intermediate", equip: "Dumbbells"  },
  { name: "Lat pulldown",          muscles: ["Back"],              difficulty: "Beginner",     equip: "Cable"      },
  { name: "Bulgarian split squat", muscles: ["Quads", "Glutes"],   difficulty: "Advanced",     equip: "Dumbbells"  },
];

const FILTERS = ["All muscles", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

export default function ExerciseLibraryPage() {
  const [muscleFilter, setMuscleFilter] = useState("All muscles");
  const [diffFilter, setDiffFilter] = useState("All");

  const filtered = EXERCISES.filter((e) => {
    const matchMuscle =
      muscleFilter === "All muscles" ||
      e.muscles.some((m) => m === muscleFilter) ||
      (muscleFilter === "Legs" && (e.muscles.includes("Quads") || e.muscles.includes("Hamstrings") || e.muscles.includes("Glutes")));
    const matchDiff = diffFilter === "All" || e.difficulty === diffFilter;
    return matchMuscle && matchDiff;
  });

  return (
    <>
      <HeaderContent
        title="Exercise library"
        subtitle="12 exercises · private to your account"
        noSearch
        actions={
          <button className="fs-btn accent">
            <Icon name="plus" size={13} color="#fff" />
            Add exercise
          </button>
        }
      />

      <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Filter chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setMuscleFilter(f)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: muscleFilter === f ? "var(--ink)" : "#fff",
                color: muscleFilter === f ? "#fff" : "var(--text)",
                border: `1px solid ${muscleFilter === f ? "var(--ink)" : "var(--hairline)"}`,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Difficulty</span>
          <select
            className="fs-input"
            style={{ height: 30, fontSize: 12, padding: "0 8px" }}
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
          >
            <option>All</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {filtered.map((e) => (
            <ExerciseCard key={e.name} {...e} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--muted)", fontSize: 13 }}>
              No exercises match this filter.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
