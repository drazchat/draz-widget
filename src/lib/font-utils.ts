/**
 * Font size utility mappings for Tailwind CSS
 *
 * Tailwind purges unused classes at build time. Dynamic class names like `text-${size}`
 * won't be included in the bundle. This mapping ensures all classes are referenced statically.
 *
 * Uses dz: prefix for CSS isolation in embedded widget.
 */

import type { WidgetConfig } from "@/context";

type FontSize = WidgetConfig["fontSize"];

/** Maps fontSize config to Tailwind text size class with dz: prefix */
export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  xs: "dz:font-xs",
  sm: "dz:font-sm",
  md: "dz:font-md",
  lg: "dz:font-lg",
  xl: "dz:font-xl",
  "2xl": "dz:font-2xl",
  "3xl": "dz:font-3xl",
} as const;

/** Helper function to get font size class with fallback */
export function getFontSizeClass(size: FontSize | undefined): string {
  return FONT_SIZE_CLASS[size ?? "md"];
}
