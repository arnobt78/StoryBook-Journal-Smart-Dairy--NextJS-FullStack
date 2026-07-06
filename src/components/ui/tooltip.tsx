/**
 * @file components/ui/tooltip.tsx
 *
 * WALKTHROUGH — Radix tooltip for shelf spines, journal nav icons, spread header
 * ─────────────────────────────────────────────────────────────────────────────
 * Provider lives in DashboardClientShell (`delayDuration` 200ms).
 */
"use client";

/**
 * Shadcn-style Radix Tooltip — journal shelf + spread header meta on hover.
 * Styled via `.journal-tooltip-content` in globals.css (leather panel).
 */
import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn("journal-tooltip-content", className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
