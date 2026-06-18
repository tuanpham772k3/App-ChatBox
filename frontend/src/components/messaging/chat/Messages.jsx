import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import { useInView } from "react-intersection-observer";

import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

import { clearMessages, fetchConversationMessages } from "@/store/messagesSlice";
import { syncReadStatusRealtime } from "@/store/conversationsSlice";
import { buildMessageMeta } from "@/utils/messageHelper";
import { emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";
import messagesApi from "@/services/messagesApi";
import MessageItem from "./MessageItem";

const MessageDateDivider = ({ date }) => {
  const messageDate = new Date(date);

  return (
    <li className="sticky top-0 z-10 flex justify-center py-2 list-none">
      <time
        dateTime={messageDate.toISOString()}
        className="py-1 px-4 bg-[var(--color-status)] backdrop-blur rounded-xl text-xs text-white shadow"
      >
        {messageDate.toLocaleDateString([], {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </time>
    </li>
  );
};

const Messages = ({
  currentUserId,
  conversationId,
  currentConversation,
  setEditingMessage,
  onSelectAvatarUser,
  onCreateFriendRequest,
  onAcceptFriendRequest,
}) => {
  const dispatch = useDispatch();
  const { ref: topRef, inView } = useInView({
    threshold: 0,
    rootMargin: "100px",
  }); // sentinel observer

  const { messages, cursor, hasMore, loading } = useSelector((state) => state.messages);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const containerRef = useRef(null);
  const initialLoadRef = useRef(true);
  const lastReadAtRef = useRef(null);

  const notification = useNotification();

  const relationshipStatus = currentConversation?.relationship?.status;

  // ===== Load initial messages =====
  useEffect(() => {
    if (!conversationId) return;

    dispatch(clearMessages());

    initialLoadRef.current = true;
    lastReadAtRef.current = null;

    dispatch(
      fetchConversationMessages({
        conversationId: conversationId,
        cursor: null,
      })
    );
  }, [conversationId, dispatch]);

  // ===== Read pointer: server is source of truth, client emits latest seen message =====
  useEffect(() => {
    if (!conversationId || !currentUserId || messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    if (!latestMessage?._id || latestMessage.isTemp) return;
    if (lastReadAtRef.current === latestMessage.createdAt) return;

    lastReadAtRef.current = latestMessage.createdAt;

    emitEvent("message:mark_seen", { messageId: latestMessage._id });

    dispatch(
      syncReadStatusRealtime({
        conversationId: conversationId,
        userId: currentUserId,
        lastReadAt: latestMessage.createdAt,
      })
    );
  }, [conversationId, currentUserId, dispatch, messages]);

  // ===== Auto scroll =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0) return;

    // Case 1: load lần đầu: luôn scroll xuống cuối
    if (initialLoadRef.current) {
      el.scrollTop = el.scrollHeight;
      initialLoadRef.current = false;
      return;
    }

    // Case 2: tự động scroll nếu đang ở gần cuối (trong khoảng 300px)
    const distanceToBottom = el.scrollHeight - el.clientHeight - el.scrollTop;

    const isNearBottom = distanceToBottom <= 500;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // ===== Infinite scroll (load older messages) =====
  useEffect(() => {
    if (!inView) return;
    if (!hasMore || loading) return;
    if (!conversationId) return;

    const el = containerRef.current;
    if (!el) return;

    const prevHeight = el.scrollHeight;

    dispatch(
      fetchConversationMessages({
        conversationId: conversationId,
        cursor,
      })
    )
      .unwrap()
      .then(() => {
        const newHeight = el.scrollHeight;

        // giữ vị trí scroll
        el.scrollTop += newHeight - prevHeight;
      })
      .catch((error) => {
        notification.error({
          message: "Lấy danh sách tin nhắn thất bại",
          description: error.message || "Có lỗi xảy ra",
        });
      });
  }, [inView]);

  // ===== Actions =====
  const handleDeleteMessage = async (messageId) => {
    try {
      await messagesApi.deleteMessageById(messageId);
    } catch (error) {
      notification.error({
        message: "Gỡ tin nhắn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleEditClick = (msg) => {
    setEditingMessage({
      id: msg._id,
      content: msg.content,
      originalContent: msg.content,
    });
  };

  // ===== Lightbox =====
  const imageMessages = useMemo(
    () => messages.filter((msg) => msg.type === "image"),
    [messages]
  );

  const lightboxSlides = useMemo(
    () =>
      imageMessages.map((msg) => ({
        src: msg.file?.url,
        alt: msg.file?.name || "Image",
        download: msg.file?.url,
      })),
    [imageMessages]
  );

  const handlePreviewImage = (clickedMsg) => {
    const index = imageMessages.findIndex((m) => m._id === clickedMsg._id);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Build message metadata
  const messagesWithMeta = useMemo(() => {
    return buildMessageMeta(messages, currentUserId);
  }, [messages, currentUserId]);

  return (
    <>
      <ul
        ref={containerRef}
        aria-label="Messages"
        className="h-full px-4 py-4 bg-[var(--color-chat)] overflow-y-auto custom-scrollbar"
      >
        {relationshipStatus && relationshipStatus !== "friend" && (
          <li>
            <div
              className="h-10 flex items-center justify-between px-6
              bg-[var(--color-app)] text-[var(--color-text-primary)]"
            >
              {relationshipStatus === "not_friend" ? (
                <>
                  <span className="text-[13px]">Người này có đủ trình không?</span>
                  <button
                    type="button"
                    onClick={onCreateFriendRequest}
                    className="text-sm py-1 px-4 bg-[var(--color-surface)]
                    hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
                  >
                    Chiêu mộ
                  </button>
                </>
              ) : relationshipStatus === "pending_sent" ? (
                <span className="text-[13px]">
                  Bạn đã cho người khác cơ hội làm bạn với mình
                </span>
              ) : relationshipStatus === "pending_received" ? (
                <>
                  <span className="text-[13px]">
                    Người này đang van xin được kết bạn với bạn
                  </span>

                  <button
                    type="button"
                    onClick={onAcceptFriendRequest}
                    className="text-sm py-1 px-4 bg-[var(--color-surface)]
                    hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
                  >
                    Cho phép
                  </button>
                </>
              ) : relationshipStatus === "blocked_by_me" ? (
                <>
                  <span className="text-[13px]">Bạn đã ghét họ</span>

                  <button
                    type="button"
                    className="text-sm py-1 px-4 bg-[var(--color-surface)]
                    hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
                  >
                    Bỏ ghét
                  </button>
                </>
              ) : relationshipStatus === "blocked_by_other" ? (
                <span className="text-[13px]">Bạn đã bị người này tẩy chay</span>
              ) : null}
            </div>
          </li>
        )}

        {/* Sentinel for loading older messages */}
        <li ref={topRef} aria-hidden="true" className="h-px" />

        {loading ? (
          <li className="flex justify-center" aria-live="polite">
            <Spin />
          </li>
        ) : messages.length === 0 ? (
          <li className="text-center text-sm text-[var(--color-text-secondary)]">
            Chưa có tin nhắn nào
          </li>
        ) : (
          messagesWithMeta.map((msg, index) => {
            return (
              <React.Fragment key={msg._id}>
                {msg.meta.showDate && <MessageDateDivider date={msg.createdAt} />}
                <MessageItem
                  msg={msg}
                  currentUserId={currentUserId}
                  currentConversation={currentConversation}
                  isMine={msg.meta.isMine}
                  showTime={msg.meta.showTime}
                  showName={msg.meta.showName}
                  showAvatar={msg.meta.showAvatar}
                  isLastMessage={index === messages.length - 1}
                  onPreviewImage={handlePreviewImage}
                  onDeleteMessage={handleDeleteMessage}
                  onEditClick={handleEditClick}
                  onSelectAvatarUser={onSelectAvatarUser}
                />
              </React.Fragment>
            );
          })
        )}
      </ul>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Zoom, Download, Thumbnails]}
      />
    </>
  );
};

export default Messages;
