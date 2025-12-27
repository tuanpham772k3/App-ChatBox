// Hàm helper xử lý Show date
export const showDateDivider = (previousMsg, currentMsg) => {
  if (!previousMsg) return true; // Tin đầu tiên luôn hiển thị

  const prevTime = new Date(previousMsg.createdAt);
  const currTime = new Date(currentMsg.createdAt);

  // Kiểm tra ngày gửi tin
  return currTime.toDateString() !== prevTime.toDateString();
};

// Hàm helper xử lý Show time
export const showTimeDivider = (currentMsg, nextMsg) => {
  // Tin cuối cùng trong danh sách → luôn hiển thị time
  if (!nextMsg) return true;

  const currSender = currentMsg.sender?._id;
  const nextSender = nextMsg.sender?._id;

  // Nếu người gửi KHÁC → kết thúc block hiện tại → show time
  if (currSender !== nextSender) return true;

  const currTime = new Date(currentMsg.createdAt);
  const nextTime = new Date(nextMsg.createdAt);

  return currTime.toDateString() !== nextTime.toDateString(); // Ngày khác nhau thì hiển thị
};

// Hiển thị tên người dùng trong group chat
export const showSenderName = (previousMsg, currentMsg, currentUserId) => {
  // Không hiển thị tên nếu không có tin nhắn hiện tại
  if (!currentMsg) return false;

  // Tin nhắn của chính mình → không cần hiện tên
  if (currentMsg.sender?._id === currentUserId) return false;

  if (!previousMsg) return true; // Tin đầu tiên luôn hiển thị tên

  // Nếu tin trước là của mình → hiện tên người khác
  if (previousMsg.sender?._id !== currentMsg.sender?._id) return true;

  const prevTime = new Date(previousMsg.createdAt);
  const currTime = new Date(currentMsg.createdAt);

  const diffMin = (currTime - prevTime) / 60000; // phút
  const isNewDay = currTime.toDateString() !== prevTime.toDateString();

  // Nếu ngắt mạch hội thoại
  return diffMin > 5 || isNewDay;
};

// Hiển thị avatar người gửi
export const showAvatarDivider = (previousMsg, currentMsg, currentUserId) => {
  // Không hiển thị avatar nếu không có tin nhắn hiện tại
  if (!currentMsg) return false;

  // Tin nhắn của chính mình → không cần hiện avatar
  if (currentMsg.sender?._id === currentUserId) return false;

  if (!previousMsg) return true; // Tin đầu tiên luôn hiển thị avatar

  const isDifferentSender = previousMsg.sender?._id !== currentMsg.sender?._id;

  const prevTime = new Date(previousMsg.createdAt);
  const currTime = new Date(currentMsg.createdAt);
  const isNewDay = currTime.toDateString() !== prevTime.toDateString();

  // Nếu ngắt mạch hội thoại
  return isDifferentSender || isNewDay;
};
