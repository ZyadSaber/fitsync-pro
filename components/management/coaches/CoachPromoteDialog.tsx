"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck } from "lucide-react";
import useVisibility from "@/hook/useVisibility";
import { promoteToCoach } from "@/services/management/coaches";
import type { PlatformUser } from "@/types/coaches";
import { toast } from "sonner";
import getInitials from "@/lib/getInitials";
import isArrayHasData from "@/lib/isArrayHasData";

const BADGE: Record<string, string> = { member: "pending", gym: "gym" };

export default function CoachPromoteDialog({ platformUsers = [] }: { platformUsers?: PlatformUser[] }) {
  const t = useTranslations("management.coaches.dialog");
  const tCoaches = useTranslations("management.coaches");
  const { visible: open, handleOpen, handleClose, handleStateChange } = useVisibility();
  const [search, setSearch] = useState("");
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const filtered = search.trim()
    ? platformUsers.filter((u) => {
      const q = search.toLowerCase();
      return (u.full_name ?? "").toLowerCase().includes(q) || (u.phone ?? "").includes(q);
    })
    : platformUsers;

  const handlePromote = async (profileId: string) => {
    setPromotingId(profileId);
    const result = await promoteToCoach(profileId);
    setPromotingId(null);
    if (!result.success) { toast.error(result.error); return; }
    toast.success(t("toast.promoted"));
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleStateChange}>
      <Button variant="accent" onClick={handleOpen}>
        {tCoaches("actions.addCoach")}
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("titleAdd")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("placeholders.searchUsers")}
          />

          <div className="flex flex-col border border-[var(--hairline)] rounded-lg overflow-hidden max-h-[360px] overflow-y-auto">
            {!isArrayHasData(filtered) ? (
              <p className="py-10 text-center text-sm text-[var(--muted)]">
                {search ? t("noUsersFound") : t("noUsersAvailable")}
              </p>
            ) : filtered.map((user, idx) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 px-3 py-2.5${idx < filtered.length - 1 ? " border-b border-[var(--hairline2)]" : ""}`}
              >
                <div className="fs-av shrink-0 !w-8 !h-8 text-xs">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
                    : getInitials(user.full_name || "?")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-[13px] truncate">{user.full_name || "—"}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {user.phone && (
                      <span className="font-mono text-[10px] text-[var(--muted)]" dir="ltr">{user.phone}</span>
                    )}
                    <span className={`fs-badge ${BADGE[user.user_type] ?? "pending"} !text-[10px] !px-1.5 !py-0`}>
                      <span className="dot" />
                      {tCoaches(`userType.${user.user_type}`)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="shrink-0 h-7 px-2 text-xs gap-1 text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  isLoading={promotingId === user.id}
                  onClick={() => handlePromote(user.id)}
                >
                  <UserCheck size={13} />
                  {t("actions.promote")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
