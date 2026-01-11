import type { WidgetConfig } from "@/context";

/**
 * Props for the main WidgetLauncher component
 */
export interface WidgetLauncherProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  config: WidgetConfig;
}

/**
 * Dynamic button color classes based on background luminance
 */
export interface ButtonColors {
  text: string;
  subtitle: string;
  hover: string;
}

/**
 * Props for launcher sub-components
 */
export interface LauncherButtonProps {
  config: WidgetConfig;
  onClick: () => void;
}

export interface BarLauncherProps extends LauncherButtonProps {
  buttonColors: ButtonColors;
}

export interface LauncherTooltipProps {
  config: WidgetConfig;
  message: string | undefined;
  showTooltip: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}
