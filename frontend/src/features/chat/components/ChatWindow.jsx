import React from "react";
import { useSelector } from "react-redux";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const { currentConversation } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);
  const partner = currentConversation.participants.find((p) => p._id !== user.id);

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Avatar + Info */}
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
          <div className="flex flex-col">
            <h3 className="text-[var(--color-text-primary)] font-semibold">
              {partner?.username}
            </h3>
            <span className="text-xs text-[var(--color-text-secondary)]">
              {partner?.status === "active" ? "Đang hoạt động" : "Ngoại tuyến"}
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3 text-[var(--color-text-primary)]">
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
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
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.25 0a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 20.25v-7.5a2.25 2.25 0 012.25-2.25m11.25 0H6.75"
              />
            </svg>
          </button>
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 1115 0H4.5z"
              />
            </svg>
          </button>
          <button className="hover:bg-[var(--bg-hover-primary)] p-2 rounded-full">
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
                d="M6 6h12M6 12h12M6 18h12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
        <div className="flex justify-center">
          <span className="text-xs text-[var(--color-text-secondary)]">22:34 T2</span>
        </div>

        <div className="flex items-end gap-2">
          <img
            src="/img/user3.jpg"
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
              Mới lội vô quảng nam
            </div>
            <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
              Má nước ngang rốn 😢
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <span className="text-xs text-[var(--color-text-secondary)]">23:10 T2</span>
        </div>

        <div className="flex justify-end">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-xs">
            Huế nhiều chỗ ngập tới nóc nhà 😢
          </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-blue-500 text-white px-3 py-2 rounded-2xl rounded-tr-none max-w-xs">
            khả năng cũng sắp ngập
          </div>
        </div>

        <div className="flex justify-center">
          <span className="text-xs text-[var(--color-text-secondary)]">17:11 T3</span>
        </div>

        <div className="flex items-end gap-2">
          <img
            src="/img/user3.jpg"
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="bg-[var(--bg-gray)] text-[var(--color-text-primary)] px-3 py-2 rounded-2xl rounded-tl-none max-w-xs">
            Đn ngập ko
          </div>
        </div>
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
