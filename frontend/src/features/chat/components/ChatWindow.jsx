import React from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, Ellipsis, Lock, Phone, Video } from "lucide-react";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const { currentConversation, draftConversation } = useSelector(
    (state) => state.conversations
  );
  const { user } = useSelector((state) => state.auth);
  const { messages, loading } = useSelector((state) => state.messages);

  // Đối tác nhắn tin 1-1
  const isDraft = activeChat === "draft";
  const partner = isDraft
    ? draftConversation
    : currentConversation?.participants?.find((p) => p._id !== user.id);

  return (
    <main
      className={`flex-[2] bg-[var(--bg-primary)] flex flex-col rounded-lg overflow-hidden
      ${activeChat ? "flex" : "hidden"} md:flex`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          {/* Nút Back chỉ hiện trên mobile */}
          <button
            onClick={onBackToList}
            className="md:hidden mr-2 text-[var(--color-text-primary)]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar + Info */}
          {!isDraft && (
            <div className="relative">
              <img
                src={partner?.avatarUrl?.url}
                alt={partner?.username}
                className="w-10 h-10 rounded-full object-cover"
              />
              {partner?.status === "active" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-primary)] rounded-full"></span>
              )}
            </div>
          )}
          <div className="flex flex-col">
            <h3 className="text-[var(--color-text-primary)] font-semibold">
              {isDraft ? `Nội dung đến: ${partner.username}` : partner?.username}
            </h3>
            {!isDraft && (
              <span className="text-xs text-[var(--color-text-secondary)]">
                {partner?.status === "active" ? "Đang hoạt động" : "Ngoại tuyến"}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        {!isDraft && (
          <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
              <Phone className=" w-5 h-5" />
            </button>
            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
              <Video className="w-5 h-5" />
            </button>
            <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
              <Ellipsis className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
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
              const isMine = msg.sender._id === user.id;
              const avatar = msg.sender.avatarUrl?.url || "/img/default-avatar.png";
              const prevMsg = messages[index - 1];

              // Format thời gian tin hiện tại
              const msgTime = new Date(msg.createdAt);
              const timeText = msgTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              // So sánh mốc thời gian giữa 2 tin nhắn
              let showTimestamp = false; // show mốc thời gian nếu true
              // tin đầu tiên
              if (!prevMsg) {
                showTimestamp = true;
              } else {
                const prevTime = new Date(prevMsg.createdAt);
                const diffMinutes = (msgTime - prevTime) / (1000 * 60);
                const diffDays = msgTime.toDateString() !== prevTime.toDateString();
                // tin sau 5 phút hoặc khác ngày
                if (diffMinutes > 5 || diffDays) showTimestamp = true;
              }

              // Hiển thị header thời gian giữa các tin
              return (
                <React.Fragment key={msg._id}>
                  {showTimestamp && (
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
                          ? "bg-blue-600 text-white rounded-tr-none"
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

                  {/* Thời gian nhỏ bên dưới mỗi tin */}
                  <p
                    className={`text-[10px] text-[var(--color-text-secondary)] mt-1 ${
                      isMine ? "text-right" : "ml-10"
                    }`}
                  >
                    {timeText}
                  </p>
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border)]">
        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 12h6m2 8a9 9 0 10-9-9 9 9 0 009 9z"
            />
          </svg>
        </button>

        <input
          type="text"
          placeholder="Aa"
          className="flex-1 bg-[var(--bg-gray)] rounded-full px-4 py-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
        />

        <button className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M14.752 11.168l-9.193-5.468A1 1 0 004 6.532v10.936a1 1 0 001.559.832l9.193-5.468a1 1 0 000-1.664z"
            />
          </svg>
        </button>

        <button className="text-blue-500 hover:text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2.003 9.25a1 1 0 011.116-.993l13.75 1.5a1 1 0 010 1.986l-13.75 1.5A1 1 0 012.003 9.25z" />
          </svg>
        </button>
      </div>
    </main>
  );
};

export default ChatWindow;
