"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage() {
  const conversations = useQuery(api.chat.queries.listConversations);
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  
  const messages = useQuery(
    api.chat.queries.listMessages,
    selectedConversation ? { conversationId: selectedConversation as Id<"chatConversations"> } : "skip"
  );
  
  const sendMessage = useMutation(api.chat.mutations.sendMessage);
  const markAsRead = useMutation(api.chat.mutations.markAsRead);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversation) {
      markAsRead({ conversationId: selectedConversation as Id<"chatConversations"> });
    }
  }, [selectedConversation, markAsRead]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      await sendMessage({
        conversationId: selectedConversation as Id<"chatConversations">,
        content: messageText,
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  if (conversations === undefined || currentUser === undefined) {
    return (
      <div className="h-[calc(100vh-8rem)] flex gap-4">
        <Skeleton className="w-80 h-full" />
        <Skeleton className="flex-1 h-full" />
      </div>
    );
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.otherParticipant?.firstName.toLowerCase().includes(search.toLowerCase()) ||
    conv.otherParticipant?.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <Card className="w-80 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv._id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedConversation === conv._id
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {conv.otherParticipant?.firstName[0]}
                          {conv.otherParticipant?.lastName[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {conv.otherParticipant?.firstName} {conv.otherParticipant?.lastName}
                        </p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground truncate">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="danger" className="flex-shrink-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-muted-foreground">
                      {format(conv.lastMessageAt, "MMM d, h:mm a")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation && messages ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                {conversations
                  .find((c) => c._id === selectedConversation)
                  ?.otherParticipant && (
                  <>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {
                          conversations.find((c) => c._id === selectedConversation)
                            ?.otherParticipant?.firstName[0]
                        }
                        {
                          conversations.find((c) => c._id === selectedConversation)
                            ?.otherParticipant?.lastName[0]
                        }
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {
                          conversations.find((c) => c._id === selectedConversation)
                            ?.otherParticipant?.firstName
                        }{" "}
                        {
                          conversations.find((c) => c._id === selectedConversation)
                            ?.otherParticipant?.lastName
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwnMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {format(message.createdAt, "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}