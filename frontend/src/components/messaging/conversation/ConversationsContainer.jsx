import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Spin } from "antd";

import { getConversations } from "@/store/conversationsSlice";

import ConversationHeader from "./ConversationHeader";
import ConversationItem from "./ConversationItem";
import ModalCreateGroup from "./ModalCreateGroup";
import ModalAddFriend from "./ModalAddFriend";

import { mapConversationForDisplay } from "@/utils/conversationMapper";
import { useNotification } from "@/hooks/useNotification";
import ConversationItemSkeleton from "./ConversationListSkeleton";
import ConversationListSkeleton from "./ConversationListSkeleton";

const CATEGORY = {
  ALL: "all",
  FRIEND: "friend",
  GROUP: "group",
  STRANGER: "stranger",
};

const ConversationContainer = () => {
  const dispatch = useDispatch();
  const activeConversationId = useParams().conversationId;

  const currentUserId = useSelector((state) => state.user.currentUser?._id);
  const { conversations, loading } = useSelector((state) => state.conversations);

  const [category, setCategory] = useState(CATEGORY.ALL);
  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState(null); // "group" | "private" | null

  const notification = useNotification();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        await dispatch(getConversations()).unwrap();
      } catch (error) {
        notification.error({
          message: "Lấy danh sách hội thoại thất bại",
          description: error.message || "Có lỗi xảy ra",
        });
      }
    };

    fetchConversations();
  }, [dispatch]);

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

    let results = conversations;

    // filter category
    if (category === CATEGORY.ALL) {
      results = results.filter((conversation) =>
        ["friend", "group"].includes(conversation.conversationCategory)
      );
    } else {
      results = results.filter(
        (conversation) => conversation.conversationCategory === category
      );
    }

    // search
    const trimmed = searchInput.trim();

    if (trimmed) {
      const keyword = trimmed.toLowerCase();

      results = results.filter((conversation) => {
        const displayInfo = mapConversationForDisplay(conversation, currentUserId);

        return displayInfo?.displayName?.toLowerCase().includes(keyword);
      });
    }

    return sortByPinned(results);
  }, [conversations, currentUserId, searchInput, category]);

  return (
    <>
      <section
        className={`min-w-0 ${
          activeConversationId ? "hidden md:flex" : "flex"
        } flex-col flex-1 md:flex-none md:w-[min(42vw,22.5rem)]
        bg-[var(--color-app)] border-r border-[var(--color-border)]`}
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
          <ConversationListSkeleton />
        ) : (
          <div className="min-w-0 flex pt-6 overflow-hidden">
            <section className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <nav aria-label="Lọc hội thoại" className="flex gap-2 px-4 mb-2">
                <button
                  type="button"
                  onClick={() => setCategory(CATEGORY.ALL)}
                  className={`flex-1 px-3 py-1 text-sm rounded-full ${
                    category === CATEGORY.ALL
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  Tất cả
                </button>

                <button
                  type="button"
                  onClick={() => setCategory(CATEGORY.FRIEND)}
                  className={`flex-1 px-3 py-1 text-sm rounded-full ${
                    category === CATEGORY.FRIEND
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  Bạn bè
                </button>
                <button
                  type="button"
                  onClick={() => setCategory(CATEGORY.GROUP)}
                  className={`flex-1 px-3 py-1 text-sm rounded-full ${
                    category === CATEGORY.GROUP
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  Nhóm
                </button>
                <button
                  type="button"
                  onClick={() => setCategory(CATEGORY.STRANGER)}
                  className={`whitespace-nowrap flex-1 px-3 py-1 text-sm rounded-full ${
                    category === CATEGORY.STRANGER
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-primary)]"
                  }`}
                >
                  Người lạ
                </button>
              </nav>

              <ul className="flex-1 flex flex-col gap-1 px-2">
                {filteredConversations.length === 0 ? (
                  <li className="text-center text-[var(--color-text-secondary)] mt-8">
                    Chưa có cuộc trò chuyện nào
                  </li>
                ) : (
                  <>
                    {filteredConversations.map((conversation) => (
                      <ConversationItem
                        key={conversation._id}
                        conversation={conversation}
                        currentUserId={currentUserId}
                        activeConversationId={activeConversationId}
                      />
                    ))}
                  </>
                )}
              </ul>
            </section>
          </div>
        )}
      </section>

      <ModalCreateGroup isOpen={modal === "group"} onCancel={() => setModal(null)} />
      <ModalAddFriend isOpen={modal === "private"} onCancel={() => setModal(null)} />
    </>
  );
};

export default ConversationContainer;
