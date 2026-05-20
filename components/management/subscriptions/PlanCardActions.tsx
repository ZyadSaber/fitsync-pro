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
import PlanDialog from "@/components/management/subscriptions/PlanDialog";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteSubscriptionPlan } from "@/services/management/subscriptions";
import type { SubscriptionPlanStats } from "@/types/subscriptions";

interface Props {
  plan: SubscriptionPlanStats;
}

export default function PlanCardActions({ plan }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="hover:bg-hairline2 h-6 w-6" variant="ghost" icon={Ellipsis} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="border-hairline bg-white shadow-sm text-ink text-[13px]"
      >
        <DropdownMenuItem
          className="focus:bg-hairline2 focus:text-ink cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <PlanDialog plan={plan} />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--hairline)]" />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-200 focus:text-red-800 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            deleteText="Delete plan"
            deleteAction={() => deleteSubscriptionPlan(plan.id)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
