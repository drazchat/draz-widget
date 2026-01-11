import { useState, useEffect, useRef } from "react";

/**
 * Hook to manage connection banner visibility
 * Shows "connected" banner only after a disconnection, not on initial connect
 */
export function useConnectionBanner(isConnected: boolean) {
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);
  const wasConnectedRef = useRef(false);
  const hadDisconnectionRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only show banner when reconnecting AFTER having been disconnected
    if (
      isConnected &&
      !wasConnectedRef.current &&
      hadDisconnectionRef.current
    ) {
      wasConnectedRef.current = true;
      queueMicrotask(() => {
        setShowConnectedBanner(true);
      });
      timerRef.current = setTimeout(() => {
        setShowConnectedBanner(false);
      }, 4000);
    } else if (isConnected && !wasConnectedRef.current) {
      // First connection - just mark as connected, don't show banner
      wasConnectedRef.current = true;
    } else if (!isConnected && wasConnectedRef.current) {
      // Disconnection event
      hadDisconnectionRef.current = true;
      wasConnectedRef.current = false;
      queueMicrotask(() => {
        setShowConnectedBanner(false);
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isConnected]);

  return { showConnectedBanner };
}
