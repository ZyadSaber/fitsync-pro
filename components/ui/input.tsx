import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label";
import { LucideIcon } from "lucide-react";

type InputProps = React.ComponentProps<"input"> & {
  error?: string
  label?: string
  containerClassName?: string;
  icon?: LucideIcon
}

function Input({ icon: Icon, className, type, error, name, label, containerClassName, ...props }: InputProps) {
  return (
    <div className={cn("space-y-2 px-1", containerClassName)}>
      {(Icon || label) &&
        <Label htmlFor={name} className="block text-xs font-semibold text-[#6B7280] uppercase tracking-[0.06em] mb-2">
          {Icon && <Icon className="w-3 h-3" />} {label}
        </Label>}
      <input
        type={type}
        data-slot="input"
        name={name}
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-red-600/20 dark:aria-invalid:ring-red-600/40 aria-invalid:border-red-600",
          !!error && "border-red-600",
          className
        )}
        {...props}
      />
      {!!error && <p className="text-red-600 text-sm px-3 ">{error}</p>}
    </div>
  )
}

export { Input }
