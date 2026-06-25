import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import StatusBadge from "@/components/ui/StatusBadge";
import HeaderContent from "../../layout/HeaderContent";

type Status = "active" | "frozen" | "expired" | "pending";

const ALL_MEMBERS = [
  { id: "EG-1042", name: "Ahmed Hassan", phone: "+20 100 234 5678", plan: "Annual", status: "active" as Status, expiry: "12 Mar 2027" },
  { id: "EG-1043", name: "Sara Mohamed", phone: "+20 122 987 1234", plan: "Monthly", status: "active" as Status, expiry: "06 May 2026" },
  { id: "EG-1044", name: "Omar El-Sayed", phone: "+20 111 456 7890", plan: "Quarterly", status: "frozen" as Status, expiry: "18 Jun 2026" },
  { id: "EG-1045", name: "Mahmoud Farouk", phone: "+20 100 111 2233", plan: "Quarterly", status: "active" as Status, expiry: "07 May 2026" },
  { id: "EG-1046", name: "Layla Abdullah", phone: "+20 122 555 6677", plan: "Annual", status: "active" as Status, expiry: "04 Apr 2027" },
  { id: "EG-1047", name: "Karim Mansour", phone: "+20 111 888 9900", plan: "Monthly", status: "expired" as Status, expiry: "02 May 2026" },
  { id: "EG-1048", name: "Hoda El-Sayed", phone: "+20 100 333 4455", plan: "Annual", status: "active" as Status, expiry: "21 Sep 2026" },
  { id: "EG-1049", name: "Tarek Nabil", phone: "+20 122 234 5566", plan: "Quarterly", status: "frozen" as Status, expiry: "14 Jul 2026" },
  { id: "EG-1050", name: "Dina Hassan", phone: "+20 111 678 9911", plan: "Monthly", status: "pending" as Status, expiry: "—" },
  { id: "EG-1051", name: "Nour El-Din", phone: "+20 100 444 8822", plan: "Annual", status: "active" as Status, expiry: "09 May 2026" },
  { id: "EG-1052", name: "Youssef Ibrahim", phone: "+20 122 909 1010", plan: "Monthly", status: "expired" as Status, expiry: "28 Apr 2026" },
  { id: "EG-1053", name: "Mariam Adel", phone: "+20 111 121 3434", plan: "Quarterly", status: "active" as Status, expiry: "15 Aug 2026" },
];

const FILTERS: [string, string][] = [
  ["all", "All"],
  ["active", "Active"],
  ["frozen", "Frozen"],
  ["expired", "Expired"],
  ["pending", "Pending"],
];

export default function MemberListPage() {
  const [filter, setFilter] = useState<string>("all");
  const rows = filter === "all" ? ALL_MEMBERS : ALL_MEMBERS.filter((r) => r.status === filter);

  return (
    <>
      <HeaderContent
        title="Members"
        subtitle={`${rows.length} of ${ALL_MEMBERS.length} members`}
        noSearch
        actions={
          <>
            <button className="fs-btn ghost">
              <Icon name="filter" size={13} />
              Export
            </button>
            <button className="fs-btn accent">
              <Icon name="plus" size={13} color="#fff" />
              Add member
            </button>
          </>
        }
      />

      <div className="flex flex-col gap-4 p-4 md:p-7">

        {/* Filter chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {FILTERS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: filter === k ? "var(--ink)" : "#fff",
                color: filter === k ? "#fff" : "var(--text)",
                border: `1px solid ${filter === k ? "var(--ink)" : "var(--hairline)"}`,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {label}
              <span style={{ fontSize: 10, opacity: 0.6 }}>
                {k === "all"
                  ? ALL_MEMBERS.length
                  : ALL_MEMBERS.filter((r) => r.status === k).length}
              </span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Bulk actions:</span>
          <button className="fs-btn ghost sm">Freeze</button>
          <button className="fs-btn ghost sm">Extend</button>
        </div>

        {/* Table */}
        <div className="fs-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr>
                  <th className="fs-th" style={{ width: 36 }}>
                    <input type="checkbox" />
                  </th>
                  <th className="fs-th">Member</th>
                  <th className="fs-th">Phone</th>
                  <th className="fs-th">Plan</th>
                  <th className="fs-th">Status</th>
                  <th className="fs-th">Expiry</th>
                  <th className="fs-th" style={{ width: 64 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="fs-tr">
                    <td className="fs-td">
                      <input type="checkbox" />
                    </td>
                    <td className="fs-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar size="default">
                          <AvatarFallback>{r.name.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <div className="fs-mono" style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>
                            {r.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="fs-td fs-num" style={{ color: "var(--muted)" }}>{r.phone}</td>
                    <td className="fs-td">{r.plan}</td>
                    <td className="fs-td">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="fs-td fs-num" style={{ color: "var(--muted)" }}>{r.expiry}</td>
                    <td className="fs-td">
                      <Icon name="more" size={16} color="var(--muted)" />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="fs-td" style={{ textAlign: "center", padding: "60px 20px", color: "var(--muted)" }}>
                      No members match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
