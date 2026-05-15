import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import instance from "@/lib/axios";
import messagesApi from "@/services/messagesApi";

/* =============================
 *  Thunk actions
 * ============================= */

// Tạo tin nhắn mới
export const createNewMessage = createAsyncThunk(
  "messages/create",
  async (payload, { rejectWithValue }) => {
    try {
      let finalPayload = { ...payload };

      // Nếu là file local thì upload trước
      if (payload.file?.localFile) {
        const formData = new FormData();
        formData.append("file", payload.file.localFile);

        const uploadRes = await instance.post("/upload", formData);

        // replace file info bằng file thật từ server
        finalPayload.file = uploadRes;
      }

      const newMessage = await messagesApi.createNewMessage(finalPayload);
      return newMessage;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

// Lấy danh sách tin nhắn theo conversation
export const fetchConversationMessages = createAsyncThunk(
  "messages/fetchByConversation",
  async ({ conversationId, cursor }, { rejectWithValue }) => {
    try {
      const res = await messagesApi.getConversationMessages(conversationId, cursor);
      return res; // { messages, nextCursor, hasMore }
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
      const message = await messagesApi.deleteMessageById(messageId);
      return message;
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
      const message = await messagesApi.editMessageById(messageId, newContent);
      return message;
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
    cursor: null,
    hasMore: true,
    loading: false,
    error: null,
  },

  reducers: {
    // Thêm tin nhắn mới real-time
    addIncomingMessage: (state, action) => {
      const newMsg = action.payload;
      const exists = state.messages.some((m) => m._id === newMsg._id);
      if (!exists) {
        state.messages.push(newMsg);
      }
    },

    // Cập nhật tin nhắn real-time
    updateMessage: (state, action) => {
      const updatedMessage = action.payload;
      const index = state.messages.findIndex((m) => m._id === updatedMessage._id);
      if (index !== -1) state.messages[index] = updatedMessage;
    },

    // Xóa tin nhắn real-time
    removeMessage: (state, action) => {
      const messageId = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.isDeleted = true;
        msg.content = "This message has been deleted.";
        msg.file = null;
      }
    },

    // Cập nhật trạng thái tin nhắn real-time
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
      state.error = null;
      state.cursor = null;
      state.hasMore = true;
    },
  },

  extraReducers: (builder) => {
    builder
      // -------------------------------
      // CREATE MESSAGE
      // -------------------------------
      .addCase(createNewMessage.pending, (state, action) => {
        const { tempId, conversationId, senderId, content, file } = action.meta.arg;

        //Tạo message tạm thời
        const tempMessage = {
          _id: tempId,
          tempId,
          conversationId,
          senderId,
          content: file ? null : content,
          type: file ? "image" : "text",
          file: file
            ? {
                url: file.url,
                filename: file.filename,
                mimeType: file.mimeType,
              }
            : null,
          status: "sending",
          createdAt: new Date().toISOString(),
          isTemp: true,
        };
        state.messages.push(tempMessage);
        state.error = null;
      })
      .addCase(createNewMessage.fulfilled, (state, action) => {
        const newMessage = action.payload;
        const { tempId } = action.meta.arg;

        // Tránh duplicate khi socket "message_new" tới trước REST response:
        // - socket đã add message thật (_id thật)
        // - sau đó fulfilled sẽ replace temp message thành message thật -> tạo 2 item cùng _id
        const tempIndex = state.messages.findIndex((m) => m.tempId === tempId);
        const existingIndex = state.messages.findIndex((m) => m._id === newMessage._id);

        // Case A: Đã có message thật trong list (thường do realtime tới trước)
        if (existingIndex !== -1) {
          let idx = existingIndex;

          // Nếu vẫn còn temp message -> xoá temp để không bị trùng
          if (tempIndex !== -1 && tempIndex !== existingIndex) {
            state.messages.splice(tempIndex, 1);
            // Sau khi splice, index của existing có thể bị shift
            if (tempIndex < existingIndex) idx = existingIndex - 1;
          }

          // Đồng bộ lại message thật (phòng trường hợp payload REST đầy đủ hơn)
          if (idx >= 0 && idx < state.messages.length) {
            state.messages[idx] = newMessage;
          }
          return;
        }

        // Case B: Chưa có message thật -> replace temp (happy path)
        if (tempIndex !== -1) {
          state.messages[tempIndex] = newMessage;
          return;
        }

        // Case C: Không tìm thấy temp (UI không optimistic) -> push nếu chưa có
        state.messages.push(newMessage);
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
        const { messages, nextCursor, hasMore } = action.payload;

        if (!state.cursor) {
          // load lần đầu
          state.messages = messages;
        } else {
          // load thêm → prepend, tránh duplicate theo _id
          const existingIds = new Set(state.messages.map((m) => m._id));
          const uniqueOldMessages = messages.filter((m) => !existingIds.has(m._id));
          state.messages = [...uniqueOldMessages, ...state.messages];
        }

        state.cursor = nextCursor;
        state.hasMore = hasMore;
        state.loading = false;
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
