"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  label,
  id,
  containerClassName,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
  label?: React.ReactNode,
  containerClassName?: string
}) {
  const switchId = id ?? React.useId()


  return (
    <div className={cn("inline-flex items-center gap-2", containerClassName)}>
      <span dir="ltr" className="inline-flex">
        <SwitchPrimitive.Root
          id={switchId}
          data-slot="switch"
          data-size={size}
          className={cn(
            "peer group/switch inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-all outline-none",
            "focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-soft)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[size=default]:h-[1.15rem] data-[size=default]:w-8",
            "data-[size=sm]:h-3.5 data-[size=sm]:w-6",
            "data-[state=checked]:bg-[var(--accent)] data-[state=unchecked]:bg-[var(--hairline)]",
            className
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            data-slot="switch-thumb"
            className={cn(
              "pointer-events-none block rounded-full bg-white ring-0 shadow-xs transition-transform",
              "group-data-[size=default]/switch:size-4",
              "group-data-[size=sm]/switch:size-3",
              "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            )}
          />
        </SwitchPrimitive.Root>
      </span>
      {label &&
        <label
          htmlFor={switchId}
          className="cursor-pointer select-none text-sm text-[var(--text)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
        >
          {label}
        </label>
      }
    </div>
  )
}

export { Switch }
