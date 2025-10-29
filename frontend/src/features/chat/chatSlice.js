import { createSlice } from "@reduxjs/toolkit";

// Mock messages
const mockMessages = [
  {
    _id: "m1",
    content: "Huế lụt hết rồi",
    sender: { name: "Băng Châu Phạm", avatar: null },
    senderId: "other",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: "m2",
    content: "Nhà mình lụt đc mô mà",
    sender: { name: "Băng Châu Phạm", avatar: null },
    senderId: "other",
    timestamp: new Date(Date.now() - 3580000).toISOString(),
  },
  {
    _id: "m3",
    content: "Do a tuấn lo xa á",
    sender: { name: "Băng Châu Phạm", avatar: null },
    senderId: "other",
    timestamp: new Date(Date.now() - 3560000).toISOString(),
  },
  {
    _id: "m4",
    content: "Kêu ba mẹ chuẩn bị sẵn sàng đi",
    sender: null,
    senderId: "me",
    timestamp: new Date(Date.now() - 3540000).toISOString(),
  },
  {
    _id: "m5",
    content: "uh chủ quan",
    sender: null,
    senderId: "me",
    timestamp: new Date(Date.now() - 3520000).toISOString(),
    readBy: [{ avatar: null }],
  },
  {
    _id: "m6",
    content: "hắn mà lút một cái thì cái xe đó cũng đem vứt",
    sender: null,
    senderId: "me",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    readBy: [{ avatar: null }],
  },
];

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: mockMessages,
    typingUsers: [],
    isTyping: false,
    onlineUsers: [],
  },
  reducers: {
    addMessage: (state, action) => {
      const message = action.payload;
      const exists = state.messages.find((m) => m._id === message._id);
      if (!exists) {
        state.messages.push(message);
      }
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addTypingUser: (state, action) => {
      const userId = action.payload;
      if (!state.typingUsers.includes(userId)) {
        state.typingUsers.push(userId);
      }
    },
    removeTypingUser: (state, action) => {
      const userId = action.payload;
      state.typingUsers = state.typingUsers.filter((id) => id !== userId);
    },
    setIsTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  addMessage,
  setMessages,
  addTypingUser,
  removeTypingUser,
  setIsTyping,
  setOnlineUsers,
  clearMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
