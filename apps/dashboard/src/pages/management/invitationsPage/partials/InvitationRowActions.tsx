import { useState } from "react";
import { Ellipsis, Copy, Send, Ban, Check } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";
import { getTranslations } from "@/i18n";
import type { InvitationListItem } from "@/types/invitations";
import { useInvitationsMutations } from "../invitations_mutations";

const inviteUrl = (token: string) => `https://app.fitsync.pro/invite/${token}`;

export default function InvitationRowActions({ invitation }: { invitation: InvitationListItem }) {
  const t = getTranslations("management.invitations");
  const { resendInvitation, revokeInvitation } = useInvitationsMutations();
  const [copied, setCopied] = useState(false);

  // Accepted invitations are terminal — nothing left to do.
  if (invitation.status === "used") {
    return <span className="text-[var(--muted2)] text-xs">—</span>;
  }

  const copyLink = () => {
    navigator.clipboard?.writeText(inviteUrl(invitation.token));
    setCopied(true);
    toast.success(t("actions.copied"));
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="hover:bg-hairline2 h-7 w-7" variant="ghost" icon={Ellipsis} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-hairline bg-white shadow-sm text-ink text-[13px]"
      >
        {invitation.status === "pending" && (
          <DropdownMenuItem
            className="focus:bg-hairline2 focus:text-ink cursor-pointer gap-2"
            onSelect={(e) => {
              e.preventDefault();
              copyLink();
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {t("actions.copyLink")}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="focus:bg-hairline2 focus:text-ink cursor-pointer gap-2"
          onSelect={(e) => {
            e.preventDefault();
            resendInvitation.mutate(invitation.id);
          }}
        >
          <Send size={14} />
          {t("actions.resend")}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[var(--hairline)]" />

        <DropdownMenuItem
          className="text-red-600 focus:bg-red-200 focus:text-red-800 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            deleteText={t("actions.revoke")}
            deleteAction={() => revokeInvitation(invitation.id)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
