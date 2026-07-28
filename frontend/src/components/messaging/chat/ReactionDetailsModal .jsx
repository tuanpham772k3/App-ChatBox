import React, { useMemo, useState } from "react";
import { Modal } from "antd";
import UserAvatar from "@/components/ui/avatar/UserAvatar";
import { REACTIONS } from "@/constants/reactions";

const ReactionDetailsModal = ({ open, onClose, reactionSummary = [] }) => {
  const [selectedEmoji, setSelectedEmoji] = useState("all");

  const allUsers = useMemo(
    () => reactionSummary.flatMap((item) => item.users),
    [reactionSummary]
  );

  const users = useMemo(() => {
    if (selectedEmoji === "all") return allUsers;

    return reactionSummary.find((item) => item.emoji === selectedEmoji)?.users ?? [];
  }, [selectedEmoji, reactionSummary, allUsers]);

  return (
    <Modal
      open={open}
      footer={null}
      title="Biểu cảm"
      onCancel={onClose}
      width={420}
      centered
    >
      <div className="flex h-[312px] border-t-2 border-[var(--color-border)]">
        {/* Tabs */}
        <div className="w-24 flex flex-col bg-[var(--color-app)] overflow-x-auto">
          <button
            onClick={() => setSelectedEmoji("all")}
            className={`flex items-center justify-between px-4 py-2 ${
              selectedEmoji === "all"
                ? "bg-[var(--color-active)] text-[var(--color-text-primary)]"
                : "bg-[var(--color-app)]"
            }`}
          >
            <span>Tất cả</span>
            <span>{allUsers.length}</span>
          </button>

          {reactionSummary.map((item) => (
            <button
              key={item.emoji}
              onClick={() => setSelectedEmoji(item.emoji)}
              className={`flex items-center justify-between px-4 py-2 ${
                selectedEmoji === item.emoji
                  ? "bg-[var(--color-active)] text-[var(--color-text-primary)]"
                  : "bg-[var(--color-app)]"
              }`}
            >
              <img
                src={REACTIONS[item.emoji].src}
                alt={REACTIONS[item.emoji].label}
                className="w-5 h-5"
              />
              <span>{item.users.length}</span>
            </button>
          ))}
        </div>

        {/* Users */}
        <div className="flex-1 max-h-96 ml-2 overflow-y-auto">
          {users.map((user) => (
            <div key={user._id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <UserAvatar avatarUrl={user.avatar?.url} name={user.displayName} />

                <span>{user.displayName}</span>
              </div>

              <img
                src={REACTIONS[user.emoji].src}
                alt={REACTIONS[user.emoji].label}
                className="w-4 h-4"
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ReactionDetailsModal;
