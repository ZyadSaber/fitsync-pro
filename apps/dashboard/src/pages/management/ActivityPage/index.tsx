import { useQuery } from "@tanstack/react-query";
import { api } from "@dashboard/lib/api";
import { API } from "@/constants/apiRoutes";
import getTranslations from "@/i18n/lib/getTranslations";
import useFormManager from "@/hooks/useFormManager";
import HeaderContent from "../../../layout/HeaderContent";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { SelectField, SelectFieldApiData } from "@/components/ui/select";
import KpiCards from "./KpiCards";
import ActivityRow from "./ActivityRow";
import { KNOWN_EVENTS } from "./eventMeta";
import type { SelectOptions } from "@/types/ui";
import type { ActivityEventType, ActivityListItem } from "@/types/activity";

interface ActivityFilterValues {
    gym: string;
    coach: string;
    event: string;
    from: string;
    to: string;
}

interface ActivityPageData {
    rows: ActivityListItem[];
    totalEvents: number;
    logins: number;
    memberAdds: number;
    checkins: number;
}

const fieldLabel = "px-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]";

export default function ActivityPage() {
    const t = getTranslations("management.activity");

    const { formData, handleToggle, handleChange } = useFormManager<ActivityFilterValues>({
        initialData: { gym: "", coach: "", event: "", from: "", to: "" },
    });

    const { gym, coach, event, from, to } = formData;
    const filters = { gym, coach, event, from, to };

    const { data, error } = useQuery({
        queryKey: ["activity", filters],
        queryFn: () => api.get<ActivityPageData>(API.activity.list(filters)),
    });

    const eventOptions: SelectOptions[] = KNOWN_EVENTS.map((e) => ({ key: e, label: t(`events.${e}`) }));

    const eventLabel = (event: string) =>
        KNOWN_EVENTS.includes(event as ActivityEventType)
            ? t(`events.${event as ActivityEventType}`)
            : event.replace(/_/g, " ");

    const rows = data?.rows ?? [];

    return (
        <>
            <HeaderContent title={t("title")} subtitle={t("subtitle")} noSearch />

            {error ? (
                <div className="p-7">
                    <p className="text-sm font-mono text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 whitespace-pre-wrap">
                        {(error as Error).message ?? t("loadError")}
                    </p>
                </div>
            ) : (
                <div className="p-7 flex flex-col gap-4">
                    <KpiCards data={data} t={t} />

                    <div className="flex items-end gap-3 flex-wrap">
                        <SelectFieldApiData
                            name="gym"
                            label={t("filters.gym")}
                            queryApi={API.gyms.gymOptions}
                            value={formData.gym}
                            onValueChange={handleToggle("gym")}
                            hideClear={false}
                            showSearch
                            searchPlaceholder={t("filters.searchGyms")}
                            containerClassName="w-[220px]"
                        />
                        <SelectFieldApiData
                            name="coach"
                            label={t("filters.coach")}
                            queryApi={API.subscriptions.coachOptions}
                            value={formData.coach}
                            onValueChange={handleToggle("coach")}
                            hideClear={false}
                            showSearch
                            searchPlaceholder={t("filters.searchCoaches")}
                            containerClassName="w-[220px]"
                        />
                        <SelectField
                            name="event"
                            label={t("filters.event")}
                            options={eventOptions}
                            value={formData.event}
                            onValueChange={handleToggle("event")}
                            hideClear={false}
                            containerClassName="w-[200px]"
                        />

                        <div className="flex flex-col gap-1">
                            <label htmlFor="from" className={fieldLabel}>{t("filters.from")}</label>
                            <input
                                id="from"
                                name="from"
                                type="date"
                                value={formData.from}
                                max={formData.to || undefined}
                                onChange={handleChange}
                                className="fs-input h-9 w-[150px]"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="to" className={fieldLabel}>{t("filters.to")}</label>
                            <input
                                id="to"
                                name="to"
                                type="date"
                                value={formData.to}
                                min={formData.from || undefined}
                                onChange={handleChange}
                                className="fs-input h-9 w-[150px]"
                            />
                        </div>
                    </div>

                    <div className="border border-[var(--hairline)] rounded-[8px] overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("table.event")}</TableHead>
                                    <TableHead>{t("table.actor")}</TableHead>
                                    <TableHead>{t("table.tenant")}</TableHead>
                                    <TableHead>{t("table.details")}</TableHead>
                                    <TableHead>{t("table.when")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted py-8">
                                            {t("empty")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((row) => (
                                        <ActivityRow key={row.id} row={row} t={t} eventLabel={eventLabel} />
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </>
    );
}
