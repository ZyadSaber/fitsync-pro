"use client";

import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import CoachEditDialog from "@/components/management/coaches/CoachEditDialog";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteCoach } from "@/services/management/coaches";
import { useTranslations } from "next-intl";
import type { CoachListItem } from "@/types/coaches";

interface CoachRowActionsProps {
  coach: CoachListItem;
}

export default function CoachRowActions({ coach }: CoachRowActionsProps) {
  const t = useTranslations("management.coaches");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="hover:bg-hairline2 h-7 w-7" variant="ghost" icon={Ellipsis} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="border-hairline bg-white shadow-sm text-ink text-[13px]"
      >
        <DropdownMenuItem
          className="focus:bg-hairline2 focus:text-ink cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <CoachEditDialog coach={coach} />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--hairline)]" />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-200 focus:text-red-800 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            deleteText={t("actions.delete")}
            deleteAction={() => deleteCoach(coach.id)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
