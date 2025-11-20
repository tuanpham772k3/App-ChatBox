import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Lock } from "lucide-react";
import { showTimestamp } from "@/lib/utils";
import { deleteMessageById } from "../messagesSlice";
import MessageItem from "./MessageItem";

const Messages = ({
  isDraft,
  partner,
  setEditContent,
  setEditMessageId,
  setEditOriginalContent,
}) => {
  const { messages, loading } = useSelector((state) => state.messages);
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
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
      {/* ===== Display draft chat or real chat window =====*/}
      {isDraft ? (
        <div className="flex flex-col items-center justify-center h-full text-center text-[var(--color-text-secondary)] space-y-2">
          <div className="relative">
            <img
              src={partner?.avatarUrl?.url}
              alt={partner?.username}
              className="w-14 h-14 rounded-full object-cover"
            />
            {partner?.status === "active" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full"></span>
            )}
          </div>
          <h3 className="text-[var(--color-text-primary)] font-semibold">
            {partner?.username}
          </h3>
          <p className="text-[0.7rem] flex gap-1 items-center">
            <Lock className="w-3 h-3" />
            <span className="font-medium">
              Tin nhắn và cuộc gọi được bảo mật bằng tính năng mã hóa đầu cuối.
            </span>
            Chỉ những người tham gia đoạn chat này mới có thể đọc, nghe hoặc chia sẻ
            <a href="#" className="text-blue-500 font-medium">
              Tìm hiểu thêm
            </a>
          </p>
        </div>
      ) : (
        <>
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
            const isMine = msg.sender._id === user.id; // Tin của tôi
            const prevMsg = messages[index - 1]; // Tin nhắn trước
            // Xử lý show time
            const showTime = showTimestamp(msg.createdAt, prevMsg?.createdAt);

            return (
              <MessageItem
                key={msg._id}
                msg={msg}
                isMine={isMine}
                showTime={showTime}
                onDeleteMessage={handleDeleteMessage}
                onEditClick={handleEditClick}
              />
            );
          })}
        </>
      )}
    </div>
  );
};

export default Messages;
