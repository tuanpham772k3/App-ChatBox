import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import messagesApi from "./services/messagesApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Tạo tin nhắn mới
export const createNewMessage = createAsyncThunk(
  "messages/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await messagesApi.createNewMessageApi(payload);
      return res.data;
    } catch (error) {
      const data = err.response?.data;
      return rejectWithValue({
        message: data?.message || "Lỗi không xác định",
        idCode: data?.idCode || -1,
        status: err.response?.status,
      });
    }
  }
);

// Lấy danh sách tin nhắn theo conversation
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchByConversation",
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const res = await messagesApi.getConversationMessagesApi(conversationId);
      return res.data; // { messages, pagination }
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

// Xóa tin nhắn (xóa mềm)
export const deleteMessageById = createAsyncThunk(
  "messages/delete",
  async (messageId, { rejectWithValue }) => {
    try {
      const res = await messagesApi.deleteMessageByIdApi(messageId);
      return { messageId, ...res.data };
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

// Chỉnh sửa tin nhắn
export const editMessageById = createAsyncThunk(
  "messages/edit",
  async ({ messageId, newContent }, { rejectWithValue }) => {
    try {
      const res = await messagesApi.editMessageByIdApi(messageId, newContent);
      return res.data;
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
const messagesSlice = createSlice({
  name: "messages",
  initialState: {
    messages: [],
    pagination: null,
    loading: false,
    sending: false,
    error: null,
  },

  reducers: {
    // Thêm tin nhắn đến từ socket
    addIncomingMessage: (state, action) => {
      const newMsg = action.payload;
      const exists = state.messages.some((m) => m._id === newMsg._id);
      if (!exists) state.messages.push(newMsg);
    },

    // Cập nhật tin nhắn đến từ socket
    updateMessage: (state, action) => {
      const updated = action.payload;
      const index = state.messages.findIndex((m) => m._id === updated._id);
      if (index !== -1) state.messages[index] = updated;
    },

    // Xóa tin nhắn đến từ socket
    removeMessage: (state, action) => {
      const messageId = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.isDeleted = true;
        msg.content = "This message has been deleted.";
      }
    },

    // Clear khi đổi sang cuộc trò chuyện khác
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // -------------------------------
      // CREATE MESSAGE
      // -------------------------------
      .addCase(createNewMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(createNewMessage.fulfilled, (state, action) => {
        state.sending = false;
      })
      .addCase(createNewMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })

      // -------------------------------
      // FETCH MESSAGES
      // -------------------------------
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || [];
        state.pagination = action.payload.pagination || null; // Dùng khi cần
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addIncomingMessage, updateMessage, removeMessage, clearMessages } =
  messagesSlice.actions;
export default messagesSlice.reducer;
