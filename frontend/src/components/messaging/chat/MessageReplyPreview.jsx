import React from "react";
import { Image, FileText, Reply } from "lucide-react";

const MessageReplyPreview = ({ replyTo }) => {
  if (!replyTo) return null;

  const renderContent = () => {
    if (replyTo.isDeleted) {
      return (
        <span className="italic text-[var(--color-text-secondary)]">
          Tin nhắn đã bị xóa
        </span>
      );
    }

    switch (replyTo.type) {
      case "image":
        return (
          <span className="flex items-center gap-1 truncate">
            <Image size={14} />
            <span>Hình ảnh</span>
          </span>
        );

      case "file":
        return (
          <span className="flex items-center gap-1 truncate">
            <FileText size={14} />
            <span>{replyTo.file?.filename || "Tệp đính kèm"}</span>
          </span>
        );

      default:
        return <span className="truncate">{replyTo.content}</span>;
    }
  };

  return (
    <div className="mb-2 flex gap-2 rounded-md border-l-4 border-[var(--color-primary)] bg-[var(--color-hover)] px-3 py-2">
      <Reply size={14} className="mt-0.5 shrink-0 text-[var(--color-text-secondary)]" />

      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-[var(--color-primary)]">
          {replyTo.senderId?.displayName || "Người dùng"}
        </div>

        <div className="truncate text-xs text-[var(--color-text-secondary)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default MessageReplyPreview;
