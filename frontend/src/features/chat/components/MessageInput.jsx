import React from "react";

const MessageInput = () => {
  return (
    <div>
     
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
    </div>
  );
};

export default MessageInput;
