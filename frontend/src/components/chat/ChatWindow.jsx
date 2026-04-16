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
import { clearMessages } from "@/store/messagesSlice";
import { getDisplayInfo, getTypingNames } from "@/utils/conversationHelper";
import { useMessages } from "@/hooks/useMessages";
import { emitEvent } from "@/lib/socket";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const dispatch = useDispatch();
  const {
    currentConversation,
    statusUsers = {},
    images = [],
  } = useSelector((state) => state.conversations);
  const currentUserId = useSelector((state) => state.auth.user?.id) || {};

  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const [openModal, setOpenModal] = useState(null); // "addMembers" | "removeMembers"
  const [openDrawer, setOpenDrawer] = useState(null); // "conversationInfo" | "membersInfo" | "media" | null
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // typingUsers: { [conversationId]: { [userId]: username } }
  // const currentTypingMap = typingUsers[currentConversation?._id] || {};
  // const typingNames = getTypingNames(currentTypingMap, user.id);

  // Message realtime
  useMessages(activeChat);

  const displayInfo = useMemo(
    () => getDisplayInfo(currentConversation, currentUserId) || {},
    [currentConversation, currentUserId]
  );
  const partnerStatus = displayInfo.partnerId ? statusUsers[displayInfo.partnerId] : null;

  // Open Modal AddMembers
  const openModalMembers = (type) => setOpenModal(type);
  const closeModalMembers = () => setOpenModal(false);
  // Open Drawer
  const closeDrawerInfo = () => setOpenDrawer(null);
  const openDrawerInfo = async (type) => {
    setOpenDrawer(type);

    if (type === "conversationInfo" && currentConversation?._id) {
      try {
        await dispatch(
          getConversationImages({
            conversationId: currentConversation._id,
            limit: 8,
          })
        ).unwrap();
      } catch (error) {
        console.log("Lỗi lấy danh sách ảnh: ", error);
      }
    }
  };

  // Clear tin nhắn cũ khi chuyển sang cuộc trò chuyện mới
  useEffect(() => {
    dispatch(clearMessages());
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;

    emitEvent("join_conversation", {
      conversationId: activeChat,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: activeChat,
      });
    };
  }, [activeChat]);

  if (!activeChat) return <ChatEmptyState />;

  return (
    <div
      className={`flex-2 bg-[var(--color-app)] flex flex-col overflow-hidden
      ${activeChat ? "flex" : "hidden"} md:flex`}
    >
      {/* {activeChat} */}
      {/* --- Header --- */}
      <ChatHeader
        onBackToList={onBackToList}
        openDrawerInfo={openDrawerInfo}
        openModal={openModalMembers}
        displayInfo={displayInfo}
        partnerStatus={partnerStatus}
      />

      {/* Messages */}
      <Messages setEditingMessage={setEditingMessage} />

      {/* Input Message */}
      <MessageInput
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
      />

      {/* Drawer conversation info */}
      <DrawerConversationInfo
        open={openDrawer === "conversationInfo"}
        onClose={closeDrawerInfo}
        displayInfo={displayInfo}
        openDrawerInfo={openDrawerInfo}
        images={images}
        onBackToList={onBackToList}
      />

      {/* Drawer members info */}
      <DrawerMembersInfo
        open={openDrawer === "membersInfo"}
        onClose={closeDrawerInfo}
        openModal={openModalMembers}
        currentUserId={currentUserId}
        members={displayInfo.participants || []}
        onRemoveMember={(memberId) => {
          setSelectedMemberId(memberId);
          openModalMembers("removeMembers");
        }}
      />

      <DrawerMediaGallery
        open={openDrawer === "media"}
        onClose={() => {
          openDrawerInfo("conversationInfo");
        }}
        images={images}
      />

      {/* === MODAL === */}
      <ModalAddMembers
        isOpen={openModal === "addMembers"}
        onCancel={closeModalMembers}
        conversationId={currentConversation?._id}
      />

      <ModalRemoveMembers
        isOpen={openModal === "removeMembers"}
        onCancel={closeModalMembers}
        conversationId={currentConversation?._id}
        memberId={selectedMemberId}
      />
    </div>
  );
};

export default ChatWindow;
