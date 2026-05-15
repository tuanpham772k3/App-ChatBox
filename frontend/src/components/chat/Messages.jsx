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

import { buildMessageMeta } from "@/utils/messageHelper";

import MessageItem from "./MessageItem";
import { useNotification } from "@/hooks/useNotification";
import {
  clearMessages,
  deleteMessageById,
  fetchConversationMessages,
} from "@/store/messagesSlice";
import { markConversationAsRead } from "@/store/conversationsSlice";

const MessageDateDivider = ({ date }) => {
  const messageDate = new Date(date);

  return (
    <li className="sticky top-0 z-10 flex justify-center py-2 list-none">
      <time
        dateTime={messageDate.toISOString()}
        className="py-1 px-4 bg-gray-400 backdrop-blur rounded-xl text-xs text-white shadow"
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
  activeChatId,
  currentConversation,
  setEditingMessage,
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
  const lastScrollTopRef = useRef(0);
  const initialLoadRef = useRef(true);

  const notification = useNotification();

  // ===== Mark conversation as read =====
  useEffect(() => {
    if (!activeChatId) return;

    dispatch(
      markConversationAsRead({
        conversationId: activeChatId,
        userId: currentUserId,
      })
    )
      .unwrap()
      .catch((error) => {
        console.log("Error marking conversation as read:", error);
      });
  }, [messages, activeChatId, currentUserId, dispatch]);

  // ===== Load initial messages =====
  useEffect(() => {
    if (!activeChatId) return;

    dispatch(clearMessages());

    initialLoadRef.current = true;
    lastScrollTopRef.current = 0;

    dispatch(
      fetchConversationMessages({
        conversationId: activeChatId,
        cursor: null,
      })
    );
  }, [activeChatId, dispatch]);

  // ===== Auto scroll =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0) return;

    // Case 1: load lần đầu: luôn scroll xuống cuối
    if (initialLoadRef.current) {
      el.scrollTop = el.scrollHeight;
      lastScrollTopRef.current = el.scrollTop;
      initialLoadRef.current = false;
      return;
    }

    // Case 2: tự động scroll nếu đang ở gần cuối (trong khoảng 300px)
    const distanceToBottom = el.scrollHeight - el.clientHeight - lastScrollTopRef.current;

    const isNearBottom = distanceToBottom <= 300;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
      lastScrollTopRef.current = el.scrollTop;
    }
  }, [messages]);

  // ===== Infinite scroll (load older messages) =====
  useEffect(() => {
    if (!inView) return;
    if (!hasMore || loading) return;
    if (!activeChatId) return;

    const el = containerRef.current;
    if (!el) return;

    const prevHeight = el.scrollHeight;

    dispatch(
      fetchConversationMessages({
        conversationId: activeChatId,
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
      await dispatch(deleteMessageById(messageId)).unwrap();
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
        className="h-full flex-1 px-4 py-4 space-y-0.5 bg-[var(--color-chat)] overflow-y-auto custom-scrollbar"
      >
        {/* Sentinel for loading older messages */}
        <li ref={topRef} aria-hidden="true" className="h-px" />

        {loading ? (
          <li className="flex justify-center" aria-live="polite">
            <Spin />
          </li>
        ) : (
          messages.length === 0 && (
            <li className="text-center text-sm text-[var(--color-text-secondary)]">
              Chưa có tin nhắn nào
            </li>
          )
        )}

        {messagesWithMeta.map((msg, index) => {
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
              />
            </React.Fragment>
          );
        })}
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

export default React.memo(Messages);
