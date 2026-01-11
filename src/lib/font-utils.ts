/**
 * Font size utility mappings for Tailwind CSS
 *
 * Tailwind purges unused classes at build time. Dynamic class names like `text-${size}`
 * won't be included in the bundle. This mapping ensures all classes are referenced statically.
 */

import type { WidgetConfig } from "@/context";

type FontSize = WidgetConfig["fontSize"];

/** Maps fontSize config to Tailwind text size class */
export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  xs: "font-xs",
  sm: "font-sm",
  md: "font-md",
  lg: "font-lg",
  xl: "font-xl",
  "2xl": "font-2xl",
  "3xl": "font-3xl",
} as const;

/** Helper function to get font size class with fallback */
export function getFontSizeClass(size: FontSize | undefined): string {
  return FONT_SIZE_CLASS[size ?? "md"];
}
