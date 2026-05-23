"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "relative flex aspect-square size-4 shrink-0 cursor-pointer rounded-full border border-[var(--hairline)] bg-white outline-none transition-colors",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-[var(--accent)] data-[state=checked]:bg-[var(--accent)]",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex size-4 items-center justify-center">
        <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

interface RadioGroupFieldOption {
  value: string
  label: string
}

interface RadioGroupFieldProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {
  label?: string
  options: RadioGroupFieldOption[]
  containerClassName?: string
}

function RadioGroupField({
  label,
  options,
  containerClassName,
  className,
  ...props
}: RadioGroupFieldProps) {
  const id = React.useId()

  return (
    <div className={cn("flex flex-col gap-1", containerClassName)}>
      {label && (
        <span className="flex items-center px-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          {label}
        </span>
      )}
      <RadioGroup className={cn("flex gap-3", className)} {...props}>
        {options.map(({ value, label: optLabel }) => (
          <div key={value} className="flex items-center gap-1.5">
            <RadioGroupItem value={value} id={`${id}-${value}`} />
            <label
              htmlFor={`${id}-${value}`}
              className="cursor-pointer select-none text-sm text-[var(--muted)]"
            >
              {optLabel}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export { RadioGroup, RadioGroupItem, RadioGroupField }
