import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import type { Message, MessageRichContent } from "../socket/socket.types";
import {
  getApiUrl,
  getDeploymentId,
  getDeploymentToken,
} from "../socket/socket.config";
import { SocketContext } from "../socket/socket.context";
import { parseApiMessage } from "../socket/socket.utils";
import { useWidgetConfig } from "../widget-config";

// =============================================================================
// Deployment Chat Provider
// =============================================================================
// The HTTP counterpart of SocketProvider: implements the exact same
// SocketContextType against the delivery gateway's per-deployment chat API
// (POST /d/:id/chat/turn, GET /d/:id/chat/history, POST /d/:id/chat/reset).
// Every UI component keeps consuming useSocket() unchanged — only the
// transport differs. There is no socket: turns are synchronous request /
// response, and the typing indicator covers the wait.

const SESSION_STORAGE_PREFIX = "draz_dep_session:";

function newSessionKey(): string {
  if (typeof crypto?.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Fallback: pad with a second random chunk so the key always clears the
  // server's 16-char minimum.
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`.slice(0, 32);
}

function loadSessionKey(deploymentId: string): string {
  const storageKey = `${SESSION_STORAGE_PREFIX}${deploymentId}`;
  try {
    const existing = localStorage.getItem(storageKey);
    // 16-char server minimum: shorter legacy keys rotate to a fresh one.
    if (existing && /^[A-Za-z0-9_-]{16,64}$/.test(existing)) return existing;
  } catch {
    /* storage blocked — in-memory key still works for this page view */
  }
  const fresh = newSessionKey();
  try {
    localStorage.setItem(storageKey, fresh);
  } catch {
    /* ignore */
  }
  return fresh;
}

export const DeploymentChatProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const deploymentId = getDeploymentId();
  const { deployment } = useWidgetConfig();

  // Refs
  const sessionKeyRef = useRef<string>(loadSessionKey(deploymentId));
  const historyFetchedRef = useRef(false);
  // Serializes turns: a second send waits for the in-flight one to finish so
  // paused-workflow state never sees two racing resumes.
  const turnChainRef = useRef<Promise<void>>(Promise.resolve());

  // State
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const authHeaders = useCallback((): Record<string, string> => {
    const token = getDeploymentToken();
    return token ? { "X-Deployment-Token": token } : {};
  }, []);

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
      const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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

  const markMessageStatus = useCallback(
    (id: string, status: Message["status"]) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
      );
    },
    []
  );

  /** Local welcome bubble (published config; suggested prompts as replies). */
  const seedWelcome = useCallback(() => {
    if (!deployment?.welcomeMessage && !deployment?.suggestedPrompts?.length) {
      return;
    }
    const quickReplies = (deployment.suggestedPrompts || []).map((prompt) => ({
      label: prompt,
      value: prompt,
    }));
    setMessages([
      {
        id: "welcome",
        text: deployment.welcomeMessage || "Hi! How can I help you today?",
        type: "bot",
        timestamp: new Date(),
        ...(quickReplies.length > 0 ? { quickReplies } : {}),
      },
    ]);
  }, [deployment]);

  // ==========================================================================
  // API Functions
  // ==========================================================================

  const fetchHistory = useCallback(async () => {
    if (historyFetchedRef.current) {
      setIsLoadingHistory(false);
      return;
    }
    historyFetchedRef.current = true;
    setIsLoadingHistory(true);

    try {
      const response = await fetch(
        `${getApiUrl()}/d/${deploymentId}/chat/history?sessionKey=${encodeURIComponent(sessionKeyRef.current)}`,
        { headers: authHeaders() }
      );
      if (!response.ok) {
        console.error("[DeploymentChat] History fetch failed:", response.status);
        seedWelcome();
        return;
      }
      const data = await response.json();
      const apiMessages = data?.data?.messages;
      if (Array.isArray(apiMessages) && apiMessages.length > 0) {
        setMessages(apiMessages.map(parseApiMessage));
        if (data?.data?.conversationId) {
          setConversationId(data.data.conversationId);
        }
      } else {
        seedWelcome();
      }
    } catch (error) {
      console.error("[DeploymentChat] History fetch error:", error);
      seedWelcome();
    } finally {
      setIsLoadingHistory(false);
    }
  }, [deploymentId, authHeaders, seedWelcome]);

  // Seed the welcome bubble once the descriptor arrives, if nothing loaded yet.
  useEffect(() => {
    if (
      !isLoadingHistory &&
      historyFetchedRef.current &&
      messages.length === 0
    ) {
      seedWelcome();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployment, isLoadingHistory]);

  // ==========================================================================
  // Turn Execution
  // ==========================================================================

  const runTurn = useCallback(
    async (payload: string, tempId: string) => {
      setIsTyping(true);
      try {
        const response = await fetch(
          `${getApiUrl()}/d/${deploymentId}/chat/turn`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({
              sessionKey: sessionKeyRef.current,
              message: payload,
            }),
          }
        );
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          markMessageStatus(tempId, "failed");
          addMessage(
            `Error: ${data.error || "Could not reach the assistant. Please try again."}`,
            "system"
          );
          return;
        }

        markMessageStatus(tempId, "sent");
        if (data.data?.conversationId) {
          setConversationId(data.data.conversationId);
        }

        const replies = Array.isArray(data.data?.messages)
          ? data.data.messages
          : [];
        for (const reply of replies) {
          addMessage(reply.text || "", "bot", undefined, {
            quickReplies: reply.quickReplies,
            cards: reply.cards,
            video: reply.video,
            image: reply.image,
          });
        }
      } catch (error) {
        console.error("[DeploymentChat] Turn failed:", error);
        markMessageStatus(tempId, "failed");
        addMessage("Error: Could not reach the server. Please try again.", "system");
      } finally {
        setIsTyping(false);
      }
    },
    [deploymentId, authHeaders, addMessage, markMessageStatus]
  );

  const sendMessage = useCallback(
    (displayText: string, payload?: string) => {
      if (!displayText.trim()) return;
      const tempId = addMessage(displayText, "user", "sending");
      const message = payload || displayText;
      turnChainRef.current = turnChainRef.current.then(() =>
        runTurn(message, tempId)
      );
    },
    [addMessage, runTurn]
  );

  const restartConversation = useCallback(() => {
    // Best-effort server-side close; local key rotation guarantees the clean
    // slate even if this call fails.
    fetch(`${getApiUrl()}/d/${deploymentId}/chat/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ sessionKey: sessionKeyRef.current }),
    }).catch(() => undefined);

    const fresh = newSessionKey();
    sessionKeyRef.current = fresh;
    try {
      localStorage.setItem(`${SESSION_STORAGE_PREFIX}${deploymentId}`, fresh);
    } catch {
      /* ignore */
    }
    setConversationId(null);
    setIsTyping(false);
    setMessages([]);
    seedWelcome();
  }, [deploymentId, authHeaders, seedWelcome]);

  // ==========================================================================
  // Context Value — same contract as SocketProvider
  // ==========================================================================

  const contextValue = useMemo(
    () => ({
      isConnected: true, // HTTP transport has no persistent connection
      isLoadingHistory,
      isTyping,
      messages,
      sendMessage,
      restartConversation,
      fetchHistory,
      conversationId,
      socket: null,
    }),
    [
      isLoadingHistory,
      isTyping,
      messages,
      sendMessage,
      restartConversation,
      fetchHistory,
      conversationId,
    ]
  );

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
