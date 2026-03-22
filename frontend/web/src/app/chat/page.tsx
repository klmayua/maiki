"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  MoreVertical,
  Wrench,
  GraduationCap,
  Search,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

type ChatPurpose = "chat" | "support" | "coaching" | "matching";

interface PurposeConfig {
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  welcomeMessage: string;
}

const purposes: Record<ChatPurpose, PurposeConfig> = {
  chat: {
    label: "General Chat",
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Ask me anything about Maiki",
    color: "bg-blue-500",
    welcomeMessage: "Hi! I'm Maiki, your AI assistant. How can I help you today?",
  },
  support: {
    label: "Support Help",
    icon: <Wrench className="h-5 w-5" />,
    description: "Get help with platform issues",
    color: "bg-green-500",
    welcomeMessage: "I'm here to help with any platform issues. What's going on?",
  },
  coaching: {
    label: "Career Coaching",
    icon: <GraduationCap className="h-5 w-5" />,
    description: "Get personalized career advice",
    color: "bg-purple-500",
    welcomeMessage: "Ready to level up your VA career? What would you like to work on?",
  },
  matching: {
    label: "Job Matching",
    icon: <Search className="h-5 w-5" />,
    description: "Find the perfect opportunities",
    color: "bg-orange-500",
    welcomeMessage: "Let's find you the perfect job match. What type of work are you looking for?",
  },
};

const quickActions = [
  { label: "How do I apply for jobs?", purpose: "chat" as ChatPurpose },
  { label: "Review my profile", purpose: "coaching" as ChatPurpose },
  { label: "Find jobs matching my skills", purpose: "matching" as ChatPurpose },
  { label: "Help with billing", purpose: "support" as ChatPurpose },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [purpose, setPurpose] = useState<ChatPurpose>("chat");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: purposes[purpose].welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [purpose]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const messageText = overrideInput || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideInput) setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      },
    ]);

    try {
      const response = await fetch("/api/v1/chatbot/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: new URLSearchParams({
          message: messageText,
          purpose: purpose,
          ...(conversationId && { conversation_id: conversationId }),
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      let fullResponse = "";
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "start" && data.conversation_id) {
                setConversationId(data.conversation_id);
              } else if (data.type === "chunk" && data.content) {
                fullResponse += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: fullResponse, isStreaming: true }
                      : msg
                  )
                );
              } else if (data.type === "end") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId
                      ? { ...msg, content: data.full_response || fullResponse, isStreaming: false }
                      : msg
                  )
                );
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "I apologize, but I'm having trouble connecting. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: purposes[purpose].welcomeMessage,
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg text-white", purposes[purpose].color)}>
                {purposes[purpose].icon}
              </div>
              <div>
                <h1 className="text-xl font-bold">{purposes[purpose].label}</h1>
                <p className="text-sm text-muted-foreground">
                  {purposes[purpose].description}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={clearChat}>
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPurpose("chat")}>
                  💬 General Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPurpose("support")}>
                  🎧 Support Help
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPurpose("coaching")}>
                  🎯 Career Coaching
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPurpose("matching")}>
                  🔍 Job Matching
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Purpose Selection */}
        <div className="hidden md:flex w-80 border-r bg-muted/30 flex-col">
          <div className="p-4 space-y-3">
            <h3 className="font-semibold px-2">Chat Mode</h3>
            {(Object.keys(purposes) as ChatPurpose[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPurpose(p);
                  clearChat();
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                  purpose === p
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-lg text-white",
                    purposes[p].color,
                    purpose === p && "ring-2 ring-white/50"
                  )}
                >
                  {purposes[p].icon}
                </div>
                <div>
                  <div className="font-medium">{purposes[p].label}</div>
                  <div
                    className={cn(
                      "text-xs",
                      purpose === p
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {purposes[p].description}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t">
            <h3 className="font-semibold px-2 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    setPurpose(action.purpose);
                    handleSend(action.label);
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {message.role === "assistant" ? (
                      <>
                        <AvatarImage src="/maiki-avatar.png" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src={undefined} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-6 py-4",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-2",
                        message.role === "user"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      )}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card p-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="flex-1 h-12"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Powered by Ollama Cloud • AI responses may not be perfect
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
