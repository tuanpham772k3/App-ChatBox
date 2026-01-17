import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  showAvatarDivider,
  showDateDivider,
  showSenderName,
  showTimeDivider,
} from "@/shared/lib/utils";
import { deleteMessageById } from "../messagesSlice";
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
  const { currentConversation } = useSelector((state) => state.conversations);
  const { messages = [], loading } = useSelector((state) => state.messages);
  const { user } = useSelector((state) => state.auth);

  const notification = useNotification();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lọc tin nhắn có type = image và chuẩn bị slides cho lightbox
  const imageMessages = messages.filter((msg) => msg.type === "image");
  const lightboxSlides = imageMessages.map((msg) => ({
    src: msg.file.url,
    alt: msg.file.name || "Image",
    download: msg.file.url,
  }));

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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 bg-[var(--color-chat)] custom-scrollbar">
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
