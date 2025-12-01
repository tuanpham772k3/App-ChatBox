import instance from "@/lib/axios";

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
   * Xoá hội thoại (soft delete)
   * DELETE /conversations/:conversationId
   */
  deleteConversationApi: async (conversationId) => {
    const res = await instance.delete(`/conversations/${conversationId}`);
    return res.data;
  },
};

export default conversationApi;
