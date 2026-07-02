const DEFAULT_USER_LABEL = "Người dùng";
const CURRENT_USER_LABEL = "Bạn";
const EMPTY_LAST_MESSAGE = {
  sender: "",
  content: "Chưa có tin nhắn",
  time: "",
};

const findPartnerParticipant = (participants, currentUserId) => {
  return participants.find((p) => p.userId?._id !== currentUserId);
};

const findCurrentParticipant = (participants, currentUserId) => {
  return participants.find((p) => p.userId?._id === currentUserId);
};

// Map một participant API → MemberView cho UI.
export const toMemberView = (participant, currentUserId) => {
  const id = participant.userId?._id;
  const isMe = id === currentUserId;

  return {
    id,
    displayName: isMe
      ? CURRENT_USER_LABEL
      : participant.userId?.displayName || DEFAULT_USER_LABEL,
    avatarUrl: participant.userId?.avatar?.url || null,
    role: participant.role,
    presence: participant.userId?.presence || null,
  };
};

export const mapMembers = (participants = [], currentUserId) => {
  return participants.map((participant) => toMemberView(participant, currentUserId));
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

const getLastMessageView = (lastMsg, currentUserId) => {
  if (!lastMsg) {
    return { ...EMPTY_LAST_MESSAGE };
  }

  const isMe = lastMsg.senderId?._id === currentUserId;

  return {
    sender: isMe ? CURRENT_USER_LABEL : lastMsg.senderId?.displayName || "",
    content: lastMsg.content || "",
    time: lastMsg.createdAt ? formatConversationTime(lastMsg.createdAt) : "",
  };
};

// Tạo ViewModel hiển thị từ conversation API (Redux domain model).
// Component UI chỉ nên dùng object trả về từ hàm này, không đọc trực tiếp participant.userId.
export const getDisplayInfo = (conversation, currentUserId) => {
  if (!conversation) return null;

  const { participants = [], type, name, lastMessage } = conversation;

  const partnerParticipant = findPartnerParticipant(participants, currentUserId);
  const currentParticipant = findCurrentParticipant(participants, currentUserId);
  const members = mapMembers(participants, currentUserId);
  const lastMessageView = getLastMessageView(lastMessage, currentUserId);

  const isGroup = type === "group";

  return {
    id: conversation._id,
    isGroup,

    displayName: isGroup
      ? name || DEFAULT_USER_LABEL
      : partnerParticipant?.userId?.displayName || DEFAULT_USER_LABEL,
    displayAvatar: isGroup ? null : partnerParticipant?.userId?.avatar?.url || null,

    isOnline: !isGroup && partnerParticipant?.userId?.presence === "online",
    partnerId: isGroup ? null : partnerParticipant?.userId?._id || null,

    me: currentParticipant ? toMemberView(currentParticipant, currentUserId) : null,
    members,

    lastMessage: lastMessageView,
    lastMsgSender: lastMessageView.sender,
    lastMsgContent: lastMessageView.content,
    lastMsgTime: lastMessageView.time,

    isPinned: Boolean(currentParticipant?.pinnedAt),
    unreadCount: currentParticipant?.unreadCount || 0,
  };
};
