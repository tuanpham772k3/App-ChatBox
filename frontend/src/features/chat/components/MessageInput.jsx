import React, { useRef, useState } from "react";
import { Image, MapPin, Mic, Navigation, Smile } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, editMessageById } from "../messagesSlice";
import { emitEvent } from "@/shared/lib/socket";

const MessageInput = ({ editingMessage, setEditingMessage }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || {};
  const currentConversation =
    useSelector((state) => state.conversations.currentConversation) || {};

  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const { id, content, originalContent } = editingMessage;

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

  // Xử lý edit message
  const handleEdit = async () => {
    if (!id) return;
    if (!content.trim()) return;
    if (content.trim() === originalContent.trim()) return;

    try {
      await dispatch(editMessageById({ messageId: id, newContent: content })).unwrap();

      setEditingMessage({
        id: null,
        content: "",
      });
    } catch (error) {
      console.error("Edit message error:", error);
    }
  };

  const handleOnchange = (e) => {
    const value = e.target.value;

    if (id) {
      setEditingMessage((prev) => ({
        ...prev,
        content: value,
      }));
    } else {
      setText(value);
    }

    if (!currentConversation._id) return;

    // Emit typing_start ngay khi user gõ
    emitEvent("typing_start", {
      conversationId: currentConversation._id,
    });

    // Clear timeout cũ (nếu có)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout mới cho typing_stop
    typingTimeoutRef.current = setTimeout(() => {
      emitEvent("typing_stop", {
        conversationId: currentConversation._id,
      });
    }, 1000);
  };

  return (
    <div className="flex items-center px-4 py-4 border-t border-[var(--color-border)]">
      {/* Input Message */}
      <div className="flex-1 flex items-center justify-between px-4 py-1 bg-[var(--color-chat)] rounded-full">
        {/* Micro */}
        <button
          className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
        >
          <Mic className="w-5 h-5" />
        </button>

        {/* Input */}
        <input
          value={id ? content : text}
          onChange={handleOnchange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              id ? handleEdit() : handleSend();
            }
          }}
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-[var(--bg-chat)] rounded-full ps-3 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] placeholder:text-xs focus:outline-none"
        />

        {/* Action buttons */}
        {/* Upload */}
        <button
          className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
        >
          <Image className="w-5 h-5" />
        </button>
        {/* Smile */}
        <button
          className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
        >
          <Smile className="w-5 h-5" />
        </button>
        {/* Location */}
        <button
          className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
        >
          <Navigation className="w-5 h-5" />
        </button>
        {/* Map */}
        <button
          className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
