import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import type { Message, MessageRichContent } from "./socket.types";
import { SOCKET_URL, API_URL, getWorkspaceId } from "./socket.config";
import { SocketContext } from "./socket.context";
import {
  STORAGE_KEYS,
  SOCKET_OPTIONS,
  getAnonymousId,
  parseApiMessage,
} from "./socket.utils";

// =============================================================================
// Provider Component
// =============================================================================

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  // Socket refs
  const socketRef = useRef<Socket | null>(null);
  const conversationIdRef = useRef<string | null>(
    localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID)
  );
  const historyFetchedRef = useRef(false);
  const pendingMessageRef = useRef<string | null>(null);
  const activeAgentRef = useRef<"super" | "human">("super");
  const abortControllerRef = useRef<AbortController | null>(null);

  // State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgent, setActiveAgent] = useState<"super" | "human">("super");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(
    localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID)
  );

  // Keep refs in sync with state
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    activeAgentRef.current = activeAgent;
  }, [activeAgent]);

  // ==========================================================================
  // Message Helpers
  // ==========================================================================

  const addMessage = useCallback(
    (
      text: string,
      type: Message["type"],
      status?: Message["status"],
      richContent?: MessageRichContent
    ): string => {
      const id = Date.now().toString();
      const newMessage: Message = {
        id,
        text,
        type,
        timestamp: new Date(),
        status,
        ...richContent,
      };
      setMessages((prev) => [...prev, newMessage]);
      return id;
    },
    []
  );

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

  // ==========================================================================
  // API Functions
  // ==========================================================================

  const fetchHistory = useCallback(async () => {
    const storedConversationId = localStorage.getItem(
      STORAGE_KEYS.CONVERSATION_ID
    );
    if (!storedConversationId || historyFetchedRef.current) {
      setIsLoadingHistory(false);
      return;
    }

    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsLoadingHistory(true);
    try {
      const response = await fetch(
        `${API_URL}/chat/messages/${storedConversationId}`,
        { signal: abortControllerRef.current.signal }
      );

      if (!response.ok) {
        console.error("[Socket] Failed to fetch history:", response.status);
        return;
      }

      const data = await response.json();
      const historyMessages = (data.messages || []).map(parseApiMessage);

      setMessages(historyMessages);
      historyFetchedRef.current = true;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("[Socket] Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // ==========================================================================
  // Socket Actions
  // ==========================================================================

  const sendMessage = useCallback(
    (displayText: string, payload?: string) => {
      if (!socketRef.current || !displayText.trim()) return;

      const tempId = addMessage(displayText, "user", "sending");
      pendingMessageRef.current = tempId;

      socketRef.current.emit("client:event", {
        type: "user_message",
        message: payload || displayText,
        conversationId: conversationIdRef.current,
      });
    },
    [addMessage]
  );

  const restartConversation = useCallback(() => {
    if (!socketRef.current) return;

    const storedConversationId = localStorage.getItem(
      STORAGE_KEYS.CONVERSATION_ID
    );

    // Reset refs but DON'T clear messages yet - they'll be replaced when new message arrives
    conversationIdRef.current = null;
    historyFetchedRef.current = false;

    // Show typing indicator immediately
    setIsTyping(true);

    // Emit bootstrap for new welcome message
    socketRef.current.emit("client:event", {
      type: "conversation_bootstrap",
      conversationId: storedConversationId,
    });
  }, []);

  // ==========================================================================
  // Socket Initialization
  // ==========================================================================

  useEffect(() => {
    const anonymousId = getAnonymousId();
    const storedConversationId = localStorage.getItem(
      STORAGE_KEYS.CONVERSATION_ID
    );

    const newSocket = io(SOCKET_URL, {
      ...SOCKET_OPTIONS,
      query: {
        clientType: "web",
        workspaceId: getWorkspaceId(),
        anonymousId,
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Event Handlers
    const handleConnect = () => {
      setIsConnected(true);

      if (!storedConversationId) {
        newSocket.emit("client:event", {
          type: "conversation_bootstrap",
          conversationId: null,
        });
      } else {
        newSocket.emit("client:event", {
          type: "conversation_reconnect",
          conversationId: storedConversationId,
        });
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleAck = (data: {
      type: string;
      conversationId?: string;
      messageId?: string;
    }) => {
      if (data.type === "conversation_started" && data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, data.conversationId);
      } else if (
        data.type === "message_stored" &&
        pendingMessageRef.current &&
        data.messageId
      ) {
        updateMessageStatus(pendingMessageRef.current, data.messageId, "sent");
        pendingMessageRef.current = null;

        if (activeAgentRef.current !== "human") {
          setIsTyping(true);
        }
      }
    };

    const handleBotReply = (data: {
      type?: string;
      text?: string;
      agentName?: string;
      quickReplies?: MessageRichContent["quickReplies"];
      cards?: MessageRichContent["cards"];
      video?: MessageRichContent["video"];
      image?: MessageRichContent["image"];
    }) => {
      setIsTyping(false);

      if (data.type === "agent_joined") {
        setActiveAgent("human");
        addMessage(`${data.agentName || "Agent"} joined`, "system");
      } else if (data.type === "agent_left") {
        addMessage(`${data.agentName || "Agent"} left`, "system");
        setActiveAgent("super");
      } else {
        addMessage(data.text || "", "bot", undefined, {
          quickReplies: data.quickReplies,
          cards: data.cards,
          video: data.video,
          image: data.image,
        });
      }
    };

    const handleError = (data: { message?: string }) => {
      addMessage(`Error: ${data.message || "Unknown error"}`, "system");
    };

    // Register event listeners
    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("server:ack", handleAck);
    newSocket.on("server:bot_reply", handleBotReply);
    newSocket.on("server:error", handleError);

    // Cleanup
    return () => {
      abortControllerRef.current?.abort();
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("server:ack", handleAck);
      newSocket.off("server:bot_reply", handleBotReply);
      newSocket.off("server:error", handleError);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [addMessage, updateMessageStatus]);

  // ==========================================================================
  // Context Value
  // ==========================================================================

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
