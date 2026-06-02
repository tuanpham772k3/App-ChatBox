import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import ChatHeader from "../components/messaging/chat/ChatHeader";
import MessageInput from "../components/messaging/chat/MessageInput";
import Messages from "../components/messaging/chat/Messages";
import DrawerConversationInfo from "../components/messaging/chat/DrawerConversationInfo";
import DrawerMembersInfo from "../components/messaging/chat/DrawerMembersInfo";
import DrawerMediaGallery from "../components/messaging/chat/DrawerMediaGallery";
import ModalRemoveMembers from "../components/messaging/chat/ModalRemoveMembers";
import ModalAddMembers from "../components/messaging/chat/ModalAddMembers";

import {
  clearConversationHistory,
  getConversationImages,
  leaveGroup,
  togglePinConversation,
} from "@/store/conversationsSlice";
import { getDisplayInfo } from "@/utils/conversationHelper";
import { emitEvent } from "@/lib/socket";
import ModalLeaveGroup from "../components/messaging/chat/ModalLeaveGroup";
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

const ChatWindow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activeConversationId = useParams().conversationId;

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

  const currentConversation = conversations.find((c) => c._id === activeConversationId);

  const typingNames = useMemo(() => {
    if (!activeConversationId) return [];
    if (!currentConversation) return [];

    const typingMap = typingUsers[activeConversationId] || {};

    return currentConversation.participants
      .filter((p) => typingMap[p.userId._id] && p.userId._id !== currentUserId)
      .map((p) => p.userId.username);
  }, [activeConversationId, typingUsers, currentConversation, currentUserId]);

  const displayInfo = useMemo(
    () => getDisplayInfo(currentConversation, currentUserId) || {},
    [currentConversation, currentUserId]
  );

  const partnerStatus = displayInfo.partnerId
    ? statusUsers[displayInfo.partnerId] || displayInfo.partner?.userId
    : null;

  const isOnline = partnerStatus?.presence === "online";

  const handleTogglePinConversation = () => {
    if (!activeConversationId || !currentUserId) return;
    dispatch(
      togglePinConversation({
        conversationId: activeConversationId,
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
    if (!activeConversationId || !currentUserId) return;
    dispatch(
      clearConversationHistory({
        conversationId: activeConversationId,
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
    if (!activeConversationId) return;
    dispatch(leaveGroup(activeConversationId))
      .unwrap()
      .then(() => {
        navigate("/messages/empty", { replace: true });
        notification.success({ message: "Rời nhóm thành công" });
        setOpenModal(null);
      })
      .catch((err) => {
        notification.error({
          message: "Rời nhóm thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  };

  const handleBackToConversations = () => {
    navigate("/messages", { replace: true });
  };

  useEffect(() => {
    setOpenDrawer(null);
    setOpenModal(null);
    setSelectedMemberId(null);
    setEditingMessage({
      id: null,
      content: "",
      originalContent: "",
    });
  }, [activeConversationId]);

  useEffect(() => {
    if (openDrawer === DRAWER.INFO && activeConversationId) {
      dispatch(
        getConversationImages({
          conversationId: activeConversationId,
          limit: 8,
        })
      )
        .unwrap()
        .catch(console.error);
    }
  }, [openDrawer, activeConversationId, dispatch]);

  useEffect(() => {
    if (!activeConversationId) return;

    emitEvent("join_conversation", {
      conversationId: activeConversationId,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: activeConversationId,
      });
    };
  }, [activeConversationId]);

  return (
    <section
      className={`min-w-0 flex-1 flex-col bg-[var(--color-app)] ${
        activeConversationId ? "flex" : "hidden md:flex"
      }`}
      aria-label="Active conversation"
    >
      <ChatHeader
        onBack={handleBackToConversations}
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
          conversationId={activeConversationId}
          currentConversation={currentConversation}
          setEditingMessage={setEditingMessage}
        />
      </div>

      <MessageInput
        currentUserId={currentUserId}
        conversationId={activeConversationId}
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
        conversationId={activeConversationId}
      />

      <ModalRemoveMembers
        isOpen={openModal === MODAL.REMOVE}
        onCancel={() => setOpenModal(null)}
        conversationId={activeConversationId}
        memberId={selectedMemberId}
      />

      <ModalLeaveGroup
        isOpen={openModal === MODAL.LEAVE}
        onClose={() => setOpenModal(null)}
        onLeave={handleLeaveGroup}
        conversationId={activeConversationId}
        currentUser={displayInfo?.currentUser}
        members={displayInfo?.participants}
      />
    </section>
  );
};

export default ChatWindow;
