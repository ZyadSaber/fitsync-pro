"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-4 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:h-fit",
  {
    variants: {
      variant: {
        default:
          "rounded-lg p-1 gap-0.5 bg-[var(--hairline2)] border border-[var(--hairline)] group-data-[orientation=horizontal]/tabs:h-10",
        line:
          "rounded-none gap-1 bg-transparent border-b border-[var(--hairline)] group-data-[orientation=horizontal]/tabs:h-10 pb-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        // base layout
        "relative inline-flex h-[calc(100%-4px)] flex-1 items-center justify-center gap-1.5 whitespace-nowrap",
        "px-3 py-1 text-sm font-semibold",
        "transition-all duration-150",
        // disabled
        "disabled:pointer-events-none disabled:opacity-40",
        // focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
        // icon sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // vertical orientation
        "group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start",

        // ── default variant ──────────────────────────────────────────────
        // inactive: muted text, no bg
        "group-data-[variant=default]/tabs-list:rounded-md group-data-[variant=default]/tabs-list:text-[var(--muted)]",
        "group-data-[variant=default]/tabs-list:hover:text-[var(--text)] group-data-[variant=default]/tabs-list:hover:bg-[var(--surface)]/60",
        // active: white surface, accent text, subtle shadow
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-[var(--surface)]",
        "group-data-[variant=default]/tabs-list:data-[state=active]:text-[var(--accent)]",
        "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",

        // ── line variant ─────────────────────────────────────────────────
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:bg-transparent",
        "group-data-[variant=line]/tabs-list:text-[var(--muted)] group-data-[variant=line]/tabs-list:hover:text-[var(--text)]",
        // accent bottom border on active (drawn with a pseudo-element via after:)
        "after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[var(--accent)] after:opacity-0 after:transition-opacity",
        "group-data-[variant=line]/tabs-list:data-[state=active]:text-[var(--accent)]",
        "group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",

        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
