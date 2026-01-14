import { memo, useState } from "react";
import { MessageCircle } from "lucide-react";

interface BotAvatarProps {
  src: string;
  className?: string;
}

const BotAvatar = memo(function BotAvatar({ src, className }: BotAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${className || ""}`}>
      {/* Fallback icon - always rendered, hidden when image loads */}
      {(!imageLoaded || imageError) && (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <MessageCircle size={14} className="text-gray-500" />
        </div>
      )}
      {/* Actual image - hidden until loaded */}
      {!imageError && (
        <img
          src={src}
          className={`w-6 h-6 rounded-full shrink-0 ${
            imageLoaded ? "" : "hidden"
          }`}
          alt="Bot"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
});

export default BotAvatar;
