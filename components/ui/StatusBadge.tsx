type Status = "active" | "frozen" | "expired" | "pending" | "gym";

const labels: Record<Status, string> = {
  active: "Active",
  frozen: "Frozen",
  expired: "Expired",
  pending: "Pending",
  gym: "Gym only",
};

export default function StatusBadge({
  status = "active",
  children,
  dot = true,
}: {
  status?: Status;
  children?: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className={`fs-badge ${status}`}>
      {dot && <span className="dot" />}
      {children ?? labels[status]}
    </span>
  );
}
