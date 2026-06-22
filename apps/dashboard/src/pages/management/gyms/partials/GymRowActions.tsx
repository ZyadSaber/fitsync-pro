import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import GymsDialog from "./GymsDialog";
import DeleteDialog from "@/components/shared/delete-dialog";
// import { deleteGym } from "@/services/management/gyms";
import { useTranslation } from "react-i18next";
import type { GymListItem } from "@/types/gyms";
import type { SelectOptions } from "@/types/ui";

interface GymRowActionsProps {
  gym: GymListItem;
  ownerOptions?: SelectOptions[];
}

export default function GymRowActions({ gym, ownerOptions }: GymRowActionsProps) {
  const { t } = useTranslation(undefined, { keyPrefix: "management.gyms" });

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
          <GymsDialog gym={gym} ownerOptions={ownerOptions} />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--hairline)]" />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-200 focus:text-red-800 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            deleteText={t("actions.delete")}
          // deleteAction={() => deleteGym(gym.id)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
