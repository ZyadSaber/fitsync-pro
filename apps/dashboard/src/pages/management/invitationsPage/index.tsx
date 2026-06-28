import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import HeaderContent from "../../../layout/HeaderContent";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { SelectField } from "@/components/ui/select";
import getInitials from "@/lib/getInitials";
import getTranslations from "@/i18n/lib/getTranslations";
import useFormManager from "@/hooks/useFormManager";
import type { InvitationListItem, InvitationType } from "@/types/invitations";
import InvitationDialog from "./partials/InvitationDialog";
import InvitationRowActions from "./partials/InvitationRowActions";
import { INVITATION_TYPE_META, INVITATION_TYPES, STATUS_BADGE } from "./meta";

function TypePill({ type, label }: { type: InvitationType; label: string }) {
  const cfg = INVITATION_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center gap-1.5 h-[22px] px-2 rounded-[4px] text-[11px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="size-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
      {label}
    </span>
  );
}

export default function InvitationsPage() {
  const t = getTranslations("management.invitations");

  const {
    formData: { type, status, searchQuery },
    handleToggle,
    handleChange,
  } = useFormManager({
    initialData: { type: "", status: "" },
  });

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations", type, status],
    queryFn: () => api.get<InvitationListItem[]>(API.invitations.list({ type, status })),
  });

  const typeOptions = useMemo(
    () => INVITATION_TYPES.map((k) => ({ key: k, label: t(`types.${k}.label`) })),
    [],
  );
  const statusOptions = useMemo(
    () => (["pending", "used", "expired"] as const).map((s) => ({ key: s, label: t(`status.${s}`) })),
    [],
  );

  // Client-side text search (the list endpoint filters by type/gym/status only).
  const q = searchQuery.search.trim().toLowerCase();
  const rows = useMemo(() => {
    if (!q) return invitations ?? [];
    return (invitations ?? []).filter(
      (i) => i.email.toLowerCase().includes(q) || i.token.toLowerCase().includes(q),
    );
  }, [invitations, q]);

  const all = invitations ?? [];
  const pendingCount = all.filter((i) => i.status === "pending").length;
  const acceptedCount = all.filter((i) => i.status === "used").length;

  return (
    <>
      <HeaderContent
        title={t("title")}
        subtitle={t("subtitle", { count: all.length, pending: pendingCount, accepted: acceptedCount })}
        onChange={handleChange}
        value={searchQuery.value}
        actions={<InvitationDialog />}
      />

      <div className="p-7 flex flex-col gap-5">
        {/* KPI strip — one card per invite type */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {INVITATION_TYPES.map((k) => {
            const ofType = all.filter((i) => i.type === k);
            const acc = ofType.filter((i) => i.status === "used").length;
            const pend = ofType.filter((i) => i.status === "pending").length;
            return (
              <div key={k} className="fs-card p-4 flex flex-col gap-2.5">
                <TypePill type={k} label={t(`types.${k}.label`)} />
                <div>
                  <div className="fs-num text-[28px] font-bold tracking-[-0.02em] leading-none">
                    {ofType.length}
                  </div>
                  <div className="text-[11px] text-[var(--muted)] mt-1.5">
                    {t("kpi.breakdown", { accepted: acc, pending: pend })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <SelectField
            name="type"
            label={t("filters.type")}
            options={typeOptions}
            value={type}
            onValueChange={handleToggle("type")}
            containerClassName="w-[20%] min-w-[160px]"
          />
          <SelectField
            name="status"
            label={t("filters.status")}
            options={statusOptions}
            value={status}
            onValueChange={handleToggle("status")}
            containerClassName="w-[20%] min-w-[160px]"
          />
        </div>

        {/* Table */}
        <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.type")}</TableHead>
                <TableHead>{t("table.email")}</TableHead>
                <TableHead>{t("table.context")}</TableHead>
                <TableHead>{t("table.token")}</TableHead>
                <TableHead>{t("table.status")}</TableHead>
                <TableHead>{t("table.sent")}</TableHead>
                <TableHead>{t("table.expires")}</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody loading={isLoading}>
              {rows.map((inv) => (
                <TableRow key={inv.id}>
                  {/* Type */}
                  <TableCell>
                    <TypePill type={inv.type} label={t(`types.${inv.type}.label`)} />
                  </TableCell>

                  {/* Email + id */}
                  <TableCell>
                    <div className="font-semibold max-w-[200px] truncate">{inv.email}</div>
                    <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">{inv.id}</div>
                  </TableCell>

                  {/* Context */}
                  <TableCell>
                    {inv.gym_id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-[26px] h-[26px] rounded-[5px] bg-ink text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                          {getInitials(inv.gym_name || "?")}
                        </div>
                        <span className="text-[12px] font-semibold">{inv.gym_name}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] italic text-[var(--muted2)]">
                        {t("table.platformLevel")}
                      </span>
                    )}
                  </TableCell>

                  {/* Token */}
                  <TableCell>
                    <span className="font-mono text-[11px] max-w-[120px] inline-block truncate align-middle">
                      {inv.token}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <span className={`fs-badge ${STATUS_BADGE[inv.status]}`}>
                      <span className="dot" />
                      {t(`status.${inv.status}`)}
                    </span>
                  </TableCell>

                  {/* Sent */}
                  <TableCell className="text-[var(--muted)] text-xs whitespace-nowrap">
                    {inv.createdAt}
                  </TableCell>

                  {/* Expires */}
                  <TableCell className="text-xs whitespace-nowrap">{inv.expiresAt}</TableCell>

                  <TableCell>
                    <InvitationRowActions invitation={inv} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
