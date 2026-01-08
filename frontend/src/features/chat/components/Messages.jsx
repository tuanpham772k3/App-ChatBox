import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  showAvatarDivider,
  showDateDivider,
  showSenderName,
  showTimeDivider,
} from "@/shared/lib/utils";
import { deleteMessageById } from "../messagesSlice";
import MessageItem from "./MessageItem";
import { Spin } from "antd";
import { useNotification } from "@/shared/hooks/useNotification";

const Messages = ({ setEditingMessage }) => {
  const dispatch = useDispatch();
  const { currentConversation } = useSelector((state) => state.conversations);
  const { messages = [], loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const notification = useNotification();

  // Xử lý thu hồi tin nhắn
  const handleDeleteMessage = async (messageId) => {
    try {
      await dispatch(deleteMessageById(messageId)).unwrap();
    } catch (error) {
      notification.error({
        message: "Gỡ tin nhắn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  // Xử lý lấy thông tin mes khi click chỉnh sửa
  const handleEditClick = (msg) => {
    setEditingMessage({
      id: msg._id,
      content: msg.content,
      originalContent: msg.content,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-[var(--color-chat)] custom-scrollbar">
      {loading && (
        <div className="flex justify-center">
          <Spin />
        </div>
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
