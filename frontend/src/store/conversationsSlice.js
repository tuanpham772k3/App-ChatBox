import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import conversationApi from "@/services/conversationApi";
import { emitEvent } from "@/lib/socket";

/* =============================
 *  Thunk actions
 * ============================= */

// Tạo hội thoại 1-1 mới
export const createConversation = createAsyncThunk(
  "conversations/create",
  async (participantId, { rejectWithValue }) => {
    try {
      const res = await conversationApi.createConversation(participantId);
      if (res?.isNew && res?.conversation?._id) {
        emitEvent("conversation_created", { conversationId: res.conversation._id });
      }
      return res; // backend trả về: { conversation, isNew }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Tạo nhóm chat
export const createGroupConversation = createAsyncThunk(
  "conversations/createGroup",
  /**
   * payload: { name: string, memberIds: string[] }
   */
  async (payload, { rejectWithValue }) => {
    try {
      const res = await conversationApi.createGroupConversation(payload);
      if (res?.isNew && res?.conversation?._id) {
        emitEvent("conversation_created", { conversationId: res.conversation._id });
      }
      return res; // backend trả về: { conversation, isNew }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Lấy danh sách hội thoại
export const getConversations = createAsyncThunk(
  "conversations/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await conversationApi.getConversations();
      return res; // { conversations, pagination }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Lấy chi tiết 1 hội thoại theo ID
 */
export const getConversationById = createAsyncThunk(
  "conversations/getById",
  async (conversationId, { rejectWithValue }) => {
    try {
      const conversation = await conversationApi.getConversationById(conversationId);
      return conversation;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Thêm 1 thành viên mới vào nhóm chat
 */
export const addMemberToGroup = createAsyncThunk(
  "conversations/addMemberToGroup",
  /**
   * payload: { conversationId, userId }
   */
  async ({ conversationId, memberIds }, { rejectWithValue }) => {
    try {
      const res = await conversationApi.addMemberToGroup({
        conversationId,
        memberIds,
      });
      return res; // { conversation, conversationId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Xoá 1 thành viên khỏi nhóm chat
 */
export const removeMemberFromGroup = createAsyncThunk(
  "conversations/removeMemberFromGroup",
  /**
   * payload: { conversationId, userId }
   */
  async ({ conversationId, memberId }, { rejectWithValue }) => {
    try {
      const res = await conversationApi.removeMemberFromGroup({
        conversationId,
        memberId,
      });
      return res; // { conversationId, conversation };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Đánh dấu đã đọc
export const markConversationAsRead = createAsyncThunk(
  "conversation/markAsRead",
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      await conversationApi.markAsRead(conversationId);
      emitEvent("conversation_mark_read", { conversationId });
      return { conversationId, userId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Lấy danh sách Ảnh
export const getConversationImages = createAsyncThunk(
  "conversations/getImages",
  async ({ conversationId, limit = 8 }, { rejectWithValue }) => {
    try {
      const images = await conversationApi.getConversationImages(conversationId, limit);
      return images;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Rời nhóm chat
export const leaveGroup = createAsyncThunk(
  "conversations/leaveGroup",
  async (conversationId, { rejectWithValue }) => {
    try {
      await conversationApi.leaveGroup(conversationId);
      return { conversationId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Nhượng quyền owner cho thành viên khác (chỉ dành cho owner)
export const transferGroupOwnership = createAsyncThunk(
  "conversations/transferGroupOwnership",
  async ({ conversationId, newOwnerId }, { rejectWithValue }) => {
    try {
      await conversationApi.transferGroupOwnership(conversationId, newOwnerId);
      return { conversationId, newOwnerId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Nhượng quyền owner cho thành viên khác (chỉ dành cho owner)
export const deleteConversationForMe = createAsyncThunk(
  "conversations/deleteForMe",
  async (conversationId, { rejectWithValue }) => {
    try {
      await conversationApi.deleteConversationForMe(conversationId);
      return { conversationId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const togglePinConversation = createAsyncThunk(
  "conversations/togglePin",
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      const res = await conversationApi.togglePinConversation(conversationId);
      return { ...res, userId }; // { conversationId, pinnedAt, userId }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const markConversationAsUnread = createAsyncThunk(
  "conversations/markUnread",
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      const res = await conversationApi.markAsUnread(conversationId);
      return { ...res, userId }; // { conversationId, unreadCount, userId }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const clearConversationHistory = createAsyncThunk(
  "conversations/clearHistory",
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      await conversationApi.clearConversationHistory(conversationId);
      return { conversationId, userId };
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/* =============================
 *  Slice setup
 * ============================= */
const conversationsSlice = createSlice({
  name: "conversations",
  initialState: {
    conversations: [],
    typingUsers: {},
    statusUsers: {},
    images: [],
    loading: null,
    error: null,
  },

  reducers: {
    // Thêm hội thoại realtime
    addConversation: (state, action) => {
      const newConv = action.payload;
      const exists = state.conversations.some((c) => c._id === newConv._id);
      if (!exists) {
        state.conversations.unshift(newConv);
      }
    },

    // Xoá hội thoại realtime
    removeConversationRealtime: (state, action) => {
      const conversationId = action.payload;
      state.conversations = state.conversations.filter((c) => c._id !== conversationId);
    },

    // Realtime lastMessage
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;

      const idx = state.conversations.findIndex((c) => c._id === conversationId);
      if (idx === -1) return;

      const conv = state.conversations[idx];
      conv.lastMessage = lastMessage;

      // move to top
      state.conversations.splice(idx, 1);
      state.conversations.unshift(conv);
    },

    // Realtime unread
    updateConversationUnreadCount: (state, action) => {
      const { conversationId, unreadCount, userId } = action.payload;

      const conv = state.conversations.find((c) => c._id === conversationId);
      if (!conv) return;

      const participants = conv.participants.find((p) => p.userId?._id === userId);
      if (participants) participants.unreadCount = unreadCount;
    },

    // Realtime đã đọc (sync cho người khác)
    syncReadStatusRealtime: (state, action) => {
      const { conversationId, userId, lastReadMessageId } = action.payload;

      const conv = state.conversations.find((c) => c._id === conversationId);
      if (!conv) return;

      conv.participants = conv.participants.map((p) =>
        p.userId?._id === userId ? { ...p, unreadCount: 0, lastReadMessageId } : p
      );
    },

    // User status
    userStatus: (state, action) => {
      const { userId, presence, lastSeenAt } = action.payload;

      state.statusUsers[userId] = {
        presence,
        lastSeenAt,
      };
    },

    // User typing
    userStartTyping: (state, action) => {
      const { conversationId, userId } = action.payload;

      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }

      state.typingUsers[conversationId][userId] = true;
    },

    // User stop typing
    userStopTyping: (state, action) => {
      const { conversationId, userId } = action.payload;

      const users = state.typingUsers[conversationId];
      if (!users) return;

      delete users[userId];

      if (Object.keys(users).length === 0) {
        delete state.typingUsers[conversationId];
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createConversation.fulfilled, (state, action) => {
        const newConv = action.payload.conversation;
        const exists = state.conversations.some((c) => c._id === newConv._id);
        if (!exists) state.conversations.unshift(newConv);
      })

      /** -----CREATE GROUP CONVERSATION----- */
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        const newGroup = action.payload.conversation;
        if (!newGroup) return;

        const exists = state.conversations.some((c) => c._id === newGroup._id);
        if (!exists) {
          // Đưa nhóm mới lên đầu danh sách
          state.conversations.unshift(newGroup);
        }
      })

      /** -----GET ALL CONVERSATIONS----- */
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations || [];
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /** -----ADD MEMBER TO GROUP----- */
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        const { conversationId, conversation } = action.payload;

        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx === -1 || !conversation) return;

        state.conversations[idx] = conversation;
      })

      /** -----REMOVE MEMBER FROM GROUP----- */
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        const { conversationId, conversation } = action.payload;

        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx === -1 || !conversation) return;

        state.conversations[idx] = conversation;
      })

      // -------------------------------
      // MARK CONVERSATION AS READ
      // -------------------------------
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId, userId } = action.payload;

        const conv = state.conversations.find((c) => c._id === conversationId);
        if (!conv) return;

        conv.participants = conv.participants.map((p) =>
          p.userId?._id === userId
            ? {
                ...p,
                unreadCount: 0,
                lastReadAt: new Date().toISOString(),
                lastReadMessageId: conv.lastMessage?.messageId || null,
              }
            : p
        );
      })

      // -------------------------------
      // GET CONVERSATION IMAGES
      // -------------------------------
      .addCase(getConversationImages.fulfilled, (state, action) => {
        state.images = action.payload || [];
      })

      // -------------------------------
      // DELETE CONVERSATION FOR ME
      // -------------------------------
      .addCase(deleteConversationForMe.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        state.conversations = state.conversations.filter((c) => c._id !== conversationId);
      })

      // -------------------------------
      // Toggle Pin Conversation
      // -------------------------------
      .addCase(togglePinConversation.fulfilled, (state, action) => {
        const { conversationId, pinnedAt, userId } = action.payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (!conv) return;

        conv.participants = conv.participants.map((p) =>
          p.userId?._id === userId ? { ...p, pinnedAt } : p
        );
      })

      // -------------------------------
      // Mark Conversation As Unread
      // -------------------------------
      .addCase(markConversationAsUnread.fulfilled, (state, action) => {
        const { conversationId, unreadCount, userId } = action.payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (!conv) return;

        conv.participants = conv.participants.map((p) =>
          p.userId?._id === userId
            ? { ...p, unreadCount, lastReadAt: null, lastReadMessageId: null }
            : p
        );
      })

      // -------------------------------
      // Clear Conversation History
      // -------------------------------
      .addCase(clearConversationHistory.fulfilled, (state, action) => {
        const { conversationId, userId } = action.payload;
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) {
          conv.participants = conv.participants.map((p) =>
            p.userId?._id === userId
              ? {
                  ...p,
                  unreadCount: 0,
                  lastReadAt: null,
                  lastReadMessageId: null,
                  clearedMessagesHistoryAt: new Date().toISOString(),
                }
              : p
          );
        }
      });
  },
});

export const {
  addConversation,
  removeConversationRealtime,
  updateConversationLastMessage,
  updateConversationUnreadCount,
  syncReadStatusRealtime,
  userStatus,
  userStartTyping,
  userStopTyping,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
