import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { showAvatarDivider, showDateDivider, showSenderName, showTimeDivider } from "@/shared/lib/utils";
import { deleteMessageById } from "../messagesSlice";
import MessageItem from "./MessageItem";

const Messages = ({ setEditContent, setEditMessageId, setEditOriginalContent }) => {
  const { currentConversation } = useSelector((state) => state.conversations);
  const { messages = [], loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  // Xử lý thu hồi message
  const handleDeleteMessage = async (messageId) => {
    try {
      await dispatch(deleteMessageById(messageId)).unwrap();
    } catch (error) {
      console.log("Delete message error: ", error);
    }
  };

  // Xử lý lấy thông tin mes khi click chỉnh sửa
  const handleEditClick = (msg) => {
    setEditMessageId(msg._id);
    setEditContent(msg.content);
    setEditOriginalContent(msg.content);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5 bg-[var(--color-chat)] custom-scrollbar">
      {loading && (
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Đang tải tin nhắn...
        </p>
      )}

      {messages.length === 0 && !loading && (
        <p className="text-center text-sm text-[var(--color-text-secondary)]">
          Chưa có tin nhắn nào
        </p>
      )}
      {/* ===== List Messages ===== */}
      {messages.map((msg, index) => {
        const isMine = msg.sender?._id === user.id; // Tin của tôi
        const prevMsg = messages[index - 1]; // Tin nhắn trước
        const nextMsg = messages[index + 1]; // Tin nhắn sau

        // Xử lý show timestamp, tên người gửi
        const showDate = showDateDivider(prevMsg, msg);
        const showTime = showTimeDivider(msg, nextMsg);
        const showName = showSenderName(prevMsg, msg, user.id);
        const showAvatar = showAvatarDivider(prevMsg, msg, user.id);

        const isLastMessage = index === messages.length - 1;

        return (
          <MessageItem
            key={msg._id}
            msg={msg}
            isMine={isMine}
            showDate={showDate}
            showTime={showTime}
            showName={showName}
            showAvatar={showAvatar}
            isLastMessage={isLastMessage}
            conversation={currentConversation}
            currentUserId={user.id}
            onDeleteMessage={handleDeleteMessage}
            onEditClick={handleEditClick}
          />
        );
      })}
    </div>
  );
};

export default Messages;
