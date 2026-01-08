import instance from "@/shared/lib/axios";

const conversationApi = {
  /**
   * Tạo hội thoại 1-1
   * POST /conversations/private
   * @param {string} participantId - id của người muốn chat cùng
   */
  createConversationApi: (participantId) => {
    return instance.post("/conversations/private", { participantId });
  },

  /**
   * Lấy danh sách hội thoại của user hiện tại
   * GET /conversations
   */
  getConversationsApi: () => {
    return instance.get("/conversations");
  },

  /**
   * Lấy chi tiết 1 hội thoại
   * GET /conversations/:conversationId
   */
  getConversationByIdApi: (conversationId) => {
    return instance.get(`/conversations/${conversationId}`);
  },

  /**
   * Tạo nhóm chat
   * POST /conversations/group
   * body: { name, memberIds }
   * (Đường dẫn có thể khác tuỳ backend của bạn, chỉnh lại cho khớp)
   */
  createGroupConversationApi: (payload) => {
    // payload: { name: string, memberIds: string[] }
    return instance.post("/conversations/group", payload);
  },

  /**
   * Thêm 1 thành viên vào nhóm
   * POST /conversations/:id/members
   * body: { memberIds: [] } //mảng
   */
  addMemberToGroupApi: ({ conversationId, memberIds }) => {
    return instance.put(`/conversations/${conversationId}/members`, {
      memberIds,
    });
  },

  /**
   * Xoá 1 thành viên khỏi nhóm
   * DELETE /conversations/:id/members/:userId
   */
  removeMemberFromGroupApi: ({ conversationId, memberId }) => {
    return instance.delete(`/conversations/${conversationId}/members/${memberId}`);
  },

  /**
   * Xoá hội thoại (soft delete)
   * DELETE /conversations/:conversationId
   */
  deleteConversationApi: (conversationId) => {
    return instance.delete(`/conversations/${conversationId}`);
  },

  /**
   * Đánh dấu đã đọc
   * PUT /conversations/:conversationId/read
   */
  markAsReadApi: (conversationId) => {
    return instance.put(`/conversations/${conversationId}/read`);
  },
};

export default conversationApi;
