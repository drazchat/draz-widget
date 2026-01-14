import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "@/lib/utils";

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "dz:bg-popover dz:text-popover-foreground data-[state=open]:dz:animate-in data-[state=closed]:dz:animate-out data-[state=closed]:dz:fade-out-0 data-[state=open]:dz:fade-in-0 data-[state=closed]:dz:zoom-out-95 data-[state=open]:dz:zoom-in-95 data-[side=bottom]:dz:slide-in-from-top-2 data-[side=left]:dz:slide-in-from-right-2 data-[side=right]:dz:slide-in-from-left-2 data-[side=top]:dz:slide-in-from-bottom-2 dz:z-50 dz:max-h-(--radix-dropdown-menu-content-available-height) dz:min-w-[8rem] dz:origin-(--radix-dropdown-menu-content-transform-origin) dz:overflow-x-hidden dz:overflow-y-auto dz:rounded-md dz:border dz:p-1 dz:shadow-md",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:dz:bg-accent focus:dz:text-accent-foreground data-[variant=destructive]:dz:text-destructive data-[variant=destructive]:focus:dz:bg-destructive/10 dark:data-[variant=destructive]:focus:dz:bg-destructive/20 data-[variant=destructive]:focus:dz:text-destructive data-[variant=destructive]:*:[svg]:dz:!text-destructive [&_svg:not([class*='text-'])]:dz:text-muted-foreground dz:relative dz:flex dz:cursor-default dz:items-center dz:gap-2 dz:rounded-sm dz:px-2 dz:py-1.5 dz:text-sm dz:outline-hidden dz:select-none data-[disabled]:dz:pointer-events-none data-[disabled]:dz:opacity-50 data-[inset]:dz:pl-8 [&_svg]:dz:pointer-events-none [&_svg]:dz:shrink-0 [&_svg:not([class*='size-'])]:dz:size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "dz:px-2 dz:py-1.5 dz:text-sm dz:font-medium data-[inset]:dz:pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("dz:bg-border dz:-mx-1 dz:my-1 dz:h-px", className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
