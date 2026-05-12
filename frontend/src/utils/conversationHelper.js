/**
 * Xử lý dữ liệu hiển thị thông tin conversation
 * @param {Object} conversation - đối tượng conversation
 * @param {string} currentUserId - id của chính mình
 * @returns {Object|null} thông tin hiển thị của conversation
 */
const getRefId = (ref) => ref?._id || ref;

const getPartner = (participants, currentUserId) => {
  return participants.find((p) => String(getRefId(p.userId)) !== String(currentUserId));
};

const getCurrentUser = (participants, currentUserId) => {
  return participants.find((p) => String(getRefId(p.userId)) === String(currentUserId));
};

const mapParticipants = (participants, currentUserId) => {
  return participants.map((p) => {
    const user = p.userId || {};
    const userId = getRefId(user);

    return {
      id: userId,
      name: String(userId) === String(currentUserId) ? "Bạn" : user.username || "Người dùng",
      avatarUrl: user.avatarUrl?.url || "/avatarA.jpg",
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

  const sender = lastMsg.senderId || {};
  const senderId = getRefId(sender);
  const isMe = String(senderId) === String(currentUserId);

  return {
    sender: isMe ? "Bạn" : sender.username || "",
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
    partnerId: getRefId(partner?.userId),
    currentUser,
    participants: mappedParticipants,
    displayName: isGroup ? name : partner?.userId?.username || "Người dùng",
    displayAvatar: isGroup
      ? null
      : partner?.userId?.avatarUrl?.url || "/avatar-default.jpg",
    lastMsgSender: lastMsg.sender,
    lastMsgContent: lastMsg.content,
    lastMsgTime: lastMsg.time,
  };
};
