"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import Link from "next/link";

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = useQuery(api.chat.queries.getUnreadCount);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg relative"
            size="sm"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount !== undefined && unreadCount > 0 && (
              <Badge
                variant="danger"
                className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 rounded-full"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card rounded-xl shadow-2xl border border-border z-50 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">Messages</h3>
              {unreadCount !== undefined && unreadCount > 0 && (
                <Badge variant="danger">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Link href="/chat">
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content - Redirect to full chat */}
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h4 className="font-medium mb-2">Open Full Chat</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Click below to access the full messaging experience
              </p>
              <Link href="/chat">
                <Button onClick={() => setIsOpen(false)} className="w-full">
                  Open Messages
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}