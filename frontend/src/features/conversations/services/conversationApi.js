import instance from "@/shared/lib/axios";

const conversationApi = {
  /**
   * Tạo hội thoại 1-1
   * POST /conversations/private
   * @param {string} participantId - id của người muốn chat cùng
   */
  createConversationApi: async (participantId) => {
    const res = await instance.post("/conversations/private", { participantId });
    return res.data;
  },

  /**
   * Lấy danh sách hội thoại của user hiện tại
   * GET /conversations
   */
  getConversationsApi: async () => {
    const res = await instance.get("/conversations");
    return res.data;
  },

  /**
   * Lấy chi tiết 1 hội thoại
   * GET /conversations/:conversationId
   */
  getConversationByIdApi: async (conversationId) => {
    const res = await instance.get(`/conversations/${conversationId}`);
    return res.data;
  },

  /**
   * Tạo nhóm chat
   * POST /conversations/group
   * body: { name, memberIds }
   * (Đường dẫn có thể khác tuỳ backend của bạn, chỉnh lại cho khớp)
   */
  createGroupConversationApi: async (payload) => {
    // payload: { name: string, memberIds: string[] }
    const res = await instance.post("/conversations/group", payload);
    return res.data;
  },

  /**
   * Thêm 1 thành viên vào nhóm
   * POST /conversations/:id/members
   * body: { userIds: [] } //mảng
   */
  addMemberToGroupApi: async ({ conversationId, userIds }) => {
    const res = await instance.post(`/conversations/${conversationId}/members`, {
      userIds,
    });
    return res.data;
  },

  /**
   * Xoá 1 thành viên khỏi nhóm
   * DELETE /conversations/:id/members/:userId
   */
  removeMemberFromGroupApi: async ({ conversationId, userId }) => {
    const res = await instance.delete(
      `/conversations/${conversationId}/members/${userId}`
    );
    return res.data;
  },

  /**
   * Xoá hội thoại (soft delete)
   * DELETE /conversations/:conversationId
   */
  deleteConversationApi: async (conversationId) => {
    const res = await instance.delete(`/conversations/${conversationId}`);
    return res.data;
  },
};

export default conversationApi;
