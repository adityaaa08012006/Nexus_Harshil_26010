import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { MessageCircle, Send, X, User } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  allocation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    name: string;
    email: string;
    role: string;
  } | null;
}

interface MessageThreadProps {
  allocationId: string;
  allocationRequestId: string; // human-readable AR-xxx
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const MessageThread: React.FC<MessageThreadProps> = ({
  allocationId,
  allocationRequestId,
  isOpen,
  onClose,
}) => {
  const { session, user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const headers = useCallback(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) {
      h["Authorization"] = `Bearer ${session.access_token}`;
    }
    return h;
  }, [session]);

  // ── Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${allocationId}`,
        { headers: headers() },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data: Message[] = await res.json();
      setMessages(data);

      // Mark messages as read
      await fetch(
        `http://localhost:5000/api/messages/${allocationId}/read`,
        { method: "PUT", headers: headers() },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [allocationId, headers]);

  // ── Subscribe to realtime ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    fetchMessages();

    const channel = supabase
      .channel(`messages-${allocationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `allocation_id=eq.${allocationId}`,
        },
        () => {
          fetchMessages();
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isOpen, allocationId, fetchMessages]);

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/messages/${allocationId}`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ content: newMessage.trim() }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to send");
      }
      const sent: Message = await res.json();
      setMessages((prev) => [...prev, sent]);
      setNewMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const roleColor = (role?: string) => {
    switch (role) {
      case "manager":
        return "#1E40AF";
      case "owner":
        return "#7C3AED";
      case "qc_rep":
        return "#48A111";
      default:
        return "#6B7280";
    }
  };

  const roleLabel = (role?: string) => {
    switch (role) {
      case "manager":
        return "Manager";
      case "owner":
        return "Owner";
      case "qc_rep":
        return "QC Rep";
      default:
        return "User";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: "80vh" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b rounded-t-xl"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#48A111" }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Messages</h3>
              <p className="text-xs text-gray-500">
                Order{" "}
                <span className="font-mono">{allocationRequestId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Messages body */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
          style={{ minHeight: "200px" }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div
                className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#48A111", borderTopColor: "transparent" }}
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Start a conversation about this order
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] ${
                      isMe ? "order-2" : "order-1"
                    }`}
                  >
                    {/* Sender info */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: roleColor(msg.sender?.role) }}
                        >
                          <User className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {msg.sender?.name ?? "Unknown"}
                        </span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${roleColor(msg.sender?.role)}15`,
                            color: roleColor(msg.sender?.role),
                          }}
                        >
                          {roleLabel(msg.sender?.role)}
                        </span>
                      </div>
                    )}
                    {/* Bubble */}
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "rounded-br-md text-white"
                          : "rounded-bl-md text-gray-800 bg-gray-100"
                      }`}
                      style={isMe ? { backgroundColor: "#48A111" } : undefined}
                    >
                      {msg.content}
                    </div>
                    <p
                      className={`text-[10px] text-gray-400 mt-1 ${
                        isMe ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {new Date(msg.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          {error && (
            <div className="rounded-lg p-2 text-xs bg-red-50 text-red-600 border border-red-200 text-center">
              {error}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3">
          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              style={{ maxHeight: "80px" }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#48A111" }}
            >
              {isSending ? (
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: "#fff", borderTopColor: "transparent" }}
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Message Button (for use in tables) ─────────────────────────────────────

interface MessageButtonProps {
  allocationId: string;
  allocationRequestId: string;
  variant?: "icon" | "button";
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  allocationId,
  allocationRequestId,
  variant = "button",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "icon") {
    return (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          title="Messages"
        >
          <MessageCircle className="w-4 h-4" style={{ color: "#48A111" }} />
        </button>
        <MessageThread
          allocationId={allocationId}
          allocationRequestId={allocationRequestId}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="px-3 py-1 text-xs font-medium rounded-md transition-colors border hover:bg-green-50 flex items-center gap-1.5"
        style={{ borderColor: "#48A111", color: "#48A111" }}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Message
      </button>
      <MessageThread
        allocationId={allocationId}
        allocationRequestId={allocationRequestId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
