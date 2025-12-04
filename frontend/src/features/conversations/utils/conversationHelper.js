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

  const isMeLastSender = lastMsg?.sender?._id === currentUserId;
  const lastMsgSender = isMeLastSender ? "Bạn" : lastMsg?.sender?.username || "";

  const lastMsgContent = lastMsg?.content || "Chưa có tin nhắn";
  const lastMsgTime = lastMsg?.createdAt ? formatConversationTime(lastMsg.createdAt) : "";

  // Số tin nhắn chưa đọc (backend đã tính sẵn cho user hiện tại)
  const unreadCount = conversation.unreadCount || 0;

  return {
    id: conversation._id,
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
 * Định dạng thời gian giống các app chat:
 * - Hôm nay: HH:mm
 * - Hôm qua: "Hôm qua"
 * - Cùng tuần: "Thứ x"
 * - Còn lại: "dd/MM"
 */
export const formatConversationTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();

  const isSameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (isYesterday) {
    return "Hôm qua";
  }

  // Thứ trong tuần (0: CN)
  const weekdayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  // Nếu trong cùng tuần hiện tại thì hiển thị "T2/T3..."
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Chủ nhật

  if (date >= startOfWeek) {
    return weekdayNames[date.getDay()];
  }

  // Mặc định dd/MM
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
};

/**
 * Lấy danh sách tên những user đang gõ (loại bỏ chính mình)
 * @param {Object|null|undefined} typingUsers - map { userId: username }
 * @param {string} currentUserId - id của chính mình
 * @returns {string[]} danh sách username đang gõ
 */
export const getTypingNames = (typingUsers, currentUserId) => {
  if (!typingUsers) return [];

  // typingUsers: { [userId]: username }
  return Object.entries(typingUsers)
    .filter(([userId]) => userId !== currentUserId)
    .map(([, username]) => username);
};
