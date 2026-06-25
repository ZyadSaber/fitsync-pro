import getTranslations from "@/i18n/lib/getTranslations";

export interface ActivityKpis {
    totalEvents: number;
    logins: number;
    memberAdds: number;
    checkins: number;
}

interface KpiCardsProps {
    data: ActivityKpis | undefined;
    t: ReturnType<typeof getTranslations>;
}

export default function KpiCards({ data, t }: KpiCardsProps) {
    const cards = [
        { key: "total", value: data?.totalEvents },
        { key: "logins", value: data?.logins },
        { key: "members", value: data?.memberAdds },
        { key: "checkins", value: data?.checkins },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {cards.map((card) => (
                <div key={card.key} className="fs-card pad flex flex-col justify-between min-h-[88px]">
                    <div className="fs-eyebrow">{t(`kpis.${card.key}`)}</div>
                    <div className="flex items-baseline gap-2.5">
                        <div className="fs-num text-[26px] font-bold tracking-tight">
                            {(card.value ?? 0).toLocaleString()}
                        </div>
                        <div className="text-[11px] text-muted">{t(`kpis.${card.key}Sub`)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
