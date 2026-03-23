"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  type: string;
  content: string;
  file_url?: string;
  file_name?: string;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  sender?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface Conversation {
  id: number;
  type: string;
  title?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  participants: Array<{
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    role: string;
  }>;
  unread_count: number;
  last_message?: Message;
}

interface UseWebSocketReturn {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (data: any) => void;
}

export function useWebSocket(token: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/v1'
    const ws = new WebSocket(`${WS_URL}/messages/ws/${token}`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
  };
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/messages/conversations");
      setConversations(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const createConversation = async (data: {
    participant_ids: number[];
    type?: string;
    job_id?: number;
    application_id?: number;
    title?: string;
  }) => {
    const response = await api.post("/messages/conversations", data);
    setConversations((prev) => [response.data, ...prev]);
    return response.data;
  };

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
  };
}

export function useMessages(conversationId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(
    async (beforeId?: number) => {
      if (!conversationId) return;

      try {
        setLoading(true);
        const params = beforeId ? { before_id: beforeId } : {};
        const response = await api.get(
          `/messages/conversations/${conversationId}/messages`,
          { params }
        );

        if (beforeId) {
          setMessages((prev) => [...response.data, ...prev]);
        } else {
          setMessages(response.data);
        }

        setHasMore(response.data.length === 50);
        setError(null);
      } catch (err) {
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const sendMessage = useCallback(
    async (content: string, type = "text") => {
      if (!conversationId) return;

      const response = await api.post(
        `/messages/conversations/${conversationId}/messages`,
        { content, type }
      );

      setMessages((prev) => [response.data, ...prev]);
      return response.data;
    },
    [conversationId]
  );

  const editMessage = useCallback(async (messageId: number, content: string) => {
    const response = await api.put(`/messages/${messageId}`, { content });
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? response.data : msg))
    );
    return response.data;
  }, []);

  const deleteMessage = useCallback(async (messageId: number) => {
    await api.delete(`/messages/${messageId}`);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, is_deleted: true, content: "[Message deleted]" }
          : msg
      )
    );
  }, []);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  return {
    messages,
    loading,
    error,
    hasMore,
    fetchMore: () => {
      const oldestMessage = messages[messages.length - 1];
      if (oldestMessage) {
        fetchMessages(oldestMessage.id);
      }
    },
    sendMessage,
    editMessage,
    deleteMessage,
  };
}
