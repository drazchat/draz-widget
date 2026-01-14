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
      <div className="dz:flex dz:items-center dz:justify-between dz:px-4 dz:py-2 dz:bg-red-200 dz:text-red-700 dz:text-xs dz:border dz:animate-fade-in">
        <div className="dz:flex dz:items-center dz:gap-2">
          <span>
            Looks like you're offline. Check your internet connection and
            refresh the page to try again.
          </span>
          <button
            onClick={onRetry}
            className="dz:flex dz:items-center dz:gap-1 dz:px-3 dz:py-1 dz:bg-red-100 hover:dz:bg-red-300/55 hover:dz:text-red-700 dz:cursor-pointer dz:rounded-full dz:text-xs dz:font-medium dz:transition-colors"
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
      <div className="dz:flex dz:items-center dz:justify-center dz:gap-2 dz:px-4 dz:py-2 dz:bg-green-200 dz:text-green-700 dz:text-xs dz:border dz:animate-fade-in">
        <Wifi size={16} />
        <span>You are connected.</span>
      </div>
    );
  }

  return null;
};

export default ConnectionBanner;
