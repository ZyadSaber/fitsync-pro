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
import DeleteDialog from "@/components/shared/delete-dialog";
import InvoiceDialog from "@/components/management/subscriptions/InvoiceDialog";
import { markBillingRecordPaid, deleteBillingRecord } from "@/services/management/subscriptions";
import { toast } from "sonner";
import type { BillingRecordListItem } from "@/types/subscriptions";
import type { SelectOptions } from "@/types/ui";

interface Props {
  record: BillingRecordListItem;
  gyms: SelectOptions[];
}

export default function BillingRowActions({ record, gyms }: Props) {
  const handleMarkPaid = async () => {
    const result = await markBillingRecordPaid(record.id);
    if (!result.success) toast.error(result.error);
    else toast.success("Marked as paid");
  };

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
          <InvoiceDialog record={record} gyms={gyms} />
        </DropdownMenuItem>
        {record.status !== "paid" && (
          <>
            <DropdownMenuSeparator className="bg-[var(--hairline)]" />
            <DropdownMenuItem
              className="focus:bg-hairline2 focus:text-ink cursor-pointer"
              onSelect={handleMarkPaid}
            >
              Mark as paid
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-[var(--hairline)]" />
        <DropdownMenuItem
          className="text-red-600 focus:bg-red-200 focus:text-red-800 cursor-pointer"
          onSelect={(e) => e.preventDefault()}
        >
          <DeleteDialog
            deleteText="Delete record"
            deleteAction={() => deleteBillingRecord(record.id)}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
