import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SlArrowLeft } from "react-icons/sl";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { Search, ArrowUpDown, ListFilter, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getConversations } from "@/store/conversationsSlice";
import { useNotification } from "@/hooks/useNotification";
import { getDisplayInfo } from "@/utils/conversationHelper";
import GroupAvatar from "@/components/ui/avatar/GroupAvatar";
import PopoverGroupActions from "@/components/community/PopoverGroupActions";
import { Spin } from "antd";

/** Yellow pill shown under friend name */
const GroupTag = ({ label }) => (
  <span className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
    <span className="w-2.5 h-2.5 rounded-sm bg-yellow-400 shrink-0" />
    {label}
  </span>
);

/** Single group row */
const GroupRow = ({ group, members, onOpenChat }) => (
  <li className="group flex items-center hover:bg-[var(--color-hover)] rounded-xl transition-colors cursor-pointer">
    <button
      onClick={() => onOpenChat(group._id)}
      className="flex-1 flex items-center gap-3 px-3 py-2.5 text-left"
    >
      <GroupAvatar users={members} size={48} />
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
          {group.name}
        </span>
        {group.tag && <GroupTag label={group.tag} />}
      </div>
    </button>

    <div
      className="touch-always-visible self-center mr-4
      opacity-100 sm:opacity-0 sm:group-hover:opacity-100
      transition-opacity duration-150"
    >
      <PopoverGroupActions />
    </div>
  </li>
);

/* ─── Main component ─────────────────────────────────────────── */
const CommunityGroups = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { conversations, loading } = useSelector((state) => state.conversations);
  const currentUserId = useSelector((state) => state.user.currentUser?._id);

  const [search, setSearch] = useState("");

  const notification = useNotification();

  const isCommunityGroups = location.pathname === "/community/groups";

  /** Filter groups/friends by search query */
  const visibleGroups = conversations
    .filter((c) => c.type === "group")
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const TOTAL_GROUPS = visibleGroups.length;

  useEffect(() => {
    dispatch(getConversations())
      .unwrap()
      .catch((err) => {
        notification.error({
          message: "Lấy danh sách hội thoại thất bại",
          description: err.message || "Có lỗi xảy ra",
        });
      });
  }, [dispatch]);

  const handleOpenChat = (conversationId) => {
    navigate(`/community/chat/${conversationId}`);
  };

  return (
    <section
      className={`min-w-0 ${
        isCommunityGroups ? "flex" : "hidden md:flex"
      } flex-1 flex-col bg-[var(--color-app)]`}
      aria-label="Friends list"
    >
      {/* ── Header ── */}
      <header
        className="h-16 sm:h-20 flex items-center gap-2 px-3 sm:px-4
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
          <HiOutlineUserGroup
            size={22}
            className="shrink-0 text-[var(--color-text-primary)]"
          />
          <h2 className="truncate text-sm md:text-base font-semibold text-[var(--color-text-primary)]">
            Danh sách nhóm và cộng đồng
          </h2>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 overflow-hidden px-3 sm:px-4 py-1 bg-[var(--color-chat)] text-[var(--color-text-primary)]">
        {/* Group count */}
        <p className="text-sm font-medium py-3 px-1">
          Nhóm và cộng đồng ({TOTAL_GROUPS})
        </p>

        {/* Card */}
        <div className="flex flex-col flex-1 overflow-hidden bg-[var(--color-app)] rounded-xl">
          {/* Search + Sort + Filter row */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-3 flex-wrap">
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
              <ul className="flex flex-col gap-2">
                {visibleGroups.map((group) => (
                  <GroupRow
                    key={group._id}
                    group={group}
                    members={getDisplayInfo(group, currentUserId)?.members || []}
                    onOpenChat={handleOpenChat}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-center text-[var(--color-text-secondary)] py-8">
                Không tìm thấy nhóm nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityGroups;
