import Icon from "@/components/ui/Icon";

export default function TenantTypePill({ type }: { type: "gym" | "coach" }) {
  const isCoach = type === "coach";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 18,
        padding: "0 6px",
        borderRadius: 3,
        background: isCoach ? "#F4EFFF" : "var(--hairline2)",
        color: isCoach ? "#6D28D9" : "#475569",
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      <Icon name={isCoach ? "user" : "home"} size={9} />
      {isCoach ? "Coach" : "Gym"}
    </span>
  );
}
