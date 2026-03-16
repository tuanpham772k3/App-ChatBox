import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  showAvatarDivider,
  showDateDivider,
  showSenderName,
  showTimeDivider,
} from "@/shared/lib/utils";
import {
  clearMessages,
  deleteMessageById,
  fetchConversationMessages,
} from "../messagesSlice";
import MessageItem from "./MessageItem";
import { Spin } from "antd";
import { useNotification } from "@/shared/hooks/useNotification";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Download from "yet-another-react-lightbox/plugins/download";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const Messages = ({ setEditingMessage }) => {
  const dispatch = useDispatch();
  const containerRef = useRef();
  const lastScrollTopRef = useRef(0);
  const initialLoadRef = useRef(true);

  const { currentConversation } = useSelector((state) => state.conversations);
  const {
    messages = [],
    cursor,
    hasMore,
    loading,
  } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const notification = useNotification();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lọc tin nhắn có type = image và chuẩn bị slides cho lightbox
  const imageMessages = messages.filter((msg) => msg.type === "image");
  const lightboxSlides = imageMessages.map((msg) => ({
    src: msg.file?.url,
    alt: msg.file?.name || "Image",
    download: msg.file?.url,
  }));

  // Lấy danh sách tin nhắn ban đầu
  useEffect(() => {
    if (!currentConversation?._id) return;

    dispatch(clearMessages());

    // Đánh dấu đây là lần load đầu tiên của cuộc trò chuyện mới
    initialLoadRef.current = true;
    lastScrollTopRef.current = 0;

    dispatch(
      fetchConversationMessages({
        conversationId: currentConversation._id,
        cursor: null,
      })
    );
  }, [currentConversation?._id, dispatch]);

  // Tự động cuộn xuống cuối danh sách
  useEffect(() => {
    const el = containerRef.current; // tham chiếu đến DOM element của container messages
    if (!el || messages.length === 0) return;

    // Lần load đầu khi vừa mở cuộc trò chuyện → luôn cuộn xuống tin mới nhất
    if (initialLoadRef.current) {
      el.scrollTop = el.scrollHeight;
      lastScrollTopRef.current = el.scrollTop;
      initialLoadRef.current = false;
      return;
    }

    // Các lần update sau:
    // Chỉ auto scroll nếu user đang ở gần cuối (đang đọc tin mới)
    const distanceToBottom =
      el.scrollHeight - el.clientHeight - lastScrollTopRef.current;
    const isNearBottom = distanceToBottom <= 500;

    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
      lastScrollTopRef.current = el.scrollTop;
    }
  }, [messages]);

  // Scroll load thêm
  const handleScroll = async () => {
    const el = containerRef.current;
    if (!el) return;

    const currentScrollTop = el.scrollTop; // vị trí scroll hiện tại
    const lastScrollTop = lastScrollTopRef.current; // vị trí scroll lần trước

    // Đang cuộn lên (hướng về đầu danh sách) nếu scrollTop giảm
    const isScrollingUp = currentScrollTop < lastScrollTop;

    if (isScrollingUp && currentScrollTop < 50 && hasMore && !loading) {
      const prevHeight = el.scrollHeight;
      try {
        await dispatch(
          fetchConversationMessages({
            conversationId: currentConversation._id,
            cursor,
          })
        ).unwrap();
      } catch (error) {
        notification.error({
          message: "Lấy danh sách tin nhắn thất bại",
          description: error.message || "Có lỗi xảy ra",
        });
      }

      // HARD PART:
      // giữ vị trí scroll
      const newHeight = el.scrollHeight;
      el.scrollTop += newHeight - prevHeight;
    }

    // Lưu lại vị trí scroll hiện tại cho lần so sánh sau
    lastScrollTopRef.current = currentScrollTop;
  };

  // Xử lý thu hồi tin nhắn
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

  // Xử lý lấy thông tin mes khi click chỉnh sửa
  const handleEditClick = (msg) => {
    setEditingMessage({
      id: msg._id,
      content: msg.content,
      originalContent: msg.content,
    });
  };

  // Xử lý mở lightbox
  const handlePreviewImage = (clickedMsg) => {
    const index = imageMessages.findIndex((m) => m._id === clickedMsg._id);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-[var(--color-chat)] custom-scrollbar"
      >
        {loading && (
          <div className="flex justify-center">
            <Spin />
          </div>
        )}

        {messages.length === 0 && !loading && (
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Chưa có tin nhắn nào
          </p>
        )}

        {/* ===== List Messages ===== */}
        {messages.map((msg, index) => {
          const isMine = msg.sender?._id === user.id; // Tin của tôi
          const prevMsg = messages[index - 1]; // Tin nhắn trước
          const nextMsg = messages[index + 1]; // Tin nhắn sau

          // Xử lý show timestamp, tên người gửi
          const showDate = showDateDivider(prevMsg, msg);
          const showTime = showTimeDivider(msg, nextMsg);
          const showName = showSenderName(prevMsg, msg, user.id);
          const showAvatar = showAvatarDivider(prevMsg, msg, user.id);
          // Nếu tin nhắn cuối = true
          const isLastMessage = index === messages.length - 1;

          return (
            <MessageItem
              key={msg._id}
              msg={msg}
              isMine={isMine}
              showDate={showDate}
              showTime={showTime}
              showName={showName}
              showAvatar={showAvatar}
              isLastMessage={isLastMessage}
              onPreviewImage={handlePreviewImage}
              conversation={currentConversation}
              currentUserId={user.id}
              onDeleteMessage={handleDeleteMessage}
              onEditClick={handleEditClick}
            />
          );
        })}
      </div>

      {/* Lightbox Preview */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
        plugins={[Zoom, Download, Thumbnails]}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        thumbnails={{
          position: "bottom",
          width: 50,
          height: 50,
          border: 1,
          borderRadius: 4,
          padding: 0,
          gap: 16,
        }}
        carousel={{
          finite: false,
          preload: 2,
        }}
        animation={{
          fade: 250,
          swipe: 500,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        styles={{
          container: { backgroundColor: "rgba(0, 0, 0, 0.95)" },
        }}
      />
    </>
  );
};

export default Messages;
