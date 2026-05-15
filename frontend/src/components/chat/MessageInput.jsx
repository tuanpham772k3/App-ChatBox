import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Image, MapPin, Mic, Navigation, Send, Smile } from "lucide-react";
import { Input, Upload } from "antd";
import { emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";
import { createNewMessage, editMessageById } from "@/store/messagesSlice";

const MessageInput = ({
  currentUserId,
  activeChatId,
  editingMessage,
  setEditingMessage,
}) => {
  const dispatch = useDispatch();

  const [text, setText] = useState("");

  const typingTimeoutRef = useRef(null);

  const notification = useNotification();

  const { id, content, originalContent } = editingMessage;

  const isEditing = Boolean(id);
  const inputValue = isEditing ? content : text;

  // Xử lý gửi tin nhắn
  const sendMessage = async (payload) => {
    try {
      // Idempotency key (KISS): mỗi lần gửi 1 message tạo 1 clientMessageId
      const clientMessageId =
        globalThis.crypto?.randomUUID?.() ??
        `cm_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      // 1. Tạo id message tạm thời
      const tempId = "temp-" + Date.now();

      // 2. Tạo message text
      await dispatch(
        createNewMessage({
          conversationId: activeChatId,
          content: text,
          senderId: { _id: currentUserId }, // Để xử lý redux thunk
          tempId,
          clientMessageId,
          ...payload,
        })
      ).unwrap();
    } catch (err) {
      notification.error({
        message: "Gửi tin nhắn thất bại",
        description: err.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage({
      content: text,
    });

    setText("");
  };

  const handleUploadImage = async ({ file }) => {
    const previewUrl = URL.createObjectURL(file);

    await sendMessage({
      file: {
        url: previewUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        localFile: file,
      },
    });
  };

  // Xử lý chỉnh sửa tin nhắn
  const handleEdit = async () => {
    try {
      if (!content.trim()) return;
      if (content.trim() === originalContent.trim()) return;

      await dispatch(editMessageById({ messageId: id, newContent: content })).unwrap();

      setEditingMessage({
        id: null,
        content: "",
        originalContent: "",
      });
    } catch (error) {
      notification.error({
        message: "Chỉnh sửa tin nhắn thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage({
      id: null,
      content: "",
      originalContent: "",
    });
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

    if (!activeChatId) return;

    emitEvent("typing_start", {
      conversationId: activeChatId,
    });

    // Clear timeout cũ (nếu có)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout mới cho typing_stop
    typingTimeoutRef.current = setTimeout(() => {
      emitEvent("typing_stop", {
        conversationId: activeChatId,
      });
    }, 1000);
  };

  return (
    <form
      className="flex flex-col p-2 sm:p-4 border-t border-[var(--color-border)]"
      aria-label="Message composer"
      onSubmit={(e) => {
        e.preventDefault();
        id ? handleEdit() : handleSend();
      }}
    >
      {/* ====== Editing ====== */}
      {isEditing && (
        <div className="p-2 pb-2 text-sm text-[var(--color-text-secondary)] flex items-center justify-between">
          <span>Đang chỉnh sửa tin nhắn</span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="text-blue-500 hover:underline"
          >
            Hủy
          </button>
        </div>
      )}

      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
        {/* ====== Action ======= */}
        <div className="shrink-0 flex items-center gap-1 overflow-x-auto">
          <Upload
            showUploadList={false}
            customRequest={handleUploadImage}
            accept="image/*"
          >
            <button
              type="button"
              aria-label="Upload image"
              className="flex h-10 w-10 shrink-0 justify-center items-center rounded-full hover:bg-black/10 text-[var(--color-text-secondary)]"
            >
              <Image size={20} />
            </button>
          </Upload>

          <button
            type="button"
            aria-label="Choose emoji"
            className="flex h-10 w-10 shrink-0 justify-center items-center rounded-full hover:bg-black/10 text-[var(--color-text-secondary)]"
          >
            <Smile size={20} />
          </button>
          <button
            type="button"
            aria-label="Send current location"
            className="hidden h-10 w-10 shrink-0 justify-center items-center rounded-full hover:bg-black/10 text-[var(--color-text-secondary)] sm:flex"
          >
            <Navigation size={20} />
          </button>
          <button
            type="button"
            aria-label="Share location pin"
            className="hidden h-10 w-10 shrink-0 justify-center items-center rounded-full hover:bg-black/10 text-[var(--color-text-secondary)] sm:flex"
          >
            <MapPin size={20} />
          </button>
          <button
            type="button"
            aria-label="Record voice message"
            className="hidden h-10 w-10 shrink-0 justify-center items-center rounded-full hover:bg-black/10 text-[var(--color-text-secondary)] md:flex"
          >
            <Mic size={20} />
          </button>
        </div>

        {/* ====== Input ====== */}
        <Input
          value={inputValue}
          aria-label={isEditing ? "Edit message" : "Message"}
          onChange={handleOnchange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              id ? handleEdit() : handleSend();
            }
          }}
          type="text"
          placeholder="Type a message..."
          className="min-w-0 flex-1 bg-[var(--color-app)] rounded-full p-2 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] placeholder:text-xs focus:outline-none"
        />

        {/* ===== SEND BUTTON ===== */}
        <button
          type="submit"
          aria-label={id ? "Save edited message" : "Send message"}
          disabled={!inputValue.trim()}
          className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0
      ${
        inputValue.trim()
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-200 text-gray-400 cursor-not-allowed"
      }`}
        >
          <Send size={20} />
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
