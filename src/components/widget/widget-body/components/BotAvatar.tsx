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
    <div className={`dz:relative ${className || ""}`}>
      {/* Fallback icon - always rendered, hidden when image loads */}
      {(!imageLoaded || imageError) && (
        <div className="dz:w-6 dz:h-6 dz:rounded-full dz:bg-gray-200 dz:flex dz:items-center dz:justify-center">
          <MessageCircle size={14} className="dz:text-gray-500" />
        </div>
      )}
      {/* Actual image - hidden until loaded */}
      {!imageError && (
        <img
          src={src}
          className={`dz:w-6 dz:h-6 dz:rounded-full dz:shrink-0 ${
            imageLoaded ? "" : "dz:hidden"
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
