import React, { useState } from "react";
import { Gift, Image, Mic, Smile, Sticker, ThumbsUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage } from "../messagesSlice";

const MessageInput = () => {
  const [text, setText] = useState("");
  
  const { user } = useSelector((state) => state.auth);
  const { currentConversation } = useSelector((state) => state.conversations);

  const dispatch = useDispatch();

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    if (!text.trim()) return;

    try {
      await dispatch(
        createNewMessage({
          conversationId: currentConversation._id,
          senderId: user.id,
          content: text,
          type: "text",
        })
      ).unwrap();

      setText("");
    } catch (error) {
      console.log("Lỗi gửi tin nhắn:", error);
    }
  };

  return (
    <div className="flex items-center gap-3 px-2 py-3 border-t border-[var(--color-border)]">
      {/* Action btn */}
      <div className="flex">
        {/* Micro */}
        <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Mic className="w-5 h-5" />
        </button>
        {/* Upload */}
        <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Image className="w-5 h-5" />
        </button>
        {/* Sticker */}
        <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Sticker className="w-5 h-5" />
        </button>
        {/* GIF */}
        <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
          <Gift className="w-5 h-5" />
        </button>
      </div>

      {/* Input Message */}
      <div className="flex-1 flex items-center justify-between bg-[var(--bg-gray)] rounded-full">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          type="text"
          placeholder="Aa"
          className="flex-1 bg-[var(--bg-gray)] rounded-full ps-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] focus:outline-none"
        />
        <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-blue-500 hover:text-blue-400">
          <Smile className="w-5 h-5" />
        </button>
      </div>

      {/* Like */}
      <button className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--bg-hover-primary)] text-blue-500 hover:text-blue-400">
        <ThumbsUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default MessageInput;
