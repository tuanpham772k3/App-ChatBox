import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useMessages } from "../hooks/useMessages";
import {
  getDisplayInfo,
  getTypingNames,
} from "@/features/conversations/utils/conversationHelper";
import ChatHeader from "./ChatHeader";
import ModalAddMembers from "./modal/ModalAddMembers";
import DrawerConversationInfo from "./drawer/DrawerConversationInfo";
import DrawerMembersInfo from "./drawer/DrawerMembersInfo";
import { clearMessages } from "../messagesSlice";
import { emitEvent } from "@/shared/lib/socket";
import ChatEmptyState from "./ChatEmptyState";
import { getConversationImages } from "@/features/conversations/conversationsSlice";
import DrawerMediaGallery from "./drawer/DrawerMediaGallery";

const ChatWindow = ({ activeChat, onBackToList }) => {
  const dispatch = useDispatch();
  const {
    currentConversation,
    statusUsers = {},
    images = [],
  } = useSelector((state) => state.conversations);
  const user = useSelector((state) => state.auth.user) || {};
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });

  const [openModal, setOpenModal] = useState(false); // "addMembers"
  const [openDrawer, setOpenDrawer] = useState(null); // "conversationInfo" | "membersInfo" | "media" | null

  // typingUsers: { [conversationId]: { [userId]: username } }
  // const currentTypingMap = typingUsers[currentConversation?._id] || {};
  // const typingNames = getTypingNames(currentTypingMap, user.id);

  // Message realtime
  useMessages(activeChat);

  const displayInfo = getDisplayInfo(currentConversation, user.id) || {};
  const partnerStatus = displayInfo.partnerId ? statusUsers[displayInfo.partnerId] : null;

  // Open Modal AddMembers
  const openModalAddMembers = () => setOpenModal(true);
  const closeModalAddMembers = () => setOpenModal(false);
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

  // Clear messages khi activeChat thay đổi
  useEffect(() => {
    dispatch(clearMessages());
  }, [activeChat]);

  useEffect(() => {
    if (!currentConversation?._id) return;

    emitEvent("join_conversation", {
      conversationId: currentConversation._id,
    });

    return () => {
      emitEvent("leave_conversation", {
        conversationId: currentConversation._id,
      });
    };
  }, [currentConversation?._id]);

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
        openModal={openModalAddMembers}
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

      {/* Modal */}
      <ModalAddMembers
        isOpen={openModal}
        onCancel={closeModalAddMembers}
        conversationId={currentConversation?._id}
      />

      {/* Drawer conversation info */}
      <DrawerConversationInfo
        open={openDrawer === "conversationInfo"}
        onClose={closeDrawerInfo}
        displayInfo={displayInfo}
        openDrawerInfo={openDrawerInfo}
        images={images}
      />

      {/* Drawer members info */}
      <DrawerMembersInfo
        open={openDrawer === "membersInfo"}
        onClose={closeDrawerInfo}
        openModal={openModalAddMembers}
        members={displayInfo.participants}
      />

      <DrawerMediaGallery
        open={openDrawer === "media"}
        onClose={() => {
          openDrawerInfo("conversationInfo");
        }}
        images={images}
      />
    </div>
  );
};

export default ChatWindow;
