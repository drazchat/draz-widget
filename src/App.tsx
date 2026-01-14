import { useState, useMemo, useCallback, Component, memo } from "react";
import type { ReactNode, ErrorInfo } from "react";
import WidgetLauncher from "./components/widget-launcher";
import Widget from "./components/widget";
import {
  WidgetConfigProvider,
  useWidgetConfig,
  SocketProvider,
} from "./context";

// Position class mapping for O(1) lookup
const POSITION_CLASSES = {
  left: "left-6",
  right: "right-6",
} as const;
// =============================================================================
// Error Boundary - Catches runtime errors in widget tree
// =============================================================================
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

class WidgetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to error reporting service in production
    console.error("[Widget Error]:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}

// =============================================================================
// Widget Container - Manages widget positioning and visibility
// =============================================================================
const WidgetContainer = memo(function WidgetContainer() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, isConfigLoaded } = useWidgetConfig();

  // Stable callback reference to prevent child re-renders
  const toggleOpen = useCallback((open: boolean) => setIsOpen(open), []);

  // O(1) position lookup with fallback
  const positionClass = useMemo(
    () =>
      POSITION_CLASSES[
        config.widgetPosition as keyof typeof POSITION_CLASSES
      ] ?? POSITION_CLASSES.right,
    [config.widgetPosition]
  );

  // Early return while loading - no DOM footprint
  if (!isConfigLoaded) return null;

  return (
    <SocketProvider>
      <div
        className={`fixed z-50 flex flex-col items-end gap-4 bottom-6 ${positionClass}`}
        role="complementary"
        aria-label="Chat widget"
      >
        {/* Chat Window launcher */}
        {isOpen && (
          <Widget isOpen={isOpen} setIsOpen={toggleOpen} config={config} />
        )}

        {/* Launcher Button - Always mounted for tooltip state persistence */}
        <WidgetLauncher
          config={config}
          isOpen={isOpen}
          setIsOpen={toggleOpen}
        />
      </div>
    </SocketProvider>
  );
});

// =============================================================================
// App Root - Top-level providers and error boundary
// =============================================================================
function App() {
  return (
    <WidgetErrorBoundary>
      <WidgetConfigProvider>
        <WidgetContainer />
      </WidgetConfigProvider>
    </WidgetErrorBoundary>
  );
}

App.displayName = "DrazWidget";

export default App;
