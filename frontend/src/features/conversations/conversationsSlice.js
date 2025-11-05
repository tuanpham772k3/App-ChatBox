import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import conversationsApi from "./services/conversationsApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Tạo hội thoại 1-1 mới
export const createConversation = createAsyncThunk(
  "conversations/create",
  async (participantId, { rejectWithValue }) => {
    try {
      const res = await conversationsApi.createConversationApi(participantId);
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

// Lấy danh sách hội thoại của user hiện tại
export const getConversations = createAsyncThunk(
  "conversations/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await conversationsApi.getConversationsApi();
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
      const res = await conversationsApi.getConversationByIdApi(conversationId);
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
      const res = await conversationsApi.deleteConversationApi(conversationId);
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

/* =============================
 *  Slice setup
 * ============================= */
const conversationsSlice = createSlice({
  name: "conversations",
  initialState: {
    conversations: [],
    currentConversation: null,
    draftConversation: null,
    loading: false,
    error: null,
  },

  reducers: {
    // Có thể dùng cho socket realtime
    addConversation: (state, action) => {
      state.conversations.unshift(action.payload);
    },

    // === DRAFT conversation (local only) ===
    setDraftConversation: (state, action) => {
      state.draftConversation = action.payload; // { user: {...} }
      state.currentConversation = null;
    },
    clearDraftConversation: (state) => {
      state.draftConversation = null;
    },
    promoteDraftToReal: (state, action) => {
      // Khi gửi tin đầu tiên -> nhận về conversation thật
      state.draftConversation = null;
      state.currentConversation = action.payload; // {conversation}
      state.conversations.unshift(action.payload);
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
      });
  },
});

export const {
  addConversation,
  setDraftConversation,
  clearDraftConversation,
  promoteDraftToReal,
} = conversationsSlice.actions;
export default conversationsSlice.reducer;
