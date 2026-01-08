import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, canChatWith } from "../helpers/auth";

// ============================================================================
// START CONVERSATION
// ============================================================================

export const startConversation = mutation({
  args: {
    participantId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    if (userId === args.participantId) {
      throw new ConvexError("Cannot start conversation with yourself");
    }

    // Check if user can chat with target
    const canChat = await canChatWith(ctx, userId, args.participantId, organizationId);

    if (!canChat) {
      throw new ConvexError("You cannot chat with this user");
    }

    // Check if conversation already exists
    const existingConversations = await ctx.db
      .query("chatConversations")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    const existingConversation = existingConversations.find((conv) => {
      const sortedParticipants = [...conv.participants].sort();
      const targetParticipants = [userId, args.participantId].sort();
      return (
        sortedParticipants.length === 2 &&
        sortedParticipants[0] === targetParticipants[0] &&
        sortedParticipants[1] === targetParticipants[1]
      );
    });

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("chatConversations", {
      organizationId,
      participants: [userId, args.participantId],
      lastMessageAt: now,
      createdAt: now,
    });

    return conversationId;
  },
});

// ============================================================================
// SEND MESSAGE
// ============================================================================

export const sendMessage = mutation({
  args: {
    conversationId: v.id("chatConversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.organizationId !== organizationId) {
      throw new ConvexError("Conversation belongs to different organization");
    }

    // Check if user is participant
    if (!conversation.participants.includes(userId)) {
      throw new ConvexError("You are not a participant in this conversation");
    }

    if (!args.content.trim()) {
      throw new ConvexError("Message content cannot be empty");
    }

    const now = Date.now();

    // Create message
    const messageId = await ctx.db.insert("chatMessages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      readBy: [userId], // Sender has read their own message
      createdAt: now,
    });

    // Update conversation last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: now,
    });

    return messageId;
  },
});

// ============================================================================
// MARK MESSAGES AS READ
// ============================================================================

export const markAsRead = mutation({
  args: {
    conversationId: v.id("chatConversations"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError("Conversation not found");
    }

    if (conversation.organizationId !== organizationId) {
      throw new ConvexError("Conversation belongs to different organization");
    }

    if (!conversation.participants.includes(userId)) {
      throw new ConvexError("You are not a participant in this conversation");
    }

    // Get all unread messages in this conversation
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();

    const unreadMessages = messages.filter((msg) => !msg.readBy.includes(userId));

    // Mark all as read
    for (const message of unreadMessages) {
      await ctx.db.patch(message._id, {
        readBy: [...message.readBy, userId],
      });
    }

    return unreadMessages.length;
  },
});