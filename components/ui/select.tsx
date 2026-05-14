"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon, LucideIcon, X, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import useVisibility from "@/hook/useVisibility"
import isArrayHasData from "@/lib/isArrayHasData"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        // base layout
        "flex w-fit items-center justify-between gap-2 rounded-[6px] border border-[var(--hairline)]",
        "bg-white px-3 text-[13px] font-medium text-[var(--text)] whitespace-nowrap",
        // placeholder
        "data-placeholder:text-[var(--muted2)]",
        // hover / focus
        "hover:border-[var(--muted2)]",
        "focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--accent-soft)]",
        // open state — keep border accent while open
        "data-[state=open]:border-[var(--accent)] data-[state=open]:ring-[3px] data-[state=open]:ring-[var(--accent-soft)]",
        "transition-[border-color,box-shadow] duration-100",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        // icon children
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        size === "default" && "h-9",
        size === "sm" && "h-8 text-xs",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon
          className={cn(
            "size-3.5 text-[var(--muted2)] transition-transform duration-150",
            "group-data-[state=open]:rotate-180"
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "start",
  header,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & { header?: React.ReactNode }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          // surface
          "relative z-50 bg-white border border-[var(--hairline)] rounded-[8px]",
          "shadow-[0_4px_24px_rgba(11,15,26,0.08),0_1px_4px_rgba(11,15,26,0.04)]",
          // sizing
          "min-w-[160px] max-h-(--radix-select-content-available-height)",
          "origin-(--radix-select-content-transform-origin) overflow-x-hidden",
          // animate
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
          position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        {header && (
          <div className="px-2 pt-2 pb-1.5 border-b border-[var(--hairline2)]">
            {header}
          </div>
        )}
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" &&
            "w-full min-w-(--radix-select-trigger-width) scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted2)]",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2",
        "rounded-[5px] px-2.5 py-[7px] text-[13px] text-[var(--text)] outline-none",
        // hover / keyboard highlight
        "data-[highlighted]:bg-[var(--paper)] data-[highlighted]:text-[var(--text)]",
        // selected
        "data-[state=checked]:text-[var(--accent)] data-[state=checked]:font-medium",
        // disabled
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        // room for the check indicator on the right
        "pr-8",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2.5 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 text-[var(--accent)]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1.5 my-1 h-px bg-[var(--hairline2)]", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-[var(--muted2)]", className)}
      {...props}
    >
      <ChevronUpIcon className="size-3.5" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-[var(--muted2)]", className)}
      {...props}
    >
      <ChevronDownIcon className="size-3.5" />
    </SelectPrimitive.ScrollDownButton>
  )
}

import type { SelectOptions } from "@/types/ui"
export type { SelectOptions }

export function SelectField<T extends SelectOptions>({
  label,
  options,
  value,
  onValueChange,
  name,
  disabled,
  containerClassName,
  error,
  showSearch = false,
  searchPlaceholder = "Search…",
  extraSearchParam = [],
  preSelectFirstKey = false,
  placeholder,
  renderAddField,
  icon: Icon,
  hideClear,
  className,
  loading = false,
}: {
  label: string
  options: T[]
  value?: string
  onValueChange: (value: string) => void
  name: string
  disabled?: boolean
  containerClassName?: string
  error?: string
  searchPlaceholder?: string
  extraSearchParam?: string[]
  showSearch?: boolean
  preSelectFirstKey?: boolean
  placeholder?: string
  renderAddField?: (onSuccess: (newId: string) => void) => React.ReactNode
  icon?: LucideIcon
  hideClear?: boolean
  className?: string
  loading?: boolean
}) {
  const [search, setSearch] = React.useState("")
  const { visible, handleClose, handleStateChange } = useVisibility()

  React.useEffect(() => {
    if (preSelectFirstKey && !value && isArrayHasData(options)) {
      onValueChange(options[0].key)
    }
  }, [options, preSelectFirstKey, value, onValueChange])

  const filteredOptions = React.useMemo(() => {
    if (!showSearch || !search) return options
    const q = search.toLowerCase()
    return options.filter((option) => {
      if (option.label.toLowerCase().includes(q)) return true
      return extraSearchParam.some((param) =>
        String((option as Record<string, unknown>)[param] || "").toLowerCase().includes(q)
      )
    })
  }, [options, search, showSearch, extraSearchParam])

  return (
    <div className={cn("flex flex-col gap-1", containerClassName)}>
      <label
        htmlFor={name}
        className="flex items-center gap-1.5 px-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
      >
        {Icon && <Icon className="size-3" />}
        {label}
      </label>

      <Select
        name={name}
        value={value}
        open={visible}
        onOpenChange={handleStateChange}
        onValueChange={(val) => {
          onValueChange(val)
          setSearch("")
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn("w-full", error && "border-[var(--red-app)]", className)}
        >
          <div className="flex items-center gap-1.5 overflow-hidden h-full flex-1 min-w-0">
            {value && !hideClear && (
              <span
                role="button"
                tabIndex={-1}
                className="shrink-0 rounded p-0.5 text-[var(--muted2)] hover:text-[var(--text)] hover:bg-[var(--paper)] transition-colors cursor-pointer"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onValueChange("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    e.stopPropagation()
                    onValueChange("")
                  }
                }}
              >
                <X className="size-3" />
              </span>
            )}
            <SelectValue
              placeholder={placeholder ?? label}
              className="truncate text-[var(--muted)]"
            />
          </div>
        </SelectTrigger>

        <SelectContent
          position="popper"
          sideOffset={5}
          header={
            showSearch || renderAddField ? (
              <div className="flex flex-col gap-1.5">
                {showSearch && (
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-[5px] border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1.5 text-[13px] text-[var(--text)] placeholder:text-[var(--muted2)] outline-none focus:border-[var(--accent)] focus:ring-[2px] focus:ring-[var(--accent-soft)] transition-[border-color,box-shadow]"
                  />
                )}
                {renderAddField &&
                  renderAddField((newId: string) => {
                    onValueChange(newId)
                    handleClose()
                  })}
              </div>
            ) : null
          }
        >
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-[var(--muted2)]" />
            </div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((option, i) => (
              <SelectItem key={i} value={option.key}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <p className="py-5 text-center text-[12px] text-[var(--muted2)]">No results</p>
          )}
        </SelectContent>
      </Select>

      {error && (
        <p className="px-0.5 text-[11px] text-[var(--red-app)]">{error}</p>
      )}
    </div>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
