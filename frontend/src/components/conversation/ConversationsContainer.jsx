import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquareText } from "lucide-react";
import { Spin } from "antd";
import {
  deleteConversationForMe,
  getConversationById,
  getConversations,
  markConversationAsRead,
} from "../../store/conversationsSlice";
import ConversationHeader from "./ConversationHeader";
import ConversationItem from "./ConversationItem";
import { getDisplayInfo } from "../../utils/conversationHelper";
import { useNotification } from "@/hooks/useNotification";

const ConversationContainer = ({ activeChatId, onSelectChat }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const {
    conversations = [],
    typingUsers = {},
    statusUsers = {},
    loading,
  } = useSelector((state) => state.conversations);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");

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
    if (conversationId === activeChatId) return;

    dispatch(getConversationById(conversationId));

    onSelectChat(conversationId); // giữ logic hiển thị ChatWindow

    dispatch(markConversationAsRead({ conversationId, userId: user.id }));
  };

  // Xóa hội thoại phía tôi
  const handleRemoveConversationForMe = (conversationId) => {
    dispatch(deleteConversationForMe(conversationId))
      .unwrap()
      .then(() => {
        notification.success({
          message: "Xóa hội thoại phía tôi thành công",
        });
      })
      .catch((err) => {
        notification.error({
          message: "Xóa hội thoại phía tôi thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Lọc hội thoại
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) return conversations;

    const keyword = searchTerm.toLowerCase();

    return conversations.filter((conversation) => {
      const displayInfo = getDisplayInfo(conversation, user.id);
      if (!displayInfo) return false;

      return (
        displayInfo.displayName?.toLowerCase().includes(keyword) ||
        displayInfo.lastMsgContent?.toLowerCase().includes(keyword)
      );
    });
  }, [conversations, user?.id, searchTerm]);

  return (
    <section
      className={`flex-1 flex flex-col bg-[var(--color-app)] border-r border-[var(--color-border)]
      ${activeChatId ? "hidden" : "flex"} md:flex`}
    >
      {/* --- HEADER --- */}
      <ConversationHeader searchValue={searchInput} onSearchChange={setSearchInput} />

      {/* ---LIST CONVERSATIONS--- */}
      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Spin />
        </div>
      ) : (
        <div className="px-4 py-8">
          {/* Title */}
          <div className="flex items-center gap-2 px-2 mb-2 text-xs text-[var(--color-text-secondary)]">
            <MessageSquareText className="w-3 h-3" />
            <p>Tất cả tin nhắn</p>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-[var(--color-text-secondary)] mt-8">
                Không có cuộc trò chuyện nào
              </div>
            ) : (
              <>
                {filteredConversations.map((conversation) => {
                  const typingInThisConversation = typingUsers[conversation._id] || null;

                  const displayInfo = getDisplayInfo(conversation, user.id) || {};
                  const partnerStatus = displayInfo.partnerId
                    ? statusUsers[displayInfo.partnerId]
                    : null;

                  return (
                    // CONVERSATION ITEM
                    <ConversationItem
                      key={conversation._id}
                      isActive={activeChatId === conversation._id}
                      display={displayInfo}
                      onSelect={() => handleSelectConversation(conversation._id)}
                      onRemoveConversationForMe={() =>
                        handleRemoveConversationForMe(conversation._id)
                      }
                      typingUsers={typingInThisConversation}
                      currentUserId={user.id}
                      partnerStatus={partnerStatus}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default ConversationContainer;
