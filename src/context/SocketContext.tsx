import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "./socket.types";
import { SOCKET_URL, API_URL, WORKSPACE_ID } from "./socket.config";
import { SocketContext } from "./socket.context";

// Content item in API response
interface ApiContentItem {
  type:
    | "text"
    | "carousel"
    | "quickReplies"
    | "quick_replies"
    | "video"
    | "image"
    | "attachment";
  text?: string;
  // For carousel/cards and quickReplies (both use data array)
  data?:
    | Array<{
        image?: string;
        title: string;
        description?: string;
        options?: Array<{ label: string; value?: string }>;
      }>
    | Array<{ label: string; value?: string }>;
  // For quickReplies (alternative format)
  quickReplies?: Array<{ label: string; value?: string }>;
  // For video
  url?: string;
  thumbnail?: string;
  // For image
  alt?: string;
  // For attachment
  name?: string;
  mimeType?: string;
  size?: number;
}

// Attachment from API
interface ApiAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
}

// Type for API message response
interface ApiMessage {
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

// Get or create anonymous ID
const getAnonymousId = () => {
  let id = localStorage.getItem("draz_anonymous_id");
  if (!id) {
    id = "user-" + Math.floor(Math.random() * 1000000000);
    localStorage.setItem("draz_anonymous_id", id);
  }
  return id;
};

// Provider component - this is the ONLY export from this file for Fast Refresh
export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<"super" | "human">("super");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    localStorage.getItem("draz_conversation_id")
  );
  const conversationIdRef = useRef(conversationId);
  const historyFetchedRef = useRef(false);
  const pendingMessageRef = useRef<string | null>(null); // Track pending message temp ID
  const activeAgentRef = useRef(activeAgent); // Ref for use in socket handlers

  // Keep refs in sync with state
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    activeAgentRef.current = activeAgent;
  }, [activeAgent]);

  // Fetch chat history - callable function (not auto-run on mount)
  const fetchHistory = useCallback(async () => {
    const storedConversationId = localStorage.getItem("draz_conversation_id");
    if (!storedConversationId || historyFetchedRef.current) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${API_URL}/chat/messages/${storedConversationId}`
      );
      if (!response.ok) {
        console.error("Failed to fetch history:", response.status);
        return;
      }
      const data = await response.json();

      console.log(data);
      // Map API messages to local Message format
      const historyMessages: Message[] = (data.messages || []).map(
        (msg: ApiMessage) => {
          // Initialize rich content
          let cards;
          let quickReplies;
          let video;
          let image;
          let attachments;

          // Parse content array for rich content
          if (msg.content && Array.isArray(msg.content)) {
            for (const item of msg.content) {
              if (item.type === "carousel" && item.data) {
                cards = item.data;
              } else if (item.type === "quick_replies") {
                // quickReplies can be in item.data or item.quickReplies
                quickReplies = item.data || item.quickReplies;
              } else if (item.type === "video" && item.url) {
                video = { url: item.url, thumbnail: item.thumbnail };
              } else if (item.type === "image" && item.url) {
                image = { url: item.url, alt: item.alt };
              } else if (item.type === "attachment" && item.url) {
                if (!attachments) attachments = [];
                attachments.push({
                  url: item.url,
                  name: item.name,
                  type: item.mimeType,
                  size: item.size,
                });
              }
            }
          }

          // Also check top-level fields (direct from API)
          if (!cards && msg.cards) cards = msg.cards;
          if (!quickReplies && msg.quickReplies)
            quickReplies = msg.quickReplies;
          if (!attachments && msg.attachments) attachments = msg.attachments;

          // Build richContent object
          const richContent = {
            ...(cards && { cards }),
            ...(quickReplies && { quickReplies }),
            ...(video && { video }),
            ...(image && { image }),
            ...(attachments && { attachments }),
          };

          return {
            id: msg._id || msg.id || Date.now().toString(),
            text: msg.text || "",
            type:
              msg.sender === "user" || msg.role === "user"
                ? "user"
                : msg.sender === "agent" ||
                  msg.sender === "super_agent" ||
                  msg.role === "assistant"
                ? "bot"
                : msg.sender === "bot"
                ? "bot"
                : "system",
            timestamp: new Date(msg.createdAt ?? msg.timestamp ?? Date.now()),
            // Store in both richContent and legacy fields
            richContent:
              Object.keys(richContent).length > 0 ? richContent : undefined,
            cards,
            quickReplies,
            video,
            image,
          };
        }
      );
      setMessages(historyMessages);
      historyFetchedRef.current = true;
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Add message helper
  const addMessage = useCallback(
    (
      text: string,
      type: Message["type"],
      status?: Message["status"],
      richContent?: Pick<Message, "quickReplies" | "cards" | "video" | "image">
    ) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        type,
        timestamp: new Date(),
        status,
        ...richContent,
      };
      setMessages((prev) => [...prev, newMessage]);
      return newMessage.id; // Return ID for tracking
    },
    []
  );

  // Update message status by ID
  const updateMessageStatus = useCallback(
    (tempId: string, newId: string, status: Message["status"]) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, id: newId, status } : msg
        )
      );
    },
    []
  );

  // Send message function - uses ref to access current socket
  // displayText: what appears in the chat UI
  // payload: what gets sent to the socket (defaults to displayText if not provided)
  const sendMessage = useCallback(
    (displayText: string, payload?: string) => {
      if (!socketRef.current || !displayText.trim()) return;

      // Add message with "sending" status - shows displayText in UI
      const tempId = addMessage(displayText, "user", "sending");
      pendingMessageRef.current = tempId;

      // Send payload to socket (or displayText if no payload provided)
      socketRef.current.emit("client:event", {
        type: "user_message",
        message: payload || displayText,
        conversationId: conversationIdRef.current,
      });
    },
    [addMessage]
  );

  // Restart conversation - clears messages and triggers welcome message
  const restartConversation = useCallback(() => {
    if (!socketRef.current) return;

    // Clear stored conversation ID
    const storedConversationId = localStorage.getItem("draz_conversation_id");

    conversationIdRef.current = null;
    historyFetchedRef.current = false;

    // Emit conversation bootstrap to get new welcome message
    socketRef.current.emit("client:event", {
      type: "conversation_bootstrap",
      conversationId: storedConversationId,
    });
    setIsTyping(true);
  }, []);

  // Initialize socket
  useEffect(() => {
    const anonymousId = getAnonymousId();
    const storedConversationId = localStorage.getItem("draz_conversation_id");

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
      query: {
        clientType: "web",
        workspaceId: WORKSPACE_ID,
        anonymousId: anonymousId,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected:", newSocket.id);
      setIsConnected(true);

      if (!storedConversationId) {
        // New conversation - emit bootstrap
        newSocket.emit("client:event", {
          type: "conversation_bootstrap",
          conversationId: null,
        });
      } else {
        // Existing conversation - emit reconnect to re-associate socket with conversation
        newSocket.emit("client:event", {
          type: "conversation_reconnect",
          conversationId: storedConversationId,
        });
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      addMessage("Disconnected", "system");
    });

    newSocket.on("server:ack", (data) => {
      console.log("Server ack:", data);
      if (data.type === "conversation_started") {
        setConversationId(data.conversationId);
        localStorage.setItem("draz_conversation_id", data.conversationId);
      } else if (data.type === "message_stored" && pendingMessageRef.current) {
        // Update message status from "sending" to "sent"
        updateMessageStatus(pendingMessageRef.current, data.messageId, "sent");
        pendingMessageRef.current = null;
        // Show typing indicator only when talking to bot (not human agent)
        if (activeAgentRef.current !== "human") {
          setIsTyping(true);
        }
      }
    });

    newSocket.on("server:bot_reply", (data) => {
      console.log("Bot reply:", data);
      // Hide typing indicator when reply arrives
      setIsTyping(false);
      if (data.type === "agent_joined") {
        setActiveAgent("human");
        addMessage(`${data.agentName || "Agent"} joined`, "system");
      } else if (data.type === "agent_left") {
        addMessage(`${data.agentName || "Agent"} left`, "system");
        setActiveAgent("super");
      } else {
        // Pass rich content if available
        addMessage(data.text, "bot", undefined, {
          quickReplies: data.quickReplies,
          cards: data.cards,
          video: data.video,
          image: data.image,
        });
      }
    });

    newSocket.on("server:error", (data) => {
      addMessage(`Error: ${data.message}`, "system");
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [addMessage, updateMessageStatus]);

  // Memoize context value to avoid unnecessary re-renders
  // Socket is included for consumers that need direct access
  const contextValue = useMemo(
    () => ({
      isConnected,
      isLoadingHistory,
      isTyping,
      messages,
      sendMessage,
      restartConversation,
      fetchHistory,
      conversationId,
      socket,
    }),
    [
      isConnected,
      isLoadingHistory,
      isTyping,
      messages,
      sendMessage,
      restartConversation,
      fetchHistory,
      conversationId,
      socket,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
