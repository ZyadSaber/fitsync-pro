import type Icon from "@/components/ui/Icon";
import type { ActivityEventType } from "@/types/activity";

type IconName = Parameters<typeof Icon>[0]["name"];

export const EVENT_META: Record<ActivityEventType, { icon: IconName; badge: string }> = {
    gym_created: { icon: "plus", badge: "gym" },
    login: { icon: "user", badge: "pending" },
    member_add: { icon: "users", badge: "active" },
    member_status_change: { icon: "user", badge: "frozen" },
    plan_change: { icon: "card", badge: "gym" },
    checkin: { icon: "qr", badge: "active" },
};

export const DEFAULT_EVENT: { icon: IconName; badge: string } = { icon: "flame", badge: "pending" };

export const KNOWN_EVENTS: ActivityEventType[] = [
    "login", "member_add", "checkin", "plan_change", "member_status_change", "gym_created",
];

export const eventMeta = (event: string) =>
    EVENT_META[event as ActivityEventType] ?? DEFAULT_EVENT;

export function metaDetail(event: string, meta: Record<string, unknown> | null): string {
    if (!meta) return "—";
    const m = meta as Record<string, string | undefined>;
    switch (event) {
        case "member_add":
            return m.name ? `${m.name}${m.plan ? ` · ${m.plan}` : ""}` : "—";
        case "member_status_change":
            return m.name ? `${m.name} → ${m.status ?? "?"}` : "—";
        case "plan_change":
            return m.from && m.to ? `${m.from} → ${m.to}` : "—";
        case "login":
            return m.role ?? "—";
        case "gym_created":
            return m.gym_name ? `${m.gym_name}${m.plan ? ` · ${m.plan}` : ""}` : "—";
        case "checkin":
            return m.qr_code ?? "—";
        default: {
            const vals = Object.values(meta).filter((v) => typeof v === "string") as string[];
            return vals.slice(0, 2).join(" · ") || "—";
        }
    }
}
