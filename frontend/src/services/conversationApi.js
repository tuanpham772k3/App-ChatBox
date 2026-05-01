import instance from "@/lib/axios";

const conversationApi = {
  /**
   * Tạo hội thoại 1-1
   * POST /conversations/private
   * @param {string} participantId - id của người muốn chat cùng
   */
  createConversation: (participantId) => {
    return instance.post("/conversations/private", { participantId });
  },

  /**
   * Lấy danh sách hội thoại của user hiện tại
   * GET /conversations
   */
  getConversations: () => {
    return instance.get("/conversations");
  },

  /**
   * Lấy chi tiết 1 hội thoại
   * GET /conversations/:conversationId
   */
  getConversationById: (conversationId) => {
    return instance.get(`/conversations/${conversationId}`);
  },

  /**
   * Tạo nhóm chat
   * POST /conversations/group
   * body: { name, memberIds }
   * (Đường dẫn có thể khác tuỳ backend của bạn, chỉnh lại cho khớp)
   */
  createGroupConversation: (payload) => {
    // payload: { name: string, memberIds: string[] }
    return instance.post("/conversations/group", payload);
  },

  /**
   * Thêm 1 thành viên vào nhóm
   * POST /conversations/:id/members
   * body: { memberIds: [] } //mảng
   */
  addMemberToGroup: ({ conversationId, memberIds }) => {
    return instance.put(`/conversations/${conversationId}/members`, {
      memberIds,
    });
  },

  /**
   * Xoá 1 thành viên khỏi nhóm
   * DELETE /conversations/:id/members/:userId
   */
  removeMemberFromGroup: ({ conversationId, memberId }) => {
    return instance.delete(`/conversations/${conversationId}/members/${memberId}`);
  },

  /**
   * Xoá hội thoại (soft delete)
   * DELETE /conversations/:conversationId
   */
  deleteConversation: (conversationId) => {
    return instance.delete(`/conversations/${conversationId}`);
  },

  /**
   * Đánh dấu đã đọc
   * PUT /conversations/:conversationId/read
   */
  markAsRead: (conversationId) => {
    return instance.put(`/conversations/${conversationId}/read`);
  },

  /**
   * Lấy danh sách Ảnh
   * PUT /conversations/:conversationId/images
   */
  getConversationImages: (conversationId, limit = 8) => {
    return instance.get(`/conversations/${conversationId}/images`, {
      params: { limit },
    });
  },

  /**
   * Rời nhóm chat
   * DELETE /conversations/:conversationId/leave
   */
  leaveGroup: (conversationId) => {
    return instance.delete(`/conversations/${conversationId}/leave`);
  },

  /**
   * Nhượng quyền owner cho thành viên khác (chỉ dành cho owner)
   * PUT /conversations/:conversationId/transfer-ownership
   * body: { newOwnerId }
   */
  transferGroupOwnership: (conversationId, newOwnerId) => {
    return instance.put(`/conversations/${conversationId}/transfer-ownership`, {
      newOwnerId,
    });
  },

  /**
   * Xóa hội thoại của chính tôi
   * DELETE /conversations/:conversationId/for-me
   */
  deleteConversationForMe: (conversationId) => {
    return instance.delete(`/conversations/${conversationId}/for-me`);
  },

  togglePinConversation: (conversationId) => {
    return instance.put(`/conversations/${conversationId}/pin`);
  },

  markAsUnread: (conversationId) => {
    return instance.put(`/conversations/${conversationId}/unread`);
  },

  clearConversationHistory: (conversationId) => {
    return instance.put(`/conversations/${conversationId}/clear-history`);
  },
};

export default conversationApi;
