"use client"

import { cn } from "@/lib/utils"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

function Field({
  className,
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" | "responsive" }) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn(
        "group/field flex w-full gap-2 data-[invalid=true]:text-destructive flex-col *:w-full [&>.sr-only]:w-auto",
        className
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="field-title"
      className={cn(
        "text-3xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export {
  Field,
  FieldGroup,
  FieldContent,
  FieldTitle,
}
