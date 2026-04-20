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
import { getConversationImages } from "@/store/conversationsSlice";
import { getDisplayInfo } from "@/utils/conversationHelper";
import { useMessages } from "@/hooks/useMessages";
import { emitEvent } from "@/lib/socket";
import ModalLeaveGroup from "./ModalLeaveGroup";

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
  const {
    currentConversation,
    typingUsers = {},
    statusUsers = {},
    images = [],
  } = useSelector((state) => state.conversations);
  const currentUserId = useSelector((state) => state.auth.user?.id);

  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const [openModal, setOpenModal] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Message realtime
  useMessages(activeChatId);

  const typingNames = useMemo(() => {
    if (!currentConversation) return [];

    const typingMap = typingUsers[currentConversation._id] || {};

    return currentConversation.participants
      .filter((p) => typingMap[p.user._id] && p.user._id !== currentUserId)
      .map((p) => p.user.username);
  }, [typingUsers, currentConversation, currentUserId]);

  const displayInfo = useMemo(
    () => getDisplayInfo(currentConversation, currentUserId) || {},
    [currentConversation, currentUserId]
  );
  const partnerStatus = displayInfo.partnerId ? statusUsers[displayInfo.partnerId] : null;

  useEffect(() => {
    if (openDrawer === DRAWER.INFO && currentConversation?._id) {
      dispatch(
        getConversationImages({
          conversationId: currentConversation._id,
          limit: 8,
        })
      )
        .unwrap()
        .catch(console.error);
    }
  }, [openDrawer, currentConversation?._id, dispatch]);

  useEffect(() => {
    if (!activeChatId) return;

    emitEvent("join_conversation", {
      conversationId: activeChatId,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: activeChatId,
      });
    };
  }, [activeChatId]);

  if (!activeChatId) return <ChatEmptyState />;

  return (
    <div
      className={`flex-2 bg-[var(--color-app)] flex flex-col overflow-hidden
      ${activeChatId ? "flex" : "hidden"} md:flex`}
    >
      {/* --- Header --- */}
      <ChatHeader
        onBack={onBack}
        onOpenConversationInfo={() => setOpenDrawer(DRAWER.INFO)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
        displayInfo={displayInfo}
        typingNames={typingNames}
        partnerStatus={partnerStatus}
      />

      <Messages setEditingMessage={setEditingMessage} />

      <MessageInput
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />

      <DrawerConversationInfo
        open={openDrawer === DRAWER.INFO}
        onClose={() => setOpenDrawer(null)}
        displayInfo={displayInfo}
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
        conversationId={currentConversation?._id}
        currentUser={displayInfo?.currentUser}
        members={displayInfo?.participants}
      />
    </div>
  );
};

export default ChatWindow;
