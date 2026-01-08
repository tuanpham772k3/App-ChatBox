import instance from "@/shared/lib/axios";

const messagesApi = {
  /**
   * Tạo tin nhắn mới
   * POST /messages
   * @param {string} conversationId - ID của conversation
   * @param {string} senderId - ID của người gửi
   * @param {string} content - Nội dung tin nhắn
   * @param {string} type - Loại tin nhắn (text, image, file, emoji)
   * @param {object} fileInfo - Thông tin file (nếu có)
   * @param {string} replyTo - ID của tin nhắn được trả lời (nếu có)
   */
  createNewMessageApi: (payload) => {
    return instance.post("/messages", payload);
  },

  /**
   * Lấy danh sách tin nhắn trong cuộc hội thoại
   * GET /messages/:conversationId
   * @param {string} conversationId - ID của conversation
   * @param {number} page - Trang hiện tại (mặc định 1)
   * @param {number} limit - Số tin nhắn trên mỗi trang (mặc định 20)
   */
  getConversationMessagesApi: (conversationId) => {
    return instance.get(`/messages/${conversationId}`);
  },

  /**
   * Xoá tin nhắn (soft delete)
   * DELETE /messages/:messageId
   * @param {string} messageId - ID của tin nhắn
   */
  deleteMessageByIdApi: (messageId) => {
    return instance.delete(`/messages/${messageId}`);
  },

  /**
   * Chỉnh sửa tin nhắn
   * PUT /messages/:messageId
   * @param {string} messageId - ID của tin nhắn
   * @param {string} content - Nội dung mới của tin nhắn
   */
  editMessageByIdApi: (messageId, newContent) => {
    return instance.put(`/messages/${messageId}`, {
      content: newContent,
    });
  },
};

export default messagesApi;
