// Xử lý dữ liệu hiển thị thông tin
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

  return {
    isGroup,
    partner,
    displayName,
    displayAvatar,
    lastMsgSender,
    lastMsgContent,
    lastMsgTime,
  };
};
