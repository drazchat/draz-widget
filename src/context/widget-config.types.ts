// Animation options that can be selected from database
export type LauncherAnimation =
  | "pulse"
  | "bounce"
  | "wiggle"
  | "shake"
  | "heartbeat"
  | "glow"
  | "tada"
  | null;

export interface WidgetConfig {
  // Appearance
  primaryColor: string;
  secondaryColor: string;

  // Visibility toggles
  showHomeButton: boolean;
  showOptionsMenu: boolean;
  showBranding: boolean;

  // Bot info
  botName: string;
  botSubtitle: string;
  botAvatar: string | null;

  // Widget info
  widgetIcon: string | null;

  // Launcher animation
  launcherAnimation: LauncherAnimation;

  // Widget launcher style
  widgetLauncherShape: "circle" | "square" | "bar";
  widgetLauncherColor: string;

  // Widget position
  widgetPosition: "right" | "left";

  // Widget size
  widgetSize: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

  // Chat bubble
  showChatBubble: boolean;

  // User message color
  userMessageColor: string | null;
  userMessageTextColor: string | null;

  // Font size
  fontSize: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

// Default config (fallback if API fails)
export const defaultWidgetConfig: WidgetConfig = {
  primaryColor: "#011940",
  secondaryColor: "#69a2ff",
  showHomeButton: true,
  showOptionsMenu: true,
  showBranding: true,
  botName: "Draz Assistant",
  botSubtitle: "Ask me anything about Draz.chat",
  botAvatar: "https://animateicons.vercel.app/winter-logo.svg",
  // botAvatar: "draz-favicon-light.svg",
  // botAvatar: null,
  // widgetIcon: "draz-favicon-dark.svg",
  widgetIcon: null,
  launcherAnimation: "tada",
  widgetLauncherColor: "#fff",
  widgetLauncherShape: "square",
  widgetPosition: "right",
  widgetSize: "md",
  showChatBubble: false,
  userMessageColor: null,
  userMessageTextColor: null,
  fontSize: "md",
};

export interface WidgetConfigContextType {
  config: WidgetConfig;
  isConfigLoaded: boolean;
  isConfigError: boolean;
}
