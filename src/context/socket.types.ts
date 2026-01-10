import type { Socket } from "socket.io-client";

// Quick reply button
export interface QuickReply {
  label: string;
  value?: string;
}

// Option for card buttons
export interface CardOption {
  label: string;
  value?: string;
}

// Card for carousel/single card messages
export interface Card {
  title: string;
  description?: string;
  image?: string;
  options?: CardOption[];
}

// Video content
export interface VideoContent {
  url: string;
  thumbnail?: string;
}

// Image content
export interface ImageContent {
  url: string;
  alt?: string;
}

// Attachment content
export interface Attachment {
  url: string;
  name?: string;
  type?: string; // mime type
  size?: number; // in bytes
}

// Rich content container - stores all rich content types in one place
export interface RichContent {
  quickReplies?: QuickReply[];
  cards?: Card[];
  video?: VideoContent;
  image?: ImageContent;
  attachments?: Attachment[];
}

// Message type shared between components
export interface Message {
  id: string;
  text: string;
  type: "user" | "bot" | "system";
  timestamp: Date;
  status?: "sending" | "sent"; // Only applicable for user messages
  // Rich content - all rich content types stored here
  richContent?: RichContent;
  // Legacy fields for backward compatibility (deprecated - use richContent instead)
  quickReplies?: QuickReply[];
  cards?: Card[];
  video?: VideoContent;
  image?: ImageContent;
}

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
