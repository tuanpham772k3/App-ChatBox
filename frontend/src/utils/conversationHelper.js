/**
 * Xử lý dữ liệu hiển thị thông tin conversation
 * @param {Object} conversation - đối tượng conversation
 * @param {string} currentUserId - id của chính mình
 * @returns {Object|null} thông tin hiển thị của conversation
 */
const getPartner = (participants, currentUserId) => {
  return participants.find((p) => p.userId?._id !== currentUserId);
};

const getCurrentUser = (participants, currentUserId) => {
  return participants.find((p) => p.userId?._id === currentUserId);
};

const mapParticipants = (participants, currentUserId) => {
  return participants.map((p) => {
    return {
      id: p.userId?._id,
      name:
        p.userId?._id === currentUserId ? "Bạn" : p.userId?.displayName || "Người dùng",
      avatarUrl: p.userId?.avatar?.url || null,
      role: p.role,
    };
  });
};

const formatConversationTime = (isoString) => {
  if (!isoString) return "";

  const date = new Date(isoString);
  const now = new Date();

  const isSameDay = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isSameDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (isYesterday) return "Hôm qua";

  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());

  if (date >= startOfWeek) {
    return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][date.getDay()];
  }

  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getLastMessageInfo = (lastMsg, currentUserId) => {
  if (!lastMsg) {
    return {
      sender: "",
      content: "Chưa có tin nhắn",
      time: "",
    };
  }

  const isMe = lastMsg.senderId?._id === currentUserId;

  return {
    sender: isMe ? "Bạn" : lastMsg.senderId?.displayName || "",
    content: lastMsg.content || "",
    time: lastMsg.createdAt ? formatConversationTime(lastMsg.createdAt) : "",
  };
};

export const getDisplayInfo = (conversation, currentUserId) => {
  if (!conversation) return null;

  const { participants = [], type, name, lastMessage } = conversation;

  const partner = getPartner(participants, currentUserId);
  const currentUser = getCurrentUser(participants, currentUserId);
  const mappedParticipants = mapParticipants(participants, currentUserId);
  const lastMsg = getLastMessageInfo(lastMessage, currentUserId);

  const isGroup = type === "group";

  return {
    id: conversation._id,
    isGroup,
    partner,
    partnerId: partner?.userId?._id,
    currentUser,
    participants: mappedParticipants,
    displayName: isGroup ? name : partner?.userId?.displayName || "Người dùng",
    displayAvatar: isGroup ? null : partner?.userId?.avatar?.url || null,
    lastMsgSender: lastMsg.sender,
    lastMsgContent: lastMsg.content,
    lastMsgTime: lastMsg.time,
  };
};
