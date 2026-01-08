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
    loading: false,
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

      if (state.currentConversation?._id === conversationId) {
        state.currentConversation = null;
      }
    },

    // Realtime unreadCount + lastMessage
    updateConversationMetadata: (state, action) => {
      const { conversationId, lastMessage, unreadCount, userId } = action.payload;

      const idx = state.conversations.findIndex((c) => c._id === conversationId);
      if (idx === -1) return;

      state.conversations[idx].lastMessage = lastMessage;

      const p = state.conversations[idx].participants.find((p) => p.user._id === userId);
      if (p) p.unreadCount = unreadCount;

      // move to top
      const [conv] = state.conversations.splice(idx, 1);
      state.conversations.unshift(conv);
    },

    // ✅ Realtime đã đọc (sync cho người khác)
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
      /** -----CREATE CONVERSATION----- */
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newConv = action.payload.conversation;
        const exists = state.conversations.some((c) => c._id === newConv._id);
        if (!exists) state.conversations.unshift(newConv);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /** -----CREATE GROUP CONVERSATION----- */
      .addCase(createGroupConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newGroup = action.payload.conversation;
        if (!newGroup) return;

        const exists = state.conversations.some((c) => c._id === newGroup._id);
        if (!exists) {
          // Đưa nhóm mới lên đầu danh sách
          state.conversations.unshift(newGroup);
        }
      })
      .addCase(createGroupConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      .addCase(getConversationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getConversationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
      })
      .addCase(getConversationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
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
      });
  },
});

export const {
  addConversation,
  removeConversationRealtime,
  setCurrentConversation,
  updateConversationMetadata,
  syncReadStatusRealtime,
  userStatus,
  userStartTyping,
  userStopTyping,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
