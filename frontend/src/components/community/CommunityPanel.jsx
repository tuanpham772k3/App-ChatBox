import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { UsersRound } from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { RiUserSharedLine } from "react-icons/ri";
import ConversationHeader from "../messaging/conversation/ConversationHeader";
import ModalCreateGroup from "../messaging/conversation/ModalCreateGroup";
import ModalAddFriend from "../messaging/conversation/ModalAddFriend";

const CommunityPanel = ({ isDetailOpen }) => {
  const location = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState(null); // "group" | "private" | null

  return (
    <>
      <section
        className={`min-w-0 ${
          isDetailOpen ? "hidden md:flex" : "flex"
        } flex-col flex-1 md:flex-none md:w-[min(42vw,22.5rem)]
        bg-[var(--color-app)] border-r border-[var(--color-border)]`}
        aria-labelledby="community-panel"
      >
        <ConversationHeader
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onOpenModal={setModal}
        />

        {/* Panel */}
        <nav className="min-w-0 p-3">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/community/friends"
                className={({ isActive }) => {
                  const isFriendActive = isActive || location.pathname === "/community";
                  return `flex w-full items-center gap-4 p-5 text-sm text-[var(--color-text-primary)] rounded-lg
                  active:bg-[var(--color-active)] ${
                    isFriendActive
                      ? "bg-[var(--color-primary-focus)]/10"
                      : "hover:bg-[var(--color-hover)]"
                  }`;
                }}
              >
                <UsersRound size={20} />
                <span>Danh sách bạn bè</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/community/groups"
                className={({ isActive }) =>
                  `flex w-full items-center gap-4 p-5 text-sm text-[var(--color-text-primary)] rounded-lg
                active:bg-[var(--color-active)] ${
                  isActive
                    ? "bg-[var(--color-primary-focus)]/10"
                    : "hover:bg-[var(--color-hover)]"
                }`
                }
              >
                <HiOutlineUserGroup size={20} />
                <span>Danh sách nhóm và cộng đồng</span>
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/community/friend-invitation"
                className={({ isActive }) =>
                  `flex w-full items-center gap-4 p-5 text-sm text-[var(--color-text-primary)] rounded-lg
                active:bg-[var(--color-active)] ${
                  isActive
                    ? "bg-[var(--color-primary-focus)]/10"
                    : "hover:bg-[var(--color-hover)]"
                }`
                }
              >
                <RiUserSharedLine size={20} />
                <span>Lời mời kết bạn</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </section>

      <ModalCreateGroup isOpen={modal === "group"} onCancel={() => setModal(null)} />
      <ModalAddFriend isOpen={modal === "private"} onCancel={() => setModal(null)} />
    </>
  );
};

export default CommunityPanel;
