import type { LauncherAnimation } from "@/context";

/**
 * CSS animation class mappings for launcher animations
 */
export const ANIMATION_CLASSES: Record<
  NonNullable<LauncherAnimation>,
  string
> = {
  pulse: "animate-launcher-pulse",
  bounce: "animate-launcher-bounce",
  wiggle: "animate-launcher-wiggle",
  shake: "animate-launcher-shake",
  heartbeat: "animate-launcher-heartbeat",
  glow: "animate-launcher-glow",
  tada: "animate-launcher-tada",
};

/**
 * Default launcher color when none provided
 */
export const DEFAULT_LAUNCHER_COLOR = "#ffffff";

/**
 * Maximum tooltip message length before truncation
 */
export const TOOLTIP_MAX_LENGTH = 200;

/**
 * Bar launcher fixed dimensions
 */
export const BAR_LAUNCHER_WIDTH = "280px";
