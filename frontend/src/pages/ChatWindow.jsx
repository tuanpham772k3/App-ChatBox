import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import ChatHeader from "../components/messaging/chat/ChatHeader";
import MessageInput from "../components/messaging/chat/MessageInput";
import Messages from "../components/messaging/chat/Messages";
import DrawerConversationInfo from "../components/messaging/chat/DrawerConversationInfo";
import DrawerMembersInfo from "../components/messaging/chat/DrawerMembersInfo";
import ModalAddMembers from "../components/messaging/chat/ModalAddMembers";

import {
  clearConversationHistory,
  createPrivateConversation,
  getConversationDetail,
  setActiveConversation,
  togglePinConversation,
} from "@/store/conversationsSlice";
import { mapConversationForDisplay } from "@/utils/conversationMapper";
import { emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";
import { getUserDetail } from "@/store/userSlice";
import ModalUserProfile from "@/components/community/ModalUserProfile";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  createFriendRequest,
} from "@/store/relationshipSlice";
import { clearMessages } from "@/store/messagesSlice";

const MODAL = {
  ADD: "add_members",
  PROFILE: "user_profile",
};

const DRAWER = {
  INFO: "conversation_info",
  MEMBERS: "members_info",
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const activeConversationId = useParams().conversationId;

  const currentUserId = useSelector((state) => state.user.currentUser?._id);
  const { currentConversation, typingUsers } = useSelector(
    (state) => state.conversations
  );

  const [openModal, setOpenModal] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
    originalContent: "",
  });
  const [replyingMessage, setReplyingMessage] = useState({
    id: null,
    senderName: "",
    originalContent: "",
  });

  const notification = useNotification();

  const displayInfo = useMemo(
    () => mapConversationForDisplay(currentConversation, currentUserId) || {},
    [currentConversation, currentUserId]
  );

  const typingNames = useMemo(() => {
    if (!activeConversationId) return [];
    if (!displayInfo.members?.length) return [];

    const typingMap = typingUsers[activeConversationId] || {};

    return displayInfo.members
      .filter((member) => typingMap[member.id] && member.id !== currentUserId)
      .map((member) => member.displayName);
  }, [activeConversationId, typingUsers, displayInfo.members, currentUserId]);

  // join conversation
  useEffect(() => {
    if (!activeConversationId) return;

    emitEvent("conversation:join", {
      conversationId: activeConversationId,
    });

    dispatch(setActiveConversation(activeConversationId));

    return () => {
      emitEvent("conversation:leave", {
        conversationId: activeConversationId,
      });

      dispatch(setActiveConversation(null));

      setEditingMessage({
        id: null,
        content: "",
        originalContent: "",
      });
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;

    const fetchConversationDetail = async () => {
      try {
        await dispatch(getConversationDetail(activeConversationId)).unwrap();
      } catch (error) {
        notification.error({
          message: "Lấy thông tin hội thoại thất bại",
          description: error.message || "Có lỗi xảy ra",
        });
      }
    };

    fetchConversationDetail();
  }, [activeConversationId, dispatch]);

  const handleTogglePinConversation = async () => {
    if (!activeConversationId || !currentUserId) return;

    try {
      await dispatch(
        togglePinConversation({
          conversationId: activeConversationId,
          userId: currentUserId,
        })
      ).unwrap();
    } catch (error) {
      notification.error({
        message: "Cập nhật ghim hội thoại thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleClearHistory = async () => {
    if (!activeConversationId || !currentUserId) return;
    try {
      await dispatch(clearConversationHistory(activeConversationId)).unwrap();

      dispatch(clearMessages());
    } catch (error) {
      notification.error({
        message: "Xóa lịch sử trò chuyện thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }

    setOpenDrawer(null);
  };

  const handleCreateFriendRequest = async (e, userId) => {
    e?.stopPropagation?.();
    try {
      await dispatch(createFriendRequest(userId || displayInfo?.partnerId)).unwrap();
      notification.success({
        message: "Đã gửi yêu cầu kết bạn",
      });
    } catch (error) {
      notification.error({
        message: "Đã gửi yêu cầu kết bạn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleAcceptFriendRequest = async (e, relationshipId) => {
    e?.stopPropagation?.();
    try {
      await dispatch(
        acceptFriendRequest(relationshipId || currentConversation?.relationship?._id)
      ).unwrap();
      notification.success({
        message: "Đã chấp nhận yêu cầu kết bạn",
      });
    } catch (error) {
      notification.error({
        message: "Chấp nhận yêu cầu kết bạn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleCancelFriendRequest = async (e, relationshipId) => {
    e?.stopPropagation?.();
    try {
      await dispatch(
        cancelFriendRequest(relationshipId || currentConversation?.relationship?._id)
      ).unwrap();
      notification.success({
        message: "Đã hủy yêu cầu kết bạn",
      });
    } catch (error) {
      notification.error({
        message: "Hủy yêu cầu kết bạn thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleBackToConversations = () => {
    if (location.pathname.startsWith("/community")) {
      navigate("/community");
    } else {
      navigate("/chat");
    }
  };

  const handleOpenUserProfile = async (userId) => {
    setOpenModal(MODAL.PROFILE);

    try {
      await dispatch(getUserDetail(userId)).unwrap();
    } catch (error) {
      notification.error({
        message: "Lấy thông tin người dùng thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleOpenChat = async (e, user) => {
    e?.stopPropagation?.();
    if (!user?._id) return;

    try {
      const conversation = await dispatch(createPrivateConversation(user._id)).unwrap();
      setOpenModal(null);
      navigate(`/chat/${conversation._id}`);
    } catch (error) {
      notification.error({
        message: "Khong the mo cuoc tro chuyen",
        description: error.message || "Vui long thu lai sau",
      });
    }
  };

  return (
    <section
      className={`min-w-0 min-h-0 flex-1 flex-col bg-[var(--color-app)] ${
        activeConversationId ? "flex" : "hidden md:flex"
      }`}
      aria-label="Active conversation"
    >
      <ChatHeader
        onBack={handleBackToConversations}
        onOpenConversationInfo={() => setOpenDrawer(DRAWER.INFO)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
        onOpenUserProfile={handleOpenUserProfile}
        displayInfo={displayInfo}
        typingNames={typingNames}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <Messages
          currentUserId={currentUserId}
          activeConversationId={activeConversationId}
          currentConversation={currentConversation}
          setEditingMessage={setEditingMessage}
          setReplyingMessage={setReplyingMessage}
          onOpenUserProfile={handleOpenUserProfile}
          onCreateFriendRequest={handleCreateFriendRequest}
          onAcceptFriendRequest={handleAcceptFriendRequest}
        />
      </div>

      <MessageInput
        currentUserId={currentUserId}
        activeConversationId={activeConversationId}
        editingMessage={editingMessage}
        setEditingMessage={setEditingMessage}
        replyingMessage={replyingMessage}
        setReplyingMessage={setReplyingMessage}
      />

      <DrawerConversationInfo
        open={openDrawer === DRAWER.INFO}
        onClose={() => setOpenDrawer(null)}
        displayInfo={displayInfo}
        activeConversationId={activeConversationId}
        onTogglePin={handleTogglePinConversation}
        onClearHistory={handleClearHistory}
        onOpenLeaveGroup={() => setOpenModal(MODAL.LEAVE)}
        onOpenMembersInfo={() => setOpenDrawer(DRAWER.MEMBERS)}
      />

      <DrawerMembersInfo
        open={openDrawer === DRAWER.MEMBERS}
        onClose={() => setOpenDrawer(null)}
        onOpenAddMembers={() => setOpenModal(MODAL.ADD)}
        activeConversationId={activeConversationId}
        currentUserId={currentUserId}
        members={displayInfo.members || []}
      />

      <ModalAddMembers
        isOpen={openModal === MODAL.ADD}
        onCancel={() => setOpenModal(null)}
        activeConversationId={activeConversationId}
        currentConversation={currentConversation}
      />

      <ModalUserProfile
        isOpen={openModal === MODAL.PROFILE}
        onCancel={() => setOpenModal(null)}
        onOpenChat={handleOpenChat}
        onCreateRequest={handleCreateFriendRequest}
        onAcceptRequest={handleAcceptFriendRequest}
        onCancelRequest={handleCancelFriendRequest}
      />
    </section>
  );
};

export default ChatWindow;
