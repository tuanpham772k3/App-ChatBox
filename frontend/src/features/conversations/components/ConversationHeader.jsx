import React from "react";
import { FaFacebook } from "react-icons/fa";
import { SlNote } from "react-icons/sl";

const ConversationHeader = () => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 text-[var(--color-text-primary)]">
        <h2 className="font-bold text-2xl">Chat</h2>
        <div className="flex gap-3">
          <button className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
            <FaFacebook className="w-5 h-5" />
          </button>
          <button className="flex items-center rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
            <SlNote className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

export default ConversationHeader;
