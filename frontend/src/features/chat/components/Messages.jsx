import React from "react";
import { useSelector } from "react-redux";
import { Lock } from "lucide-react";
import { showTimestamp } from "@/lib/utils";

const Messages = ({ isDraft, partner }) => {
  const { messages, loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
      {/* Hiển thị message tạm trước */}
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
          {messages.map((msg, index) => {
            const isMine = msg.sender._id === user.id; // Tin của tôi
            const avatar = msg.sender.avatarUrl?.url || "/img/default-avatar.png";
            const prevMsg = messages[index - 1]; // Tin nhắn trước
            const msgTime = new Date(msg.createdAt); // Date tin hiện tại

            // Xử lý show time
            const showTime = showTimestamp(msg.createdAt, prevMsg?.createdAt);

            return (
              <React.Fragment key={msg._id}>
                {/* Hiển thị header thời gian giữa các tin */}
                {showTime && (
                  <div className="flex justify-center">
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {msgTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {msgTime.toLocaleDateString([], {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                )}

                <div className={`flex ${isMine ? "justify-end" : "items-end gap-2"}`}>
                  {!isMine && (
                    <img
                      src={avatar}
                      alt={msg.sender.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-xs break-words ${
                      isMine
                        ? "bg-blue-600 text-[var(--color-text-primary)] rounded-tr-none"
                        : "bg-[var(--bg-gray)] text-[var(--color-text-primary)] rounded-tl-none"
                    }`}
                  >
                    {msg.isDeleted ? (
                      <i className="opacity-70">Tin nhắn đã bị xoá</i>
                    ) : (
                      <>
                        <span>{msg.content}</span>
                        {msg.isEdited && (
                          <span className="ml-1 text-[10px] opacity-70">
                            (đã chỉnh sửa)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Messages;
