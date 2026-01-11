import type { Socket } from "socket.io-client";

// =============================================================================
// Shared Types
// =============================================================================

/** Quick reply button */
export interface QuickReply {
  label: string;
  value?: string;
}

/** Option for card buttons */
export interface CardOption {
  label: string;
  value?: string;
}

/** Card for carousel/single card messages */
export interface Card {
  title: string;
  description?: string;
  image?: string;
  options?: CardOption[];
}

/** Video content */
export interface VideoContent {
  url: string;
  thumbnail?: string;
}

/** Image content */
export interface ImageContent {
  url: string;
  alt?: string;
}

/** Attachment content */
export interface Attachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

/** Rich content container */
export interface RichContent {
  quickReplies?: QuickReply[];
  cards?: Card[];
  video?: VideoContent;
  image?: ImageContent;
  attachments?: Attachment[];
}

/** Message type shared between components */
export interface Message {
  id: string;
  text: string;
  type: "user" | "bot" | "system";
  timestamp: Date;
  status?: "sending" | "sent";
  richContent?: RichContent;
  // Legacy fields for backward compatibility
  quickReplies?: QuickReply[];
  cards?: Card[];
  video?: VideoContent;
  image?: ImageContent;
}

// =============================================================================
// API Response Types
// =============================================================================

/** Content item in API response */
export interface ApiContentItem {
  type:
    | "text"
    | "carousel"
    | "quickReplies"
    | "quick_replies"
    | "video"
    | "image"
    | "attachment";
  text?: string;
  data?:
    | Array<{
        image?: string;
        title: string;
        description?: string;
        options?: Array<{ label: string; value?: string }>;
      }>
    | Array<{ label: string; value?: string }>;
  quickReplies?: Array<{ label: string; value?: string }>;
  url?: string;
  thumbnail?: string;
  alt?: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

/** Attachment from API */
export interface ApiAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

/** API message response */
export interface ApiMessage {
  _id?: string;
  id?: string;
  content?: ApiContentItem[];
  text?: string;
  sender?: "user" | "agent" | "bot" | "system" | "super_agent";
  role?: "user" | "assistant" | "system";
  createdAt?: string;
  timestamp?: string;
  quickReplies?: Array<{ label: string; value?: string }>;
  cards?: Array<{
    image?: string;
    title: string;
    description?: string;
    options?: Array<{ label: string; value?: string }>;
  }>;
  attachments?: ApiAttachment[];
}

/** Rich content subset for message handlers */
export type MessageRichContent = Pick<
  Message,
  "quickReplies" | "cards" | "video" | "image"
>;

// =============================================================================
// Context Types
// =============================================================================

export interface SocketContextType {
  isConnected: boolean;
  isLoadingHistory: boolean;
  isTyping: boolean;
  messages: Message[];
  sendMessage: (displayText: string, payload?: string) => void;
  restartConversation: () => void;
  fetchHistory: () => Promise<void>;
  conversationId: string | null;
  socket: Socket | null;
}
