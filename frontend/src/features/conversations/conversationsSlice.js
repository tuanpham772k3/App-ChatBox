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
      return res.data; // backend trả về { conversation, isNew }
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
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
      // Giả sử backend trả về { conversation }
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Không thể tạo nhóm chat",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

// Lấy danh sách hội thoại của user hiện tại
export const getConversations = createAsyncThunk(
  "conversations/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await conversationApi.getConversationsApi();
      return res.data; // backend trả về danh sách conversations
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
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
      return res.data;
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
      });
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
      const res = await conversationApi.deleteConversationApi(conversationId);
      return { conversationId };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Không thể xoá hội thoại",
        idCode: data?.idCode || -1,
      });
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
      return { conversationId, ...res.data };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Không thể thêm thành viên vào nhóm",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
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
  async ({ conversationId, userId }, { rejectWithValue }) => {
    try {
      const res = await conversationApi.removeMemberFromGroupApi({
        conversationId,
        userId,
      });
      return { conversationId, userId, ...res.data };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Không thể xoá thành viên khỏi nhóm",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

// Đánh dấu đã đọc
export const markConversationAsRead = createAsyncThunk(
  "conversation/markAsRead",
  async ({conversationId, userId}, { rejectWithValue }) => {
    try {
      const res = await conversationApi.markAsReadApi(conversationId);
      return { conversationId, ...res.data };
    } catch (err) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
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
    // Có thể dùng cho socket realtime
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },

    // Cập nhật lastMessage và đưa hội thoại lên đầu khi có tin nhắn mới
    updateConversationLastMessage: (state, action) => {
      const { conversationId, message } = action.payload || {};
      if (!conversationId || !message) return;

      const idx = state.conversations.findIndex((c) => c._id === conversationId);
      if (idx === -1) return;

      state.conversations[idx].lastMessage = message;

      // Đưa hội thoại lên đầu danh sách giống các app chat
      const [conv] = state.conversations.splice(idx, 1);
      state.conversations.unshift(conv);
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
        const exists = state.conversations.find((c) => c._id === newConv._id);
        if (!exists) state.conversations.unshift(newConv);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /** -----CREATE GROUP CONVERSATION----- */
      .addCase(createGroupConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newGroup = action.payload.conversation || action.payload;
        if (!newGroup) return;

        const exists = state.conversations.find((c) => c._id === newGroup._id);
        if (!exists) {
          // Đưa nhóm mới lên đầu danh sách
          state.conversations.unshift(newGroup);
        }
      })
      .addCase(createGroupConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })

      /** -----GET ALL CONVERSATIONS----- */
      .addCase(getConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload?.conversations || [];
        // nếu muốn lưu thông tin phân trang
        // state.pagination = action.payload?.pagination || null;
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
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
        state.error = action.payload?.message;
      })

      /** -----DELETE CONVERSATION----- */
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(
          (conv) => conv._id !== action.payload.conversationId
        );
      })

      /** -----ADD MEMBER TO GROUP----- */
      .addCase(addMemberToGroup.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const updatedConv = action.payload.conversation;
        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx === -1 || !updatedConv) return;

        state.conversations[idx] = updatedConv;
        if (state.currentConversation?._id === conversationId) {
          state.currentConversation = updatedConv;
        }
      })

      /** -----REMOVE MEMBER FROM GROUP----- */
      .addCase(removeMemberFromGroup.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const updatedConv = action.payload.conversation;
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
        const { conversationId } = action.payload || {};
        const { userId } = action.meta.arg || {}; // ✅ LẤY TỪ META

        if (!conversationId || !userId) return;

        // 1️⃣ Update trong danh sách conversations
        const idx = state.conversations.findIndex((c) => c._id === conversationId);
        if (idx !== -1) {
          const conv = state.conversations[idx];

          conv.participants = conv.participants.map((p) => {
            const pid = typeof p.user === "object" ? p.user._id : p.user;

            if (pid === userId) {
              return {
                ...p,
                unreadCount: 0,
                lastReadAt: new Date().toISOString(),
                lastReadMessage: conv.lastMessage?._id || null,
              };
            }
            return p;
          });
        }

        // 2️⃣ Update currentConversation nếu đang mở
        if (state.currentConversation?._id === conversationId) {
          state.currentConversation.participants =
            state.currentConversation.participants.map((p) => {
              const pid = typeof p.user === "object" ? p.user._id : p.user;

              if (pid === userId) {
                return {
                  ...p,
                  unreadCount: 0,
                  lastReadAt: new Date().toISOString(),
                  lastReadMessage: state.currentConversation.lastMessage?._id || null,
                };
              }
              return p;
            });
        }
      });
  },
});

export const {
  addConversation,
  updateConversationLastMessage,
  userStatus,
  userStartTyping,
  userStopTyping,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
