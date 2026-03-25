import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import conversationApi from "./services/conversationApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Tạo hội thoại 1-1 mới
export const createConversation = createAsyncThunk(
  "conversations/create",
  async (participantId, { rejectWithValue }) => {
    try {
      const res = await conversationApi.createConversationApi(participantId);
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
      const res = await conversationApi.createGroupConversationApi(payload);
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
      const res = await conversationApi.getConversationsApi();
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
      const res = await conversationApi.getConversationByIdApi(conversationId);
      return res; // conversation
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

/**
 * Xoá hội thoại (soft delete)
 */
export const deleteConversation = createAsyncThunk(
  "conversations/delete",
  async (conversationId, { rejectWithValue }) => {
    try {
      await conversationApi.deleteConversationApi(conversationId);
      return { conversationId };
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
      const res = await conversationApi.addMemberToGroupApi({
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
      const res = await conversationApi.removeMemberFromGroupApi({
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
      await conversationApi.markAsReadApi(conversationId);
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
      const images = await conversationApi.getConversationImagesApi(
        conversationId,
        limit
      );
      return {
        conversationId,
        images,
      };
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
      await conversationApi.leaveGroupApi(conversationId);
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
      await conversationApi.transferGroupOwnershipApi(conversationId, newOwnerId);
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
      await conversationApi.deleteConversationForMeApi(conversationId);
      return { conversationId };
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
    currentConversation: null,
    typingUsers: {},
    statusUsers: {},
    images: [],
    loading: {},
    error: {},
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

      if (state.currentConversation?._id === conversationId) {
        state.currentConversation = null;
      }
    },

    // Realtime lastMessage
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;

      const idx = state.conversations.findIndex((c) => c._id === conversationId);
      if (idx === -1) return;

      state.conversations[idx].lastMessage = lastMessage;

      // move to top
      const [conv] = state.conversations.splice(idx, 1);
      state.conversations.unshift(conv);
    },

    // Realtime unread
    updateConversationUnreadCount: (state, action) => {
      const { conversationId, unreadCount, userId } = action.payload;

      const conv = state.conversations.find((c) => c._id === conversationId);
      if (!conv) return;

      const p = conv.participants.find((p) => p.user._id === userId);
      if (p) p.unreadCount = unreadCount;
    },

    // Realtime đã đọc (sync cho người khác)
    syncReadStatusRealtime: (state, action) => {
      const { conversationId, userId, lastReadMessage } = action.payload;

      const conv = state.conversations.find((c) => c._id === conversationId);
      if (!conv) return;

      conv.participants = conv.participants.map((p) =>
        p.user._id === userId ? { ...p, unreadCount: 0, lastReadMessage } : p
      );

      if (state.currentConversation?._id === conversationId) {
        state.currentConversation.participants =
          state.currentConversation.participants.map((p) =>
            p.user._id === userId ? { ...p, unreadCount: 0, lastReadMessage } : p
          );
      }
    },

    // User status
    userStatus: (state, action) => {
      const { userId, status, lastSeenAt } = action.payload;
      if (!state.statusUsers) {
        state.statusUsers = {};
      }
      state.statusUsers[userId] = { status, lastSeenAt };
    },

    // User typing
    userStartTyping: (state, action) => {
      const { conversationId, userId, username } = action.payload;
      if (!state.typingUsers) {
        state.typingUsers = {};
      }
      if (!state.typingUsers[conversationId]) {
        state.typingUsers[conversationId] = {};
      }
      state.typingUsers[conversationId][userId] = username;
    },

    // User stop typing
    userStopTyping: (state, action) => {
      const { conversationId, userId } = action.payload;
      if (state.typingUsers[conversationId]) {
        delete state.typingUsers[conversationId][userId];
        if (Object.keys(state.typingUsers[conversationId]).length === 0) {
          delete state.typingUsers[conversationId];
        }
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
        state.conversations = action.payload?.conversations || [];
        // state.pagination = action.payload?.pagination || null;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /** -----GET CONVERSATION BY ID----- */
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })

      /** -----DELETE CONVERSATION----- */
      .addCase(deleteConversation.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        state.conversations = state.conversations.filter((c) => c._id !== conversationId);

        if (state.currentConversation?._id === conversationId) {
          state.currentConversation = null;
        }
      })

      /** -----ADD MEMBER TO GROUP----- */
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        const { conversationId, conversation } = action.payload;
        const updatedConv = conversation;
        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx === -1 || !updatedConv) return;

        state.conversations[idx] = updatedConv;
        if (state.currentConversation?._id === conversationId) {
          state.currentConversation = updatedConv;
        }
      })

      /** -----REMOVE MEMBER FROM GROUP----- */
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        const { conversationId, conversation } = action.payload;
        const updatedConv = conversation;
        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx === -1 || !updatedConv) return;

        state.conversations[idx] = updatedConv;
        if (state.currentConversation?._id === conversationId) {
          state.currentConversation = updatedConv;
        }
      })

      // -------------------------------
      // MARK CONVERSATION AS READ
      // -------------------------------
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const { conversationId, userId } = action.payload;
        // Update trong danh sách conversations
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (!conv) return;
        conv.participants = conv.participants.map((p) =>
          p.user._id === userId
            ? {
                ...p,
                unreadCount: 0,
                lastReadAt: new Date().toISOString(),
                lastReadMessage: conv.lastMessage?._id || null,
              }
            : p
        );
        // Update currentConversation nếu đang mở
        if (state.currentConversation?._id === conversationId) {
          state.currentConversation.participants =
            state.currentConversation.participants.map((p) =>
              p.user._id === userId
                ? {
                    ...p,
                    unreadCount: 0,
                    lastReadAt: new Date().toISOString(),
                    lastReadMessage: state.currentConversation.lastMessage?._id || null,
                  }
                : p
            );
        }
      })

      // -------------------------------
      // GET CONVERSATION IMAGES
      // -------------------------------
      .addCase(getConversationImages.fulfilled, (state, action) => {
        state.images = action.payload.images || [];
      });
  },
});

export const {
  addConversation,
  removeConversationRealtime,
  setCurrentConversation,
  updateConversationLastMessage,
  updateConversationUnreadCount,
  syncReadStatusRealtime,
  userStatus,
  userStartTyping,
  userStopTyping,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
