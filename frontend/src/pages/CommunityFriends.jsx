import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { SlArrowLeft } from "react-icons/sl";
import { UsersRound, Search, ArrowUpDown, ListFilter, ChevronDown } from "lucide-react";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import PopoverFriendActions from "@/components/community/PopoverFriendActions";
import { createPrivateConversation } from "@/store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import { getFriends, unfriend } from "@/store/relationshipSlice";

/** Yellow pill shown under friend name */
const FriendTag = ({ label }) => (
  <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 shrink-0" />
    {label}
  </span>
);

/** Single friend row */
const FriendRow = ({ friend, onOpenChat, onRemoveFriend }) => (
  <li className="group flex items-center hover:bg-[var(--color-hover)] rounded-xl transition-colors cursor-pointer">
    <button
      onClick={() => onOpenChat(friend)}
      className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left"
    >
      <UserAvatar name={friend?.displayName} avatarUrl={friend?.avatar?.url} size={48} />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {friend?.displayName}
        </span>
        {friend?.tag && <FriendTag label={friend?.tag} />}
      </div>
    </button>

    <div
      className="touch-always-visible self-center mr-4
      opacity-100 sm:opacity-0 sm:group-hover:opacity-100
      transition-opacity duration-150"
    >
      <PopoverFriendActions
        onRemoveFriend={() => onRemoveFriend(friend.relationshipId)}
      />
    </div>
  </li>
);

/** Alphabetical group (e.g. "B" or "Bạn mới") */
const FriendGroup = ({ label, friends, onOpenChat, onRemoveFriend }) => (
  <li>
    <p className="text-xs font-semibold text-[var(--color-text-secondary)] px-3 pt-3 pb-1.5">
      {label}
    </p>
    <ul className="flex flex-col gap-0.5">
      {friends.map((f) => (
        <FriendRow
          key={f._id}
          friend={f}
          onOpenChat={onOpenChat}
          onRemoveFriend={onRemoveFriend}
        />
      ))}
    </ul>
  </li>
);

/* ─── Main component ─────────────────────────────────────────── */
const CommunityFriends = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { friends, loading } = useSelector((state) => state.relationship);
  console.log("🚀 ~ CommunityFriends ~ friends:", friends);
  const [search, setSearch] = useState("");

  const notification = useNotification();

  const isCommunityFriends = location.pathname === "/community/friends";

  useEffect(() => {
    dispatch(getFriends());
  }, []);

  const TOTAL_FRIENDS = friends.length;

  const visibleGroups = useMemo(() => {
    const filtered = friends.filter((friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase())
    );

    return Object.values(
      filtered.reduce((groups, friend) => {
        const label = friend.displayName[0].toUpperCase();

        if (!groups[label]) {
          groups[label] = {
            label,
            friends: [],
          };
        }

        groups[label].friends.push(friend);

        return groups;
      }, {})
    );
  }, [friends, search]);

  const handleOpenChat = async (friend) => {
    try {
      const conversation = await dispatch(createPrivateConversation(friend._id)).unwrap();

      navigate(`/community/chat/${conversation._id}`);
    } catch (error) {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: error.message,
      });
    }
  };

  const handleRemoveFriend = async (relationshipId) => {
    try {
      await dispatch(unfriend(relationshipId)).unwrap();

      notification.success({
        message: "Đã xóa người này khỏi danh sách bạn bè",
      });
    } catch (error) {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: error.message,
      });
    }
  };

  return (
    <section
      className={`min-w-0 ${
        isCommunityFriends ? "flex" : "hidden md:flex"
      } flex-1 flex-col bg-[var(--color-app)]`}
      aria-label="Friends list"
    >
      {/* ── Header ── */}
      <header
        className="h-16 sm:h-20 flex items-center gap-3 px-4
          border-b border-[var(--color-border)]"
      >
        {/* Back button (mobile only) */}
        <button
          type="button"
          onClick={() => navigate("/community", { replace: true })}
          aria-label="Back to community panel"
          className="md:hidden shrink-0 p-2 rounded-full
            text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]"
        >
          <SlArrowLeft size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <UsersRound size={22} className="shrink-0 text-[var(--color-text-primary)]" />
          <h2 className="truncate text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
            Danh sách bạn bè
          </h2>
        </div>
      </header>

      {/* ── Body ── */}
      <div
        className="flex flex-col flex-1 overflow-hidden px-3 sm:px-4 py-1 bg-[var(--color-chat)]
        text-[var(--color-text-primary)]"
      >
        {/* Friend count */}
        <p className="text-sm font-medium py-3 px-1">Bạn bè ({TOTAL_FRIENDS})</p>

        {/* Card */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[var(--color-app)] rounded-xl">
          {/* Search + Sort + Filter row */}
          <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-[120px]">
              <Search
                size={15}
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2
                  text-[var(--color-text-secondary)] pointer-events-none"
              />
              <input
                type="search"
                placeholder="Tìm bạn"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-[7px] text-sm rounded-full
                  border border-[var(--color-border)]
                  bg-[var(--color-chat)] text-[var(--color-text-primary)]
                  placeholder:text-[var(--color-text-secondary)]
                  focus:outline-none focus:border-blue-400
                  transition-colors"
              />
            </div>

            {/* Sort */}
            <button
              className="flex items-center gap-1.5 px-3 py-[7px] text-sm rounded-lg
                border border-[var(--color-border)]
                bg-[var(--color-chat)] text-[var(--color-text-primary)]
                hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]
                whitespace-nowrap transition-colors"
            >
              <ArrowUpDown size={14} aria-hidden="true" />
              <span>Tên (A-Z)</span>
              <ChevronDown size={13} className="opacity-60" aria-hidden="true" />
            </button>

            {/* Filter */}
            <button
              className="flex items-center gap-1.5 px-3 py-[7px] text-sm rounded-lg
                border border-[var(--color-border)]
                bg-[var(--color-chat)] text-[var(--color-text-primary)]
                hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]
                whitespace-nowrap transition-colors"
            >
              <ListFilter size={14} aria-hidden="true" />
              <span>Tất cả</span>
              <ChevronDown size={13} className="opacity-60" aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable friend list */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-4">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Spin />
              </div>
            ) : visibleGroups.length > 0 ? (
              <ul className="flex flex-col">
                {visibleGroups.map((group) => (
                  <FriendGroup
                    key={group.label}
                    label={group.label}
                    friends={group.friends}
                    onOpenChat={handleOpenChat}
                    onRemoveFriend={handleRemoveFriend}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-center text-[var(--color-text-secondary)] py-8">
                Không tìm thấy bạn bè nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityFriends;
