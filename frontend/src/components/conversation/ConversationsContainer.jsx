import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquareText } from "lucide-react";
import { Spin } from "antd";
import {
  clearConversationHistory,
  deleteConversationForMe,
  getConversationById,
  getConversations,
  markConversationAsUnread,
  togglePinConversation,
} from "../../store/conversationsSlice";
import ConversationHeader from "./ConversationHeader";
import ConversationItem from "./ConversationItem";
import { getDisplayInfo } from "../../utils/conversationHelper";
import { useNotification } from "@/hooks/useNotification";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalCreatePrivate from "./ModalCreatePrivate";

const ConversationContainer = ({ activeChatId, onSelectChat, onOpenSidebar }) => {
  const dispatch = useDispatch();

  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { conversations, statusUsers, loading } = useSelector(
    (state) => state.conversations
  );

  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState(null); // "group" | "private" | null

  const notification = useNotification();

  useEffect(() => {
    dispatch(getConversations())
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Lấy danh sách hội thoại thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  }, [dispatch]);

  const handleSelectConversation = (conversationId) => {
    if (activeChatId === conversationId) return;

    onSelectChat(conversationId);

    dispatch(getConversationById(conversationId))
      .unwrap()
      .catch((err) => {
        console.log("Error fetching conversation:", err);
      });
  };

  // Xóa hội thoại phía tôi
  const removeConversationForMe = (conversationId) => {
    dispatch(deleteConversationForMe(conversationId))
      .unwrap()
      .then(() => {
        if (activeChatId === conversationId) {
          onSelectChat(null);
        }
        notification.success({
          message: "Đã xóa hội thoại",
        });
      })
      .catch((err) => {
        notification.error({
          message: "Xóa hội thoại phía tôi thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  const handleTogglePinConversation = (conversationId) => {
    dispatch(togglePinConversation({ conversationId, userId: currentUserId }))
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Cập nhật ghim hội thoại thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  const handleMarkConversationUnread = (conversationId) => {
    dispatch(markConversationAsUnread({ conversationId, userId: currentUserId }))
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Đánh dấu chưa đọc thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  const handleClearConversationHistory = (conversationId) => {
    dispatch(clearConversationHistory({ conversationId, userId: currentUserId }))
      .unwrap()
      .then(() => {
        if (activeChatId === conversationId) {
          onSelectChat(null);
        }
        notification.success({ message: "Đã xóa lịch sử trò chuyện" });
      })
      .catch((err) => {
        notification.error({
          message: "Xóa lịch sử trò chuyện thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  // Lọc hội thoại
  const filteredConversations = useMemo(() => {
    const sortByPinned = (list) =>
      [...list].sort((a, b) => {
        const aPinned = a.participants.find(
          (p) => p.user._id === currentUserId
        )?.pinnedAt;
        const bPinned = b.participants.find(
          (p) => p.user._id === currentUserId
        )?.pinnedAt;
        if (aPinned && bPinned) return new Date(bPinned) - new Date(aPinned);
        if (aPinned) return -1;
        if (bPinned) return 1;
        return 0;
      });

    const trimmed = searchInput.trim();
    if (!trimmed) {
      return sortByPinned(conversations);
    }

    const keyword = trimmed.toLowerCase();

    const results = conversations.filter((conversation) => {
      const displayInfo = getDisplayInfo(conversation, currentUserId);
      if (!displayInfo) return false;

      return displayInfo.displayName?.toLowerCase().includes(keyword);
    });
    return sortByPinned(results);
  }, [conversations, currentUserId, searchInput]);

  return (
    <>
      <section className="flex flex-col w-full bg-[var(--color-app)] border-r border-[var(--color-border)] overflow-hidden">
        {/* --- HEADER --- */}
        <ConversationHeader
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onOpenModal={setModal}
          onOpenSidebar={onOpenSidebar}
        />

        {/* ---LIST CONVERSATIONS--- */}
        {loading ? (
          <div className="w-full h-full grid place-items-center">
            <Spin />
          </div>
        ) : (
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
            {/* Title */}
            <div className="flex items-center gap-2 px-2 mb-2 text-sm text-[var(--color-text-secondary)]">
              <MessageSquareText size={14} />
              <span>All Message</span>
            </div>

            {/* List conversations */}
            <ul className="flex flex-col gap-2 min-w-0">
              {filteredConversations.length === 0 ? (
                <div className="text-center text-[var(--color-text-secondary)] mt-8">
                  Chưa có cuộc trò chuyện nào
                </div>
              ) : (
                <>
                  {filteredConversations.map((conversation) => {
                    const displayInfo = getDisplayInfo(conversation, currentUserId) || {};

                    // status
                    const partnerStatus = displayInfo.partnerId
                      ? statusUsers[displayInfo.partnerId] || displayInfo.partner.user
                      : null;

                    const isOnline =
                      !displayInfo.isGroup && partnerStatus?.presence === "online";

                    return (
                      // CONVERSATION ITEM
                      <ConversationItem
                        key={conversation._id}
                        isActive={activeChatId === conversation._id}
                        display={displayInfo}
                        onSelect={() => handleSelectConversation(conversation._id)}
                        onRemove={() => removeConversationForMe(conversation._id)}
                        onTogglePin={() => handleTogglePinConversation(conversation._id)}
                        onMarkUnread={() =>
                          handleMarkConversationUnread(conversation._id)
                        }
                        onClearHistory={() =>
                          handleClearConversationHistory(conversation._id)
                        }
                        isOnline={isOnline}
                      />
                    );
                  })}
                </>
              )}
            </ul>
          </div>
        )}
      </section>

      <ModalCreateGroup isOpen={modal === "group"} onCancel={() => setModal(null)} />
      <ModalCreatePrivate isOpen={modal === "private"} onCancel={() => setModal(null)} />
    </>
  );
};

export default ConversationContainer;
