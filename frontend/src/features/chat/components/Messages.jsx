import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { EllipsisVertical, Lock } from "lucide-react";
import { showTimestamp } from "@/lib/utils";

const Messages = ({ isDraft, partner }) => {
  const { messages, loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuDirection, setMenuDirection] = useState("up");

  // DOM reference for the menu element, used for click-outside detection
  const menuRef = useRef(null);

  // Hàm lắng nghe sự kiện click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý hướng menu hiển thị
  const handleToggleMenu = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect(); // tọa độ & kích thước element
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = 125;

    if (spaceAbove >= estimatedMenuHeight) {
      setMenuDirection("up");
    } else if (spaceBelow >= estimatedMenuHeight) {
      setMenuDirection("down");
    } else {
      // chọn nơi có nhiều chỗ hơn
      setMenuDirection(spaceBelow > spaceAbove ? "down" : "up");
    }

    setOpenMenuId(openMenuId === id ? null : id);
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
            const avatar = msg.sender.avatarUrl?.url || "/img/default-avatar.png";
            const prevMsg = messages[index - 1]; // Tin nhắn trước
            const msgTime = new Date(msg.createdAt); // Date tin hiện tại

            // Xử lý show time
            const showTime = showTimestamp(msg.createdAt, prevMsg?.createdAt);

            return (
              <React.Fragment key={msg._id}>
                {/* ===== Display time ===== */}
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

                {/* ===== Item Message ===== */}
                <div
                  className={`flex gap-4 ${
                    isMine ? "justify-end" : "items-end gap-2"
                  } group`}
                >
                  {/* --- Avatar ---*/}
                  {!isMine && (
                    <img
                      src={avatar}
                      alt={msg.sender.username}
                      className="w-8 h-8 rounded-full object-cover cursor-pointer"
                    />
                  )}

                  {/* --- Ellipsis + Menu ---*/}
                  {isMine && (
                    <div
                      className="flex items-center"
                      ref={msg._id === openMenuId ? menuRef : null}
                    >
                      {/* Wrapper */}
                      <div className="relative">
                        {/* Ellipsis */}
                        <button
                          onClick={(e) => handleToggleMenu(e, msg._id)}
                          className={`p-1 rounded-full transition-opacity ${
                            openMenuId === msg._id
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }  hover:bg-gray-700`}
                        >
                          <EllipsisVertical
                            className="w-5 h-5"
                            color="var(--color-text-secondary)"
                          />
                        </button>
                        {/* Menu */}
                        {openMenuId === msg._id && (
                          <div
                            className={`absolute ${
                              menuDirection === "up"
                                ? "bottom-full left-1/2 transform -translate-x-1/2 mb-2.5"
                                : "top-full left-1/2 transform -translate-x-1/2 mb-2.5"
                            } w-[150px] p-1 bg-[var(--bg-gray)] rounded-md`}
                          >
                            <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                              Chỉnh sửa
                            </button>
                            <button className="text-white w-full px-2 py-1 text-start hover:bg-gray-600 rounded">
                              Thu hồi
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* --- Bubble --- */}
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
