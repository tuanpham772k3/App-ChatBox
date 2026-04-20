/**
 * Xử lý dữ liệu hiển thị thông tin conversation
 * @param {Object} conversation - đối tượng conversation
 * @param {string} currentUserId - id của chính mình
 * @returns {Object|null} thông tin hiển thị của conversation
 */
const getPartner = (participants, currentUserId) => {
  return participants.find((p) => p.user._id !== currentUserId);
};

const getCurrentUser = (participants, currentUserId) => {
  return participants.find((p) => p.user._id === currentUserId);
};

const mapParticipants = (participants, currentUserId) => {
  return participants.map((p) => ({
    id: p.user._id,
    name: p.user._id === currentUserId ? "Bạn" : p.user.username,
    avatarUrl: p.user.avatarUrl?.url || "/avatarA.jpg",
    role: p.role,
  }));
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

  const isMe = lastMsg.sender?._id === currentUserId;

  return {
    sender: isMe ? "Bạn" : lastMsg.sender?.username || "",
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
    partnerId: partner?.user?._id,
    currentUser,
    participants: mappedParticipants,
    displayName: isGroup ? name : partner?.user?.username || "Người dùng",
    displayAvatar: isGroup
      ? null
      : partner?.user?.avatarUrl?.url || "/avatar-default.jpg",
    lastMsgSender: lastMsg.sender,
    lastMsgContent: lastMsg.content,
    lastMsgTime: lastMsg.time,
  };
};
