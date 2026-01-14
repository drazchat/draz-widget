import { RefreshCw, Wifi } from "lucide-react";

interface ConnectionBannerProps {
  isConnected: boolean;
  showConnectedBanner: boolean;
  onRetry: () => void;
}

const ConnectionBanner = ({
  isConnected,
  showConnectedBanner,
  onRetry,
}: ConnectionBannerProps) => {
  // Disconnected banner
  if (!isConnected) {
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-red-200 text-red-700 text-xs border animate-fade-in">
        <div className="flex items-center gap-2">
          <span>
            Looks like you're offline. Check your internet connection and
            refresh the page to try again.
          </span>
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-300/55 hover:text-red-700 cursor-pointer rounded-full text-xs font-medium transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Reconnected banner
  if (showConnectedBanner) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-200 text-green-700 text-xs border animate-fade-in">
        <Wifi size={16} />
        <span>You are connected.</span>
      </div>
    );
  }

  return null;
};

export default ConnectionBanner;
