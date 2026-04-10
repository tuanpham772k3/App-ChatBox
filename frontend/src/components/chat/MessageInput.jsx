import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Image, MapPin, Mic, Navigation, Smile } from "lucide-react";
import { Upload } from "antd";
import { emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";
import { createNewMessage, editMessageById } from "@/store/messagesSlice";

const MessageInput = ({ editingMessage, setEditingMessage }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user) || {};
  const currentConversation =
    useSelector((state) => state.conversations.currentConversation) || {};

  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const { id, content, originalContent } = editingMessage;

  const notification = useNotification();

  // Xử lý gửi tin nhắn
  const handleSend = async () => {
    try {
      if (!text.trim()) return;

      // 1. Tạo id message tạm thời
      const tempId = "temp-" + Date.now();

      // 2. Tạo message text
      await dispatch(
        createNewMessage({
          conversationId: currentConversation._id,
          content: text,
          sender: { _id: user.id }, // Để xử lý redux thunk
          tempId,
        })
      ).unwrap();

      setText("");
    } catch (err) {
      notification.error({
        message: "Gửi tin nhắn thất bại",
        description: err.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
    }
  };

  // Xử lý chỉnh sửa tin nhắn
  const handleEdit = async () => {
    try {
      if (!id) return;
      if (!content.trim()) return;
      if (content.trim() === originalContent.trim()) return;

      await dispatch(editMessageById({ messageId: id, newContent: content })).unwrap();

      setEditingMessage({
        id: null,
        content: "",
      });
    } catch (error) {
      notification.error({
        message: "Chỉnh sửa tin nhắn thất bại",
        description: error.message || "Có lỗi xảy ra, vui lòng thử lại",
      });
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

  const handleUploadImage = async ({ file }) => {
    try {
      // 1. Tạo preview local ngay
      const previewUrl = URL.createObjectURL(file);

      // 2. Tạo id message tạm thời
      const tempId = "temp-" + Date.now();

      // 3. Tạo message image
      await dispatch(
        createNewMessage({
          conversationId: currentConversation._id,
          sender: { _id: user.id }, // Để xử lý redux thunk
          tempId,
          file: {
            url: previewUrl, // preview để hiển thị ngay
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            localFile: file, // dùng để upload sau
          },
        })
      ).unwrap();
    } catch (err) {
      notification.error({
        message: "Upload ảnh thất bại",
        description: err.message || "Có lỗi xảy ra",
      });
    }
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
        <Upload showUploadList={false} customRequest={handleUploadImage} accept="image/*">
          <button
            className="w-9 h-9 flex justify-center items-center rounded-full hover:bg-[var(--color-icon-hover-bg)] 
        text-[var(--color-text-secondary)] hover:text-[var(--color-icon-hover-text)]"
          >
            <Image className="w-5 h-5" />
          </button>
        </Upload>

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
