import { createSlice } from "@reduxjs/toolkit";

// Mock data
const mockConversations = [
  {
    _id: "1",
    title: "Công nghệ thông tin",
    participants: [{ name: "Trần", avatar: null, isOnline: false }],
    lastMessage: { senderName: "Trần", content: "đã gửi 1 ảnh" },
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 1,
  },
  {
    _id: "2",
    title: "Huỳnh Xuân Quý",
    participants: [{ name: "Huỳnh Xuân Quý", avatar: null, isOnline: true }],
    lastMessage: { senderName: "Bạn", content: "uh" },
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    unreadCount: 0,
  },
  {
    _id: "3",
    title: "Băng Châu Phạm",
    participants: [{ name: "Băng Châu Phạm", avatar: null, isOnline: false }],
    lastMessage: {
      senderName: "Bạn",
      content: "bị rồi thì cũng có lúc bị lại thôi",
    },
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    unreadCount: 0,
  },
  {
    _id: "4",
    title: "Trần Công Hiếu",
    participants: [{ name: "Trần Công Hiếu", avatar: null, isOnline: false }],
    lastMessage: {
      senderName: "Trần Công Hiếu",
      content: "Gác lại quá khứ, tiếp tục cuộc sống hiện tại thôi 😅",
    },
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
  },
  {
    _id: "5",
    title: "Nhóm Lập trình",
    participants: [
      { name: "Nguyễn Văn A", avatar: null, isOnline: true },
      { name: "Trần Thị B", avatar: null, isOnline: false },
    ],
    lastMessage: { senderName: "Nguyễn Văn A", content: "Code xong chưa?" },
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    unreadCount: 3,
  },
];

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    list: mockConversations,
    selectedConversation: mockConversations[2], // Select "Băng Châu Phạm" by default
    searchQuery: "",
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    addConversation: (state, action) => {
      state.list.unshift(action.payload);
    },
    updateConversation: (state, action) => {
      const index = state.list.findIndex((c) => c._id === action.payload._id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
  },
});

export const {
  setSelectedConversation,
  setSearchQuery,
  addConversation,
  updateConversation,
} = conversationSlice.actions;
export default conversationSlice.reducer;
