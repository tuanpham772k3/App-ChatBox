import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  createPrivateConversation,
  getConversationDetail,
  getConversationImages,
  leaveGroup,
  setActiveConversation,
  togglePinConversation,
} from "@/store/conversationsSlice";
import { mapConversationForDisplay } from "@/utils/conversationMapper";
import { emitEvent } from "@/lib/socket";
import ModalLeaveGroup from "../components/messaging/chat/ModalLeaveGroup";
import { useNotification } from "@/hooks/useNotification";
import { getUserDetail } from "@/store/userSlice";
import ModalUserProfile from "@/components/community/ModalUserProfile";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  createFriendRequest,
} from "@/store/relationshipSlice";

const MODAL = {
  ADD: "add_members",
  REMOVE: "remove_members",
  LEAVE: "leave_group",
  PROFILE: "user_profile",
};

const DRAWER = {
  INFO: "conversation_info",
  MEMBERS: "members_info",
  MEDIA: "media",
};

const ChatWindow = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeConversationId = useParams().conversationId;

  const currentUserId = useSelector((state) => state.user.currentUser?._id);
  const { currentConversation, typingUsers, images } = useSelector(
    (state) => state.conversations
  );
  const { selectedUser } = useSelector((state) => state.user);

  const [openModal, setOpenModal] = useState(null);
  const [openDrawer, setOpenDrawer] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [editingMessage, setEditingMessage] = useState({
    id: null,
    content: "",
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

  useEffect(() => {
    dispatch(setActiveConversation(activeConversationId));

    return () => {
      dispatch(setActiveConversation(null));
    };
  }, [activeConversationId]);

  // join conversation
  useEffect(() => {
    if (!activeConversationId) return;

    emitEvent("conversation:join", {
      conversationId: activeConversationId,
    });

    return () => {
      emitEvent("conversation:leave", {
        conversationId: activeConversationId,
      });
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;

    dispatch(getConversationDetail(activeConversationId)).unwrap().catch(console.error);
  }, [activeConversationId, dispatch]);

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
    setOpenDrawer(null);
    setOpenModal(null);
    setSelectedMemberId(null);
    setEditingMessage({
      id: null,
      content: "",
      originalContent: "",
    });
  }, [activeConversationId]);

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
    if (location.pathname.startsWith("/community")) {
      navigate("/community");
    } else {
      navigate("/chat");
    }
  };

  const handleSelectAvatarUser = (userId) => {
    setOpenModal(MODAL.PROFILE);
    dispatch(getUserDetail(userId));
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

  const handleMessage = async (e, user) => {
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
        onSelectAvatarUser={handleSelectAvatarUser}
        displayInfo={displayInfo}
        typingNames={typingNames}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        <Messages
          currentUserId={currentUserId}
          conversationId={activeConversationId}
          currentConversation={currentConversation}
          setEditingMessage={setEditingMessage}
          onSelectAvatarUser={handleSelectAvatarUser}
          onCreateFriendRequest={handleCreateFriendRequest}
          onAcceptFriendRequest={handleAcceptFriendRequest}
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
        members={displayInfo.members || []}
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
        me={displayInfo?.me}
        members={displayInfo?.members}
      />

      <ModalUserProfile
        isOpen={openModal === MODAL.PROFILE}
        onCancel={() => setOpenModal(null)}
        selectedUser={selectedUser}
        onMessage={handleMessage}
        onCreateRequest={handleCreateFriendRequest}
        onAcceptRequest={handleAcceptFriendRequest}
        onCancelRequest={handleCancelFriendRequest}
      />
    </section>
  );
};

export default ChatWindow;
