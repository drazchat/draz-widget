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
 * `workspaceTheme` is the workspace widget-settings panel config (colors,
 * launcher, fonts, avatar) — it styles the widget, while the deployment
 * descriptor owns the conversation content (title, welcome, prompts).
 */
function descriptorToState(
  descriptor: Record<string, unknown>,
  workspaceTheme: Partial<WidgetConfig>,
): {
  config: WidgetConfig;
  deployment: DeploymentPresentation;
} {
  const theme = (descriptor.theme ?? {}) as Record<string, unknown>;
  const iconImage =
    typeof theme.iconImage === "string" && theme.iconImage
      ? theme.iconImage
      : null;

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

  const themed: WidgetConfig = {
    ...defaultWidgetConfig,
    ...workspaceTheme,
  };

  const panelAvatar =
    typeof workspaceTheme.botAvatar === "string" && workspaceTheme.botAvatar
      ? workspaceTheme.botAvatar
      : null;

  const config: WidgetConfig = {
    ...themed,
    // Deployment content beats panel copy; panel theme styles everything.
    botName: deployment.title || themed.botName,
    botSubtitle: deployment.subtitle || themed.botSubtitle,
    // Published deployment icon wins; else the panel's avatar; never the
    // Draz default on a customer-branded deployment.
    botAvatar: deployment.showAssistantAvatar
      ? iconImage || panelAvatar
      : null,
    widgetIcon: iconImage || themed.widgetIcon,
    // Deployment chat has no home-screen flow; the restart action lives in
    // the header menu, so hide the footer home button.
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

        // The workspace widget-settings panel styles the widget (colors,
        // launcher, fonts, avatar). Best-effort: theming must never block
        // the conversation.
        let workspaceTheme: Partial<WidgetConfig> = {};
        const workspaceId =
          typeof descriptor.workspaceId === "string"
            ? descriptor.workspaceId
            : "";
        if (workspaceId) {
          try {
            const themeRes = await fetch(
              `${getApiUrl()}/auth/widget/config/${workspaceId}`,
              { signal: controller.signal, headers: { Accept: "application/json" } },
            );
            if (themeRes.ok) {
              const themeData = await themeRes.json();
              workspaceTheme = themeData.config || {};
            }
          } catch {
            /* theme is optional */
          }
        }

        const { config, deployment } = descriptorToState(
          descriptor,
          workspaceTheme,
        );
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
