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
      return res; // { newMessage, tempId }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Lấy danh sách tin nhắn theo conversation
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchByConversation",
  async ({ conversationId }, { rejectWithValue }) => {
    try {
      const res = await messagesApi.getConversationMessagesApi(conversationId);
      return res; // { messages, pagination }
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Xóa tin nhắn (xóa mềm)
export const deleteMessageById = createAsyncThunk(
  "messages/delete",
  async (messageId, { rejectWithValue }) => {
    try {
      const res = await messagesApi.deleteMessageByIdApi(messageId);
      return res; // message
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Chỉnh sửa tin nhắn
export const editMessageById = createAsyncThunk(
  "messages/edit",
  async ({ messageId, newContent }, { rejectWithValue }) => {
    try {
      const res = await messagesApi.editMessageByIdApi(messageId, newContent);
      return res; // message
    } catch (err) {
      return rejectWithValue(err);
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
    error: null,
  },

  reducers: {
    // Thêm tin nhắn đến từ socket
    addIncomingMessage: (state, action) => {
      const newMsg = action.payload;
      const exists = state.messages.some((m) => m._id === newMsg._id);
      if (!exists) {
        state.messages.push(newMsg);
      }
    },

    // Cập nhật tin nhắn đến từ socket
    updateMessage: (state, action) => {
      const updatedMessage = action.payload;
      const index = state.messages.findIndex((m) => m._id === updatedMessage._id);
      if (index !== -1) state.messages[index] = updatedMessage;
    },

    // Xóa tin nhắn đến từ socket
    removeMessage: (state, action) => {
      const messageId = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.isDeleted = true;
        msg.content = "This message has been deleted.";
        msg.file = null;
      }
    },

    // Cập nhật trạng thái tin nhắn đến từ socket
    updateStatusMessage: (state, action) => {
      const { messageId, status } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.status = status;
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
      .addCase(createNewMessage.pending, (state, action) => {
        const { tempId, conversationId, sender, content, file } = action.meta.arg;

        //Tạo message tạm thời
        const tempMessage = {
          _id: tempId,
          tempId,
          conversationId,
          sender,
          content: file ? "<file>" : content,
          type: file ? "image" : "text",
          file: file || null,
          status: "sending",
          createdAt: new Date().toISOString(),
          isTemp: true,
        };
        state.messages.push(tempMessage);
        state.error = null;
      })
      .addCase(createNewMessage.fulfilled, (state, action) => {
        const { newMessage, tempId } = action.payload;

        const index = state.messages.findIndex((m) => m.tempId === tempId);

        if (index !== -1) {
          state.messages[index] = newMessage;
        } else {
          const exists = state.messages.some((m) => m._id === newMessage._id);
          if (!exists) {
            state.messages.push(newMessage);
          }
        }
      })
      .addCase(createNewMessage.rejected, (state, action) => {
        const { tempId } = action.meta.arg;

        const tempMsg = state.messages.find((m) => m.tempId === tempId);

        if (tempMsg) {
          tempMsg.status = "failed";
        }

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

export const {
  addIncomingMessage,
  updateMessage,
  removeMessage,
  updateStatusMessage,
  clearMessages,
} = messagesSlice.actions;
export default messagesSlice.reducer;
