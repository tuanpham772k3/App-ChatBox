import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Pin } from "lucide-react";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import PopoverConversationAction from "./PopoverConversationActions";
import { mapConversationForDisplay } from "@/utils/conversationMapper";
import {
  clearConversationHistory,
  deleteConversationForMe,
  markConversationAsUnread,
  togglePinConversation,
} from "@/store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import { clearMessages } from "@/store/messagesSlice";

const ConversationItem = ({ conversation, currentUserId, activeConversationId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const notification = useNotification();

  const display = mapConversationForDisplay(conversation, currentUserId) || {};
  const isActive = activeConversationId === conversation._id;

  // Chọn hội thoại
  const handleSelectConversation = () => {
    if (isActive) return;

    navigate(`/chat/${conversation._id}`);
  };

  // Xóa hội thoại phía tôi
  const handleRemoveConversationForMe = async () => {
    try {
      await dispatch(deleteConversationForMe(conversation._id)).unwrap();

      if (isActive) {
        navigate("/chat", { replace: true });
      }

      notification.success({
        message: "Đã xóa hội thoại",
      });
    } catch (error) {
      notification.error({
        message: "Xóa hội thoại phía tôi thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  // Ghim hoặc bỏ ghim hội thoại
  const handleTogglePin = async () => {
    try {
      await dispatch(
        togglePinConversation({ conversationId: conversation._id, userId: currentUserId })
      ).unwrap();
    } catch (error) {
      notification.error({
        message: "Cập nhật ghim hội thoại thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  // Đánh dấu hội thoại là chưa đọc
  const handleMarkAsUnread = async () => {
    try {
      await dispatch(
        markConversationAsUnread({
          conversationId: conversation._id,
          userId: currentUserId,
        })
      ).unwrap();
    } catch (error) {
      notification.error({
        message: "Đánh dấu chưa đọc thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  // Xóa lịch sử trò chuyện
  const handleClearHistory = async () => {
    try {
      await dispatch(clearConversationHistory(conversation._id)).unwrap();

      dispatch(clearMessages());
      notification.success({ message: "Đã xóa lịch sử trò chuyện" });
    } catch (error) {
      notification.error({
        message: "Xóa lịch sử trò chuyện thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <li
      className={`group min-w-0 max-w-full flex-1 flex items-center justify-between px-2 py-3 cursor-pointer rounded-lg transition-colors ${
        isActive
          ? "bg-[var(--color-primary)]/10"
          : "hover:bg-[var(--color-hover)] focus:bg-[var(--color-primary)]/10"
      }`}
    >
      <button
        type="button"
        onClick={handleSelectConversation}
        className="min-w-0 flex flex-1 items-center gap-3 text-left"
      >
        {/* Avatar */}
        <span className="relative shrink-0">
          {display?.isGroup ? (
            <GroupAvatar users={display?.members || []} size={50} />
          ) : (
            <UserAvatar
              name={display?.displayName || "Người dùng"}
              avatarUrl={display?.displayAvatar}
              size={50}
            />
          )}

          {display?.isOnline && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--color-app)] rounded-full"
              aria-label="Online"
            />
          )}
        </span>

        {/* Name + LastMessage */}
        <span className="flex-1 flex flex-col gap-1 min-w-0 text-left">
          <span
            className={`truncate text-sm text-[var(--color-text-primary)] ${
              display?.unreadCount > 0 && "font-medium"
            }`}
          >
            {display?.displayName}
          </span>

          <span
            className={`truncate text-xs shrink-0 ${
              display?.unreadCount > 0
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)]"
            }`}
          >
            {display?.lastMsgSender ? (
              <>
                {display.lastMsgSender}: <span>{display.lastMsgContent}</span>
              </>
            ) : (
              display?.lastMsgContent
            )}
          </span>
        </span>
      </button>

      <div
        onClick={handleSelectConversation}
        className="min-w-7 flex shrink-0 flex-col items-end gap-1"
      >
        {/* Top row */}
        <div className="relative w-full flex items-center justify-end">
          <time className="touch-hide whitespace-nowrap text-[11px] text-[var(--color-text-secondary)] hidden lg:block lg:group-hover:opacity-0 transition-opacity duration-150">
            {display?.lastMsgTime}
          </time>

          <div className="touch-always-visible lg:absolute lg:right-0 flex items-center justify-center lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-150">
            <PopoverConversationAction
              isPinned={display?.isPinned}
              onTogglePin={handleTogglePin}
              onMarkUnread={handleMarkAsUnread}
              onClearHistory={handleClearHistory}
              onRemove={handleRemoveConversationForMe}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="min-h-5 flex items-center gap-1">
          {display?.isPinned && (
            <span className="text-[var(--color-primary)] shrink-0" title="Đã ghim">
              <Pin size={14} className="rotate-45" />
            </span>
          )}

          {display?.unreadCount > 0 && (
            <span className="min-w-5 h-5 px-1 text-[10px] flex items-center justify-center rounded-full bg-red-600 text-white font-medium">
              {display?.unreadCount > 99 ? "99+" : display?.unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default ConversationItem;
