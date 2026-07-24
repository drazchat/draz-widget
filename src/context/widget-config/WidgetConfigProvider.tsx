import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { WidgetConfig, DeploymentPresentation } from "./widget-config.types";
import { defaultWidgetConfig } from "./widget-config.types";
import {
  getApiUrl,
  getWorkspaceId,
  getDeploymentId,
  isDeploymentMode,
} from "../socket/socket.config";
import { WidgetConfigContext } from "./widget-config.context";

// Consolidated state type for single atomic updates
interface ConfigState {
  config: WidgetConfig;
  isConfigLoaded: boolean;
  isConfigError: boolean;
  deployment: DeploymentPresentation | null;
}

/**
 * Map a delivery-gateway chat descriptor onto the widget's config model.
 *
 * The descriptor's `theme` is the SINGLE source of truth for appearance — it is
 * the per-workflow look the author published, so two workflows in one workspace
 * render as two distinct chatbots. There is no second request to a shared
 * workspace theme; `defaultWidgetConfig` only fills fields the theme omits.
 */
function descriptorToState(descriptor: Record<string, unknown>): {
  config: WidgetConfig;
  deployment: DeploymentPresentation;
} {
  const theme = (descriptor.theme ?? {}) as Record<string, unknown>;

  const str = (v: unknown): string | undefined =>
    typeof v === "string" && v ? v : undefined;
  const bool = (v: unknown): boolean | undefined =>
    typeof v === "boolean" ? v : undefined;

  const iconImage = str(theme.iconImage) ?? null;

  const deployment: DeploymentPresentation = {
    title: typeof descriptor.title === "string" ? descriptor.title : "",
    subtitle: typeof descriptor.subtitle === "string" ? descriptor.subtitle : "",
    welcomeMessage:
      typeof descriptor.welcomeMessage === "string"
        ? descriptor.welcomeMessage
        : "",
    inputPlaceholder:
      typeof descriptor.inputPlaceholder === "string" &&
      descriptor.inputPlaceholder
        ? descriptor.inputPlaceholder
        : "Type a message…",
    showAssistantAvatar: descriptor.showAssistantAvatar !== false,
    suggestedPrompts: Array.isArray(descriptor.suggestedPrompts)
      ? (descriptor.suggestedPrompts as unknown[]).filter(
          (p): p is string => typeof p === "string",
        )
      : [],
  };

  // Map the published theme (widget vocabulary already resolved by the builder)
  // onto WidgetConfig; every field falls back to the widget default.
  const showAssistantAvatar =
    bool(theme.showAssistantAvatar) ?? deployment.showAssistantAvatar;

  const config: WidgetConfig = {
    ...defaultWidgetConfig,
    // Colors
    primaryColor: str(theme.primaryColor) ?? defaultWidgetConfig.primaryColor,
    secondaryColor:
      str(theme.secondaryColor) ?? defaultWidgetConfig.secondaryColor,
    userMessageColor:
      str(theme.bubbleColor) ?? defaultWidgetConfig.userMessageColor,
    // Launcher
    widgetLauncherShape:
      (str(theme.launcherStyle) as WidgetConfig["widgetLauncherShape"]) ??
      defaultWidgetConfig.widgetLauncherShape,
    launcherAnimation:
      (str(theme.launcherAnimation) as WidgetConfig["launcherAnimation"]) ??
      defaultWidgetConfig.launcherAnimation,
    // Layout
    widgetSize:
      (str(theme.widgetSize) as WidgetConfig["widgetSize"]) ??
      defaultWidgetConfig.widgetSize,
    bubbleSize:
      (str(theme.bubbleSize) as WidgetConfig["bubbleSize"]) ??
      defaultWidgetConfig.bubbleSize,
    widgetPosition:
      theme.widgetPosition === "left" ? "left" : "right",
    // Controls
    showOptionsMenu:
      bool(theme.showOptionsButton) ?? defaultWidgetConfig.showOptionsMenu,
    showBranding: bool(theme.showBranding) ?? defaultWidgetConfig.showBranding,
    // Fonts
    fontSize:
      (str(theme.fontSize) as WidgetConfig["fontSize"]) ??
      defaultWidgetConfig.fontSize,
    avatarShape: theme.avatarShape === "rounded" ? "rounded" : "circle",
    // Content (descriptor copy beats theme)
    botName: deployment.title || defaultWidgetConfig.botName,
    botSubtitle: deployment.subtitle || defaultWidgetConfig.botSubtitle,
    // Published icon; never the Draz default on a customer-branded deployment.
    botAvatar: showAssistantAvatar ? iconImage : null,
    widgetIcon: iconImage || defaultWidgetConfig.widgetIcon,
    // Deployment chat has no home-screen flow; restart lives in the header menu.
    showHomeButton: false,
  };

  return { config, deployment };
}

// Provider component
export const WidgetConfigProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfigState>({
    config: defaultWidgetConfig,
    isConfigLoaded: false,
    isConfigError: false,
    deployment: null,
  });

  useEffect(() => {
    // AbortController for cleanup on unmount (prevents memory leaks)
    const controller = new AbortController();

    const failLoaded = () =>
      setState((prev) => ({
        ...prev,
        isConfigLoaded: true,
        isConfigError: true,
      }));

    // ── Deployment mode: descriptor (content) + workspace theme (styling) ───
    const fetchDeploymentDescriptor = async () => {
      const deploymentId = getDeploymentId();
      const endpoint = `${getApiUrl()}/d/${deploymentId}`;

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          console.error("[WidgetConfig] Descriptor fetch failed:", response.status);
          failLoaded();
          return;
        }
        const data = await response.json();
        const descriptor = (data.data ?? {}) as Record<string, unknown>;

        // The descriptor carries the full per-workflow theme, so the widget
        // renders from a single request — no shared workspace-theme fetch.
        const { config, deployment } = descriptorToState(descriptor);
        setState({
          config,
          deployment,
          isConfigLoaded: true,
          isConfigError: false,
        });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        console.error("[WidgetConfig] Descriptor fetch error:", error);
        failLoaded();
      }
    };

    // ── Workspace mode: legacy per-workspace widget config ──────────────────
    const fetchWorkspaceConfig = async () => {
      // Get workspace ID at runtime (after widget.entry.tsx sets global config)
      const workspaceId = getWorkspaceId();

      if (!workspaceId) {
        console.error("[WidgetConfig] No workspace ID available");
        failLoaded();
        return;
      }

      const endpoint = `${getApiUrl()}/auth/widget/config/${workspaceId}`;

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error("[WidgetConfig] Failed to fetch:", response.status);
          failLoaded();
          return;
        }

        const data = await response.json();
        const apiConfig = data.config || {};

        // Merge with defaults (handles missing fields)
        setState({
          config: { ...defaultWidgetConfig, ...apiConfig },
          isConfigLoaded: true,
          isConfigError: false,
          deployment: null,
        });
      } catch (error) {
        // Ignore abort errors (expected on unmount)
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("[WidgetConfig] Fetch error:", error);
        failLoaded();
      }
    };

    if (isDeploymentMode()) {
      fetchDeploymentDescriptor();
    } else {
      fetchWorkspaceConfig();
    }

    // Cleanup: abort in-flight request on unmount
    return () => controller.abort();
  }, []);

  // Memoized context value prevents unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({
      config: state.config,
      isConfigLoaded: state.isConfigLoaded,
      isConfigError: state.isConfigError,
      deployment: state.deployment,
    }),
    [state.config, state.isConfigLoaded, state.isConfigError, state.deployment]
  );

  return (
    <WidgetConfigContext.Provider value={contextValue}>
      {children}
    </WidgetConfigContext.Provider>
  );
};
