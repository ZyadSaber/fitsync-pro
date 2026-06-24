"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LoadingOverlay } from "./LoadingOverlay"
import { Loader2 } from "lucide-react"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-[#FBFBFA]", className)}
      {...props}
    />
  )
}

function TableBody({
  className,
  loading,
  children,
  ...props
}: React.ComponentProps<"tbody"> & { loading?: boolean }) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("bg-white [&_tr:last-child]:border-0", className)}
      {...props}
    >
      {!loading ?
        children
        : <tr>
          <td colSpan={9999} className="p-0">
            <div className="relative flex w-full items-center justify-center py-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
          </td>
        </tr>
      }
    </tbody>
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-[var(--hairline)] bg-[#FBFBFA] font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors",
        "border-[var(--hairline2)] [thead_&]:border-[var(--hairline)]",
        "[tbody_&]:hover:bg-[var(--paper)]",
        "data-[state=selected]:bg-[var(--accent-soft)]",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-4 text-start align-middle whitespace-nowrap",
        "text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]",
        "[&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3.5 align-middle text-[13px] text-[var(--text)] whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]",
        "text-start",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-[12px] text-[var(--muted)]", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
