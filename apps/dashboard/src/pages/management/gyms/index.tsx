import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import type { GymListItem } from "@/types/gyms";
import HeaderContent from "../../../layout/HeaderContent";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import getInitials from "@/lib/getInitials";
import UsageBar from "@/components/superadmin/UsageBar";
import GymRowActions from "./partials/GymRowActions";
import { formatDistanceToNow } from "date-fns";
import GymsDialog from "./partials/GymsDialog";
import getTranslations from "@/i18n/lib/getTranslations";
import useFormManager from "@/hooks/useFormManager";
import { SelectField, SelectFieldApiData } from "@/components/ui/select";

const STATUS_BADGE: Record<string, string> = {
    active: "active",
    suspended: "frozen",
    cancelled: "expired",
    expired: "expired",
};

export default function GymsPage() {
    const t = getTranslations("management.gyms");

    const {
        formData: {
            plan,
            status,
            searchQuery
        },
        handleToggle,
        handleChange,
    } = useFormManager({
        initialData: {
            status: "",
            plan: "",
        },
    });

    const statusOptions = useMemo(() => [
        { key: "active", label: t("filters.active") },
        { key: "suspended", label: t("filters.suspended") },
        { key: "cancelled", label: t("filters.cancelled") },
    ], []);

    const { data, isLoading } = useQuery({
        queryKey: ["gyms", searchQuery.search, plan, status],
        queryFn: () => api.get<GymListItem[]>(API.gyms.list({ search: searchQuery.search, plan, status, })),
    });

    return (
        <>
            <HeaderContent
                title={t("title")}
                subtitle={t("subtitle", { count: 2, members: 3 })}
                onChange={handleChange}
                value={searchQuery.value}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            icon={Download}
                        >
                            {t("actions.exportCsv")}
                        </Button>
                        <GymsDialog />
                    </>
                }
            />

            <div className="p-7 flex flex-col gap-4">

                <div className="flex items-center gap-2 flex-wrap">
                    <SelectField
                        name="status"
                        label={t("filters.status")}
                        options={statusOptions}
                        value={status}
                        onValueChange={handleToggle("status")}
                        hideClear={false}
                        containerClassName="w-[20%]"
                    />

                    <SelectFieldApiData
                        name="plan"
                        label={t("table.plan")}
                        queryApi={API.gyms.planOptions}
                        value={plan}
                        onValueChange={handleToggle("plan")}
                        hideClear={false}
                        containerClassName="w-[20%]"
                    />
                </div>

                <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("table.gym")}</TableHead>
                                <TableHead>{t("table.plan")}</TableHead>
                                <TableHead>{t("table.members")}</TableHead>
                                <TableHead>{t("table.mrr")}</TableHead>
                                <TableHead>{t("table.status")}</TableHead>
                                <TableHead>{t("table.lastActivity")}</TableHead>
                                <TableHead className="w-12" />
                            </TableRow>
                        </TableHeader>
                        <TableBody loading={isLoading}>
                            {
                                data?.map((g: GymListItem) => {
                                    const badge = STATUS_BADGE[g.status ?? ""] ?? "pending";
                                    const statusLabel = t(`status.${g.status || "unknown"}` as "status.active" | "status.suspended" | "status.cancelled" | "status.expired" | "status.unknown");
                                    return (
                                        <TableRow key={g.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-[7px] bg-ink text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden"
                                                    >
                                                        {
                                                            g.logo_url
                                                                ? <img src={g.logo_url} alt={g.name} className="w-full h-full object-cover" />
                                                                : getInitials(g.name)
                                                        }
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">{g.name}</span>
                                                        <div className="text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
                                                            <span>{g.address}</span>
                                                            <span className="text-muted2">·</span>
                                                            <div className="font-mono text-[10px]" dir="ltr">{g.phone}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {g.plan}
                                            </TableCell>
                                            <TableCell className="w-[180px]">
                                                {g.member_limit != null
                                                    ? <UsageBar used={g.memberCount} limit={+g.member_limit} />
                                                    : <span className="text-xs text-muted-foreground">—</span>
                                                }
                                            </TableCell>
                                            <TableCell className="tabular-nums font-semibold">
                                                {
                                                    `${(g.planPriceEgp || 0).toLocaleString()} ${t("currency")}`
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <span className={`fs-badge ${badge}`}><span className="dot" />{statusLabel}</span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs" suppressHydrationWarning>{g.lastActivityAt ? formatDistanceToNow(g.lastActivityAt, { addSuffix: true }) : "-"}</TableCell>
                                            <TableCell>
                                                <GymRowActions gym={g} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>

    );
}
