import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import ChatEmptyState from "./ChatEmptyState";
import DrawerConversationInfo from "./DrawerConversationInfo";
import DrawerMembersInfo from "./DrawerMembersInfo";
import DrawerMediaGallery from "./DrawerMediaGallery";
import ModalRemoveMembers from "./ModalRemoveMembers";
import ModalAddMembers from "./ModalAddMembers";
import {
  clearConversationHistory,
  getConversationImages,
  leaveGroup,
  togglePinConversation,
} from "@/store/conversationsSlice";
import { getDisplayInfo } from "@/utils/conversationHelper";
import { emitEvent } from "@/lib/socket";
import ModalLeaveGroup from "./ModalLeaveGroup";
import { useNotification } from "@/hooks/useNotification";

const MODAL = {
  ADD: "addMembers",
  REMOVE: "removeMembers",
  LEAVE: "leaveGroup",
};

const DRAWER = {
  INFO: "conversationInfo",
  MEMBERS: "membersInfo",
  MEDIA: "media",
};

const ChatWindow = ({ activeChatId, onBack }) => {
  const dispatch = useDispatch();

  const currentUserId = useSelector((state) => state.auth.user?.id);
  const { conversations, currentConversationId, typingUsers, statusUsers, images } =
    useSelector((state) => state.conversations);

  const [openModal, setOpenModal] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const notification = useNotification();

  const currentConversation = conversations.find((c) => c._id === currentConversationId);

  const typingNames = useMemo(() => {
    if (!currentConversationId) return [];
    if (!currentConversation) return [];

    const typingMap = typingUsers[currentConversationId] || {};

    return currentConversation.participants
      .filter((p) => typingMap[p.userId._id] && p.userId._id !== currentUserId)
      .map((p) => p.userId.username);
  }, [typingUsers, currentConversation, currentUserId]);

  const displayInfo = useMemo(
    () => getDisplayInfo(currentConversation, currentUserId) || {},
    [currentConversation, currentUserId]
  );

  const partnerStatus = displayInfo.partnerId
    ? statusUsers[displayInfo.partnerId] || displayInfo.partner?.userId
    : null;

  const isOnline = partnerStatus?.presence === "online";

  const handleTogglePinConversation = () => {
    if (!currentConversationId || !currentUserId) return;
    dispatch(
      togglePinConversation({
        conversationId: currentConversationId,
        userId: currentUserId,
      })
    )
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Cập nhật ghim hội thoại thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  const handleClearHistory = () => {
    if (!currentConversationId || !currentUserId) return;
    dispatch(
      clearConversationHistory({
        conversationId: currentConversationId,
        userId: currentUserId,
      })
    )
      .unwrap()
      .then(() => {
        notification.success({ message: "Đã xóa lịch sử trò chuyện" });
      })
      .catch((err) => {
        notification.error({
          message: "Xóa lịch sử trò chuyện thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });

    setOpenDrawer(null);
  };

  const handleLeaveGroup = () => {
    if (!currentConversationId) return;
    dispatch(leaveGroup(currentConversationId))
      .unwrap()
      .then(() => {
        notification.success({ message: "Rời nhóm thành công" });
        setOpenModal(null);
        onBack?.();
      })
      .catch((err) => {
        notification.error({
          message: "Rời nhóm thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  useEffect(() => {
    if (openDrawer === DRAWER.INFO && currentConversationId) {
      dispatch(
        getConversationImages({
          conversationId: currentConversationId,
          limit: 8,
        })
      )
        .unwrap()
        .catch(console.error);
    }
  }, [openDrawer, currentConversationId, dispatch]);

  useEffect(() => {
    if (!activeChatId || !currentConversationId) return;

    emitEvent("join_conversation", {
      conversationId: currentConversationId,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: currentConversationId,
      });
    };
  }, [activeChatId, currentConversationId]);

  if (!activeChatId || !currentConversation) return <ChatEmptyState />;

  return (
    <article
      className="flex flex-col flex-1 bg-[var(--color-app)] overflow-hidden"
      aria-label={`Conversation with ${displayInfo.displayName || "selected contact"}`}
    >
      {/* --- Header --- */}
      <ChatHeader
        onBack={onBack}
        onOpenConversationInfo={() => setOpenDrawer(DRAWER.INFO)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
        displayInfo={displayInfo}
        typingNames={typingNames}
        isOnline={isOnline}
      />

      <Messages
        currentUserId={currentUserId}
        currentConversationId={currentConversationId}
        currentConversation={currentConversation}
        setEditingMessage={setEditingMessage}
      />

      <MessageInput
        currentUserId={currentUserId}
        currentConversationId={currentConversationId}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />

      <DrawerConversationInfo
        open={openDrawer === DRAWER.INFO}
        onClose={() => setOpenDrawer(null)}
        displayInfo={displayInfo}
        onTogglePin={handleTogglePinConversation}
        onClearHistory={handleClearHistory}
        onOpenLeaveGroup={() => setOpenModal(MODAL.LEAVE)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
        onOpenMediaGallery={() => setOpenDrawer(DRAWER.MEDIA)}
        images={images}
      />

      <DrawerMembersInfo
        open={openDrawer === DRAWER.MEMBERS}
        onClose={() => setOpenDrawer(null)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        currentUserId={currentUserId}
        members={displayInfo.participants || []}
        onRemoveMember={(memberId) => {
          setSelectedMemberId(memberId);
          setOpenModal(MODAL.REMOVE);
        }}
      />

      <DrawerMediaGallery
        open={openDrawer === DRAWER.MEDIA}
        onClose={() => setOpenDrawer(DRAWER.INFO)}
        images={images}
      />

      <ModalAddMembers
        isOpen={openModal === MODAL.ADD}
        onCancel={() => setOpenModal(null)}
        conversationId={currentConversation?._id}
      />

      <ModalRemoveMembers
        isOpen={openModal === MODAL.REMOVE}
        onCancel={() => setOpenModal(null)}
        conversationId={currentConversation?._id}
        memberId={selectedMemberId}
      />

      <ModalLeaveGroup
        isOpen={openModal === MODAL.LEAVE}
        onClose={() => setOpenModal(null)}
        onLeave={handleLeaveGroup}
        conversationId={currentConversation?._id}
        currentUser={displayInfo?.currentUser}
        members={displayInfo?.participants}
      />
    </article>
  );
};

export default ChatWindow;
