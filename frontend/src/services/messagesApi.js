import instance from "@/lib/axios";

const messagesApi = {
  /**
   * Tạo tin nhắn mới
   * POST /messages
   * @param {string} conversationId - ID của conversation
   * @param {string} content - Nội dung tin nhắn
   * @param {object} fileInfo - Thông tin file (nếu có)
   * @param {string} replyTo - ID của tin nhắn được trả lời (nếu có)
   */
  createNewMessage: (payload) => {
    return instance.post("/messages", payload);
  },

  /**
   * Lấy danh sách tin nhắn trong cuộc hội thoại
   * GET /messages/:conversationId
   * @param {string} conversationId - ID của conversation
   * @param {number} page - Trang hiện tại (mặc định 1)
   * @param {number} limit - Số tin nhắn trên mỗi trang (mặc định 20)
   */
  getConversationMessages: ({ conversationId, cursor }) => {
    const params = cursor ? { before: cursor, limit: 20 } : { limit: 20 };
    return instance.get(`/messages/${conversationId}`, { params });
  },

  /**
   * Xoá tin nhắn (soft delete)
   * DELETE /messages/:messageId
   * @param {string} messageId - ID của tin nhắn
   */
  deleteMessageById: (messageId) => {
    return instance.delete(`/messages/${messageId}`);
  },

  /**
   * Chỉnh sửa tin nhắn
   * PUT /messages/:messageId
   * @param {string} messageId - ID của tin nhắn
   * @param {string} content - Nội dung mới của tin nhắn
   */
  editMessageById: ({ messageId, newContent }) => {
    return instance.put(`/messages/${messageId}`, {
      content: newContent,
    });
  },
};

export default messagesApi;
