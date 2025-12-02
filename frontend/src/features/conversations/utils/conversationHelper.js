/**
 * Xử lý dữ liệu hiển thị thông tin conversation
 * @param {Object} conversation - đối tượng conversation
 * @param {string} currentUserId - id của chính mình
 * @returns {Object|null} thông tin hiển thị của conversation
 */
export const getDisplayInfo = (conversation, currentUserId) => {
  if (!conversation) return null;

  // Lấy người đối diện
  const partner = conversation.participants.find((p) => p._id !== currentUserId);

  // Nếu là group thì hiển thị khác
  const isGroup = conversation.type === "group";

  const displayName = isGroup ? conversation.name : partner?.username || "Người dùng";

  const displayAvatar = isGroup
    ? conversation.avatar?.url || "/img/group-default.png"
    : partner?.avatarUrl?.url || "/img/default-avatar.png";

  // Thông tin tin nhắn cuối
  const lastMsg = conversation.lastMessage;
  const lastMsgSender = lastMsg?.sender?.username || "";
  const lastMsgContent = lastMsg?.content || "Chưa có tin nhắn";
  const lastMsgTime = lastMsg?.createdAt
    ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Số tin nhắn chưa đọc (backend đã tính sẵn cho user hiện tại)
  const unreadCount = conversation.unreadCount || 0;

  return {
    isGroup,
    partner,
    displayName,
    displayAvatar,
    lastMsgSender,
    lastMsgContent,
    lastMsgTime,
    unreadCount,
  };
};

/**
 * Lấy danh sách tên những user đang gõ (loại bỏ chính mình)
 * @param {Object|null|undefined} typingUsers - map { userId: username }
 * @param {string} currentUserId - id của chính mình
 * @returns {string[]} danh sách username đang gõ
 */
export const getTypingNames = (typingUsers, currentUserId) => {
  if (!typingUsers) return [];

  return Object.values(typingUsers).filter(([userId]) => userId !== currentUserId);
};
