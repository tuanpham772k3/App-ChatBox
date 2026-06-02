import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { MessageSquareText } from "lucide-react";
import { Spin } from "antd";
import {
  clearConversationHistory,
  deleteConversationForMe,
  getConversations,
  markConversationAsUnread,
  togglePinConversation,
} from "../../../store/conversationsSlice";
import ConversationHeader from "./ConversationHeader";
import ConversationItem from "./ConversationItem";
import { getDisplayInfo } from "../../../utils/conversationHelper";
import { useNotification } from "@/hooks/useNotification";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalCreatePrivate from "./ModalCreatePrivate";

const ConversationContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeConversationId = useParams().conversationId;

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

  const handleSelectConversation = (nextConversationId) => {
    if (activeConversationId === nextConversationId) return;

    navigate(`/messages/${nextConversationId}`);
  };

  // Xóa hội thoại phía tôi
  const removeConversationForMe = (conversationId) => {
    dispatch(deleteConversationForMe(conversationId))
      .unwrap()
      .then(() => {
        if (activeConversationId === conversationId) {
          navigate("/messages", { replace: true });
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
        if (activeConversationId === conversationId) {
          navigate("/messages", { replace: true });
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
          (p) => p.userId._id === currentUserId
        )?.pinnedAt;
        const bPinned = b.participants.find(
          (p) => p.userId._id === currentUserId
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
      <section
        className={`min-w-0 ${
          activeConversationId ? "hidden md:flex" : "flex"
        } flex-col flex-1 md:flex-none md:w-[min(42vw,22.5rem)] bg-[var(--color-app)] border-r border-[var(--color-border)]`}
        aria-labelledby="conversations-heading"
      >
        {/* --- HEADER --- */}
        <ConversationHeader
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onOpenModal={setModal}
        />

        {/* ---LIST CONVERSATIONS--- */}
        {loading ? (
          <div className="w-full h-full grid place-items-center">
            <Spin />
          </div>
        ) : (
          <section className="min-w-0 flex-1 flex flex-col py-6 overflow-hidden">
            <header className="flex items-center gap-2 px-4 mb-2 text-sm text-[var(--color-text-secondary)]">
              <MessageSquareText size={14} aria-hidden="true" />
              <h2 id="conversations-heading">All Message</h2>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ul className="flex flex-col gap-1 px-2">
                {filteredConversations.length === 0 ? (
                  <li className="text-center text-[var(--color-text-secondary)] mt-8">
                    Chưa có cuộc trò chuyện nào
                  </li>
                ) : (
                  <>
                    {filteredConversations.map((conversation) => {
                      const displayInfo =
                        getDisplayInfo(conversation, currentUserId) || {};

                      // status
                      const partnerStatus = displayInfo.partnerId
                        ? statusUsers[displayInfo.partnerId] ||
                          displayInfo.partner?.userId
                        : null;

                      const isOnline =
                        !displayInfo.isGroup && partnerStatus?.presence === "online";

                      return (
                        // CONVERSATION ITEM
                        <ConversationItem
                          key={conversation._id}
                          isActive={activeConversationId === conversation._id}
                          display={displayInfo}
                          onSelect={() => handleSelectConversation(conversation._id)}
                          onRemove={() => removeConversationForMe(conversation._id)}
                          onTogglePin={() =>
                            handleTogglePinConversation(conversation._id)
                          }
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
          </section>
        )}
      </section>

      <ModalCreateGroup isOpen={modal === "group"} onCancel={() => setModal(null)} />
      <ModalCreatePrivate isOpen={modal === "private"} onCancel={() => setModal(null)} />
    </>
  );
};

export default ConversationContainer;
