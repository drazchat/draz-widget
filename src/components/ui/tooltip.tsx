"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "dz:bg-foreground dz:text-background dz:animate-in dz:fade-in-0 dz:zoom-in-95 data-[state=closed]:dz:animate-out data-[state=closed]:dz:fade-out-0 data-[state=closed]:dz:zoom-out-95 data-[side=bottom]:dz:slide-in-from-top-2 data-[side=left]:dz:slide-in-from-right-2 data-[side=right]:dz:slide-in-from-left-2 data-[side=top]:dz:slide-in-from-bottom-2 dz:z-50 dz:w-fit dz:origin-(--radix-tooltip-content-transform-origin) dz:rounded-md dz:px-3 dz:py-1.5 dz:text-xs dz:text-balance",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="dz:bg-foreground dz:fill-foreground dz:z-50 dz:size-2.5 dz:translate-y-[calc(-50%_-_2px)] dz:rotate-45 dz:rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
