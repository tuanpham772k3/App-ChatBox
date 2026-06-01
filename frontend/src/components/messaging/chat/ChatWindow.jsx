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
  const { conversations, typingUsers, statusUsers, images } = useSelector(
    (state) => state.conversations
  );

  const [openModal, setOpenModal] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const notification = useNotification();

  const currentConversation = conversations.find((c) => c._id === activeChatId);

  const typingNames = useMemo(() => {
    if (!activeChatId) return [];
    if (!currentConversation) return [];

    const typingMap = typingUsers[activeChatId] || {};

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
    if (!activeChatId || !currentUserId) return;
    dispatch(
      togglePinConversation({
        conversationId: activeChatId,
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
    if (!activeChatId || !currentUserId) return;
    dispatch(
      clearConversationHistory({
        conversationId: activeChatId,
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
    if (!activeChatId) return;
    dispatch(leaveGroup(activeChatId))
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
    if (openDrawer === DRAWER.INFO && activeChatId) {
      dispatch(
        getConversationImages({
          conversationId: activeChatId,
          limit: 8,
        })
      )
        .unwrap()
        .catch(console.error);
    }
  }, [openDrawer, activeChatId, dispatch]);

  useEffect(() => {
    if (!activeChatId || !activeChatId) return;

    emitEvent("join_conversation", {
      conversationId: activeChatId,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: activeChatId,
      });
    };
  }, [activeChatId, activeChatId]);

  if (!activeChatId || !currentConversation) return <ChatEmptyState />;

  return (
    <section
      className={`min-w-0 flex-1 flex-col bg-[var(--color-app)] ${
        activeChatId ? "flex" : "hidden md:flex"
      }`}
      aria-label="Active conversation"
    >
      <ChatHeader
        onBack={onBack}
        onOpenConversationInfo={() => setOpenDrawer(DRAWER.INFO)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
        displayInfo={displayInfo}
        typingNames={typingNames}
        isOnline={isOnline}
      />

      <div className="flex-1 min-h-0 overflow-hidden">
        <Messages
          currentUserId={currentUserId}
          activeChatId={activeChatId}
          currentConversation={currentConversation}
          setEditingMessage={setEditingMessage}
        />
      </div>

      <MessageInput
        currentUserId={currentUserId}
        activeChatId={activeChatId}
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
        conversationId={activeChatId}
      />

      <ModalRemoveMembers
        isOpen={openModal === MODAL.REMOVE}
        onCancel={() => setOpenModal(null)}
        conversationId={activeChatId}
        memberId={selectedMemberId}
      />

      <ModalLeaveGroup
        isOpen={openModal === MODAL.LEAVE}
        onClose={() => setOpenModal(null)}
        onLeave={handleLeaveGroup}
        conversationId={activeChatId}
        currentUser={displayInfo?.currentUser}
        members={displayInfo?.participants}
      />
    </section>
  );
};

export default ChatWindow;
