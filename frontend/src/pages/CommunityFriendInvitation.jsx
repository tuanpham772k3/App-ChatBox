import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { SlArrowLeft } from "react-icons/sl";
import { RiUserSharedLine } from "react-icons/ri";
import ModalUserProfile from "@/components/community/ModalUserProfile";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  createFriendRequest,
  getReceivedRequests,
  getSentRequests,
  rejectFriendRequest,
} from "@/store/relationshipSlice";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import { useNotification } from "@/hooks/useNotification";
import { getUserDetail } from "@/store/userSlice";

const FriendCard = ({ name, avatarUrl, onSelect, actions }) => {
  return (
    <li
      onClick={onSelect}
      className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-app)] cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <UserAvatar name={name} avatarUrl={avatarUrl} size={48} />

        <div className="min-w-0">
          <h3 className="truncate font-medium text-[var(--color-text-primary)]">
            {name}
          </h3>

          <p className="text-sm text-[var(--color-text-secondary)]">8 nhóm chung</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">{actions}</div>
    </li>
  );
};

const CommunityFriendInvitation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { receivedRequests, sentRequests } = useSelector((state) => state.relationship);
  const { selectedUser } = useSelector((state) => state.user);
  console.log("🚀 ~ CommunityFriendInvitation ~ selectedUser:", selectedUser);

  const [modal, setModal] = useState(false);

  const notification = useNotification();

  const isCommunityFriends = location.pathname === "/community/friend-invitation";

  useEffect(() => {
    dispatch(getReceivedRequests());
    dispatch(getSentRequests());
  }, []);

  const handleSelectUser = (user) => {
    setModal(true);
    dispatch(getUserDetail(user._id));
  };

  const handleCreateFriendRequest = async (e, userId) => {
    e.stopPropagation();
    try {
      await dispatch(createFriendRequest(userId)).unwrap();

      notification.success({
        message: "Đã gửi yêu cầu kết bạn",
      });

      setModal(false);
    } catch (error) {
      notification.error({
        message: "Gửi yêu cầu kết bạn thất bại!",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  const handleAcceptRequest = async (e, relationshipId) => {
    e.stopPropagation();
    try {
      await dispatch(acceptFriendRequest(relationshipId)).unwrap();

      notification.success({
        message: "Đã chấp nhận yêu cầu kết bạn.",
      });

      setModal(false);
    } catch (error) {
      notification.error({
        message: "Chấp nhận yêu cầu kết bạn thất bại!",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  const handleRejectRequest = async (e, relationshipId) => {
    e.stopPropagation();
    try {
      await dispatch(rejectFriendRequest(relationshipId)).unwrap();

      notification.success({
        message: "Đã từ chối yêu cầu kết bạn.",
      });

      setModal(false);
    } catch (error) {
      notification.error({
        message: "Từ chối yêu cầu kết bạn thất bại!",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  const handleCancelRequest = async (e, relationshipId) => {
    e.stopPropagation();
    try {
      await dispatch(cancelFriendRequest(relationshipId)).unwrap();

      notification.success({
        message: "Đã hủy yêu cầu kết bạn.",
      });

      setModal(false);
    } catch (error) {
      notification.error({
        message: "Hủy yêu cầu kết bạn thất bại!",
        description: error.message || "Vui lòng thử lại sau",
      });
    }
  };

  return (
    <>
      <section
        className={`min-w-0 flex-1 flex-col bg-[var(--color-app)] ${
          isCommunityFriends ? "flex" : "hidden md:flex"
        } `}
        aria-label="Friend invitation list"
      >
        {/* ── Header ── */}
        <header className="h-16 sm:h-20 flex items-center gap-3 px-4 border-b border-[var(--color-border)]">
          {/* Back button (mobile only) */}
          <button
            type="button"
            onClick={() => navigate("/community", { replace: true })}
            aria-label="Back to community panel"
            className="md:hidden shrink-0 p-2 rounded-full text-[var(--color-text-primary)]
          hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
          >
            <SlArrowLeft size={18} />
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <RiUserSharedLine
              size={22}
              className="shrink-0 text-[var(--color-text-primary)]"
            />
            <h2 className="min-w-0 truncate text-base font-semibold text-[var(--color-text-primary)]">
              Lời mời kết bạn
            </h2>
          </div>
        </header>

        {/* ── Body ── */}
        <div
          className="flex-1 px-4 py-4 bg-[var(--color-chat)]
      text-[var(--color-text-primary)] overflow-y-auto custom-scrollbar"
        >
          {/* Danh sách lời mời đã nhận */}
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
              {`Lời mời đã nhận (${receivedRequests.length})`}
            </h3>

            <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {receivedRequests.map((r) => (
                <FriendCard
                  key={r?._id}
                  name={r?.displayName}
                  avatarUrl={r?.avatar?.url}
                  onSelect={() => handleSelectUser(r)}
                  actions={
                    <>
                      <button
                        onClick={(e) => handleRejectRequest(e, r?.relationshipId)}
                        type="button"
                        className="flex-1 h-8 rounded-md font-medium
                        text-[var(--color-text-primary)]
                        bg-[var(--color-hover)] hover:opacity-90
                        active:bg-[var(--color-active)]"
                      >
                        Từ chối
                      </button>

                      <button
                        onClick={(e) => handleAcceptRequest(e, r?.relationshipId)}
                        type="button"
                        className="flex-1 h-8 rounded-md text-white font-medium
                        bg-[var(--color-primary)] hover:opacity-90
                        active:bg-[var(--color-primary-active)]"
                      >
                        Chấp nhận
                      </button>
                    </>
                  }
                />
              ))}
            </ul>
          </section>

          {/* Danh sách lời mời đã gửi */}
          <section className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
              {`Lời mời đã gửi (${sentRequests.length})`}
            </h3>

            <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {sentRequests.map((s) => (
                <FriendCard
                  key={s?._id}
                  name={s?.displayName}
                  avatarUrl={s?.avatar?.url}
                  onSelect={() => handleSelectUser(s)}
                  actions={
                    <>
                      <button
                        onClick={(e) => handleCancelRequest(e, s?.relationshipId)}
                        type="button"
                        className="flex-1 h-8 rounded-md font-medium
                        text-[var(--color-text-primary)]
                        bg-[var(--color-hover)] hover:opacity-90
                        active:bg-[var(--color-active)]"
                      >
                        Thu hồi lời mời
                      </button>
                    </>
                  }
                />
              ))}
            </ul>
          </section>

          {/* Gợi ý kết bạn */}
          {/* <section className="mb-8">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-primary)]">
              {`Gợi ý kết bạn (${users.length})`}
            </h3>

            <ul className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {users.map((user) => (
                <FriendCard
                  key={user.id}
                  user={user}
                  actions={
                    <>
                      <button
                        type="button"
                        className="flex-1 h-8 rounded-md font-medium
                        text-[var(--color-text-primary)]
                        bg-[var(--color-hover)] hover:opacity-90
                        active:bg-[var(--color-active)]"
                      >
                        Bỏ qua
                      </button>

                      <button
                        type="button"
                        className="flex-1 h-8 rounded-md text-white font-medium
                        bg-[var(--color-primary)] hover:opacity-90
                        active:bg-[var(--color-primary-active)]"
                      >
                        Kết bạn
                      </button>
                    </>
                  }
                />
              ))}
            </ul>
          </section> */}
        </div>
      </section>

      <ModalUserProfile
        isOpen={modal}
        onCancel={() => setModal(false)}
        selectedUser={selectedUser}
        onCreateRequest={handleCreateFriendRequest}
        onAcceptRequest={handleAcceptRequest}
        onCancelRequest={handleCancelRequest}
      />
    </>
  );
};

export default CommunityFriendInvitation;
