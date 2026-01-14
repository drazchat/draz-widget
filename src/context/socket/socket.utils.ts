import type { Message, ApiMessage } from "./socket.types";

// =============================================================================
// Constants
// =============================================================================

export const STORAGE_KEYS = {
  ANONYMOUS_ID: "draz_anonymous_id",
  CONVERSATION_ID: "draz_conversation_id",
} as const;

export const SOCKET_OPTIONS = {
  transports: ["websocket"] as ("websocket" | "polling")[],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
};

// =============================================================================
// Utilities
// =============================================================================

/** Get or create anonymous ID with secure generation */
export const getAnonymousId = (): string => {
  let id = localStorage.getItem(STORAGE_KEYS.ANONYMOUS_ID);
  if (!id) {
    id =
      typeof crypto?.randomUUID === "function"
        ? `user-${crypto.randomUUID()}`
        : `user-${Math.floor(Math.random() * 1000000000)}`;
    localStorage.setItem(STORAGE_KEYS.ANONYMOUS_ID, id);
  }
  return id;
};

/** Parse API message to local Message format */
export const parseApiMessage = (msg: ApiMessage): Message => {
  let cards;
  let quickReplies;
  let video;
  let image;
  let attachments;

  // Parse content array for rich content
  if (msg.content && Array.isArray(msg.content)) {
    for (const item of msg.content) {
      switch (item.type) {
        case "carousel":
        case "cards":
          if (item.data) cards = item.data;
          break;
        case "quick_replies":
        case "quickReplies":
          quickReplies = item.data || item.quickReplies;
          break;
        case "video":
          if (item.url) video = { url: item.url, thumbnail: item.thumbnail };
          break;
        case "image":
          if (item.url) image = { url: item.url, alt: item.alt };
          break;
        case "attachment":
          if (item.url) {
            if (!attachments) attachments = [];
            attachments.push({
              url: item.url,
              name: item.name,
              type: item.mimeType,
              size: item.size,
            });
          }
          break;
      }
    }
  }

  // Check top-level fields (direct from API)
  if (!cards && msg.cards) cards = msg.cards;
  if (!quickReplies && msg.quickReplies) quickReplies = msg.quickReplies;
  if (!attachments && msg.attachments) attachments = msg.attachments;

  // Build richContent object
  const richContent = {
    ...(cards && { cards }),
    ...(quickReplies && { quickReplies }),
    ...(video && { video }),
    ...(image && { image }),
    ...(attachments && { attachments }),
  };

  // Determine message type
  const isUser = msg.sender === "user" || msg.role === "user";
  const isBot =
    msg.sender === "agent" ||
    msg.sender === "super_agent" ||
    msg.sender === "bot" ||
    msg.role === "assistant";

  return {
    id: msg._id || msg.id || Date.now().toString(),
    text: msg.text || "",
    type: isUser ? "user" : isBot ? "bot" : "system",
    timestamp: new Date(msg.createdAt ?? msg.timestamp ?? Date.now()),
    richContent:
      Object.keys(richContent).length > 0
        ? (richContent as Message["richContent"])
        : undefined,
    cards: cards as Message["cards"],
    quickReplies: quickReplies as Message["quickReplies"],
    video,
    image,
  };
};
