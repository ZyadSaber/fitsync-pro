import { format, formatDistanceToNow } from "date-fns";
import { TableRow, TableCell } from "@/components/ui/table";
import Icon from "@/components/ui/Icon";
import getInitials from "@/lib/getInitials";
import getTranslations from "@/i18n/lib/getTranslations";
import { eventMeta, metaDetail } from "./eventMeta";
import type { ActivityListItem } from "@/types/activity";

interface ActivityRowProps {
    row: ActivityListItem;
    t: ReturnType<typeof getTranslations>;
    eventLabel: (event: string) => string;
}

export default function ActivityRow({ row, t, eventLabel }: ActivityRowProps) {
    const meta = eventMeta(row.event_type);

    return (
        <TableRow>
            {/* Event */}
            <TableCell>
                <span className={`fs-badge ${meta.badge} gap-1.5`}>
                    <Icon name={meta.icon} size={12} />
                    {eventLabel(row.event_type)}
                </span>
            </TableCell>

            {/* Actor */}
            <TableCell>
                {row.actor_name ? (
                    <div className="flex items-center gap-2.5">
                        <div className="fs-av w-7 h-7 text-[11px] shrink-0">
                            {row.actor_avatar_url
                                ? <img src={row.actor_avatar_url} alt={row.actor_name} className="w-full h-full object-cover rounded-full" />
                                : getInitials(row.actor_name)}
                        </div>
                        <span className="font-medium text-[13px]">{row.actor_name}</span>
                    </div>
                ) : (
                    <span className="text-muted text-xs">{t("system")}</span>
                )}
            </TableCell>

            {/* Tenant */}
            <TableCell className="text-[13px]">
                {row.tenant_type === "platform" || !row.tenant_name ? (
                    <span className="text-muted">{t("tenant.platform")}</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="truncate">{row.tenant_name}</span>
                        <span className={`fs-badge ${row.tenant_type === "gym" ? "gym" : "active"}`}>
                            {t(`tenant.${row.tenant_type}`)}
                        </span>
                    </div>
                )}
            </TableCell>

            {/* Details */}
            <TableCell className="text-muted text-xs max-w-[260px] truncate">
                {metaDetail(row.event_type, row.metadata)}
            </TableCell>

            {/* When */}
            <TableCell className="text-muted text-xs whitespace-nowrap">
                <span title={format(new Date(row.created_at), "d MMM yyyy, HH:mm")}>
                    {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                </span>
            </TableCell>
        </TableRow>
    );
}
