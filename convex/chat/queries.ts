import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";
import { normalizePaginationLimit } from "../helpers/utils";

// ============================================================================
// LIST CONVERSATIONS
// ============================================================================

export const listConversations = query({
  handler: async (ctx) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    const conversations = await ctx.db
      .query("chatConversations")
      .withIndex("by_org_last_message", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .collect();

    // Filter conversations where user is participant
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(userId)
    );

    // Get details for each conversation
    const conversationsWithDetails = await Promise.all(
      userConversations.map(async (conversation) => {
        // Get other participant
        const otherParticipantId = conversation.participants.find((p) => p !== userId);
        const otherParticipant = otherParticipantId
          ? await ctx.db.get(otherParticipantId)
          : null;

        // Get last message
        const lastMessage = await ctx.db
          .query("chatMessages")
          .withIndex("by_conversation_created", (q) =>
            q.eq("conversationId", conversation._id)
          )
          .order("desc")
          .first();

        // Count unread messages
        const messages = await ctx.db
          .query("chatMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
          .collect();

        const unreadCount = messages.filter(
          (msg) => msg.senderId !== userId && !msg.readBy.includes(userId)
        ).length;

        return {
          _id: conversation._id,
          otherParticipant: otherParticipant
            ? {
                _id: otherParticipant._id,
                firstName: otherParticipant.firstName,
                lastName: otherParticipant.lastName,
                image: otherParticipant.image,
              }
            : null,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          lastMessageAt: conversation.lastMessageAt,
        };
      })
    );

    return conversationsWithDetails;
  },
});

// ============================================================================
// GET CONVERSATION DETAILS
// ============================================================================

export const getConversation = query({
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

    // Get other participant
    const otherParticipantId = conversation.participants.find((p) => p !== userId);
    const otherParticipant = otherParticipantId
      ? await ctx.db.get(otherParticipantId)
      : null;

    return {
      _id: conversation._id,
      otherParticipant: otherParticipant
        ? {
            _id: otherParticipant._id,
            firstName: otherParticipant.firstName,
            lastName: otherParticipant.lastName,
            image: otherParticipant.image,
          }
        : null,
      createdAt: conversation.createdAt,
    };
  },
});

// ============================================================================
// LIST MESSAGES IN CONVERSATION
// ============================================================================

export const listMessages = query({
  args: {
    conversationId: v.id("chatConversations"),
    limit: v.optional(v.number()),
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

    const limit = normalizePaginationLimit(args.limit);

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_conversation_created", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    // Get sender details for each message
    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);

        return {
          _id: message._id,
          content: message.content,
          sender: sender
            ? {
                _id: sender._id,
                firstName: sender.firstName,
                lastName: sender.lastName,
                image: sender.image,
              }
            : null,
          isOwnMessage: message.senderId === userId,
          isRead: message.readBy.includes(userId),
          createdAt: message.createdAt,
        };
      })
    );

    // Reverse to show oldest first
    return messagesWithDetails.reverse();
  },
});

// ============================================================================
// GET UNREAD COUNT
// ============================================================================

export const getUnreadCount = query({
  handler: async (ctx) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    const conversations = await ctx.db
      .query("chatConversations")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    // Filter conversations where user is participant
    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(userId)
    );

    let totalUnread = 0;

    for (const conversation of userConversations) {
      const messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conversation._id))
        .collect();

      const unreadInConversation = messages.filter(
        (msg) => msg.senderId !== userId && !msg.readBy.includes(userId)
      ).length;

      totalUnread += unreadInConversation;
    }

    return totalUnread;
  },
});

// ============================================================================
// CHECK IF CAN CHAT WITH USER
// ============================================================================

export const canChatWithUser = query({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId } = await getCurrentUserContext(ctx);

    if (userId === args.targetUserId) {
      return false;
    }

    const { canChatWith } = await import("../helpers/auth");
    return await canChatWith(ctx, userId, args.targetUserId, organizationId);
  },
});