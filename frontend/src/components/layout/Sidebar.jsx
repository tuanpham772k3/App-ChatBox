import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChartNoAxesCombined,
  Files,
  LayoutDashboard,
  X,
  MessageCircleMore,
  Phone,
  Settings,
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { logoutUser } from "@/store/authSlice";
import { clearMessages } from "@/store/messagesSlice";
import { disconnectSocket, emitEvent } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";
import PopoverUserActions from "@/components/user/PopoverUserActions";

const Sidebar = ({ mode = "desktop", onClose }) => {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.conversations.conversations) || [];
  const user = useSelector((state) => state.auth.user) || {};
  const notification = useNotification();
  const isMobile = mode === "mobile";

  const handleLogout = async () => {
    conversations.forEach((conversation) => {
      emitEvent("leave_conversation", { conversationId: conversation._id });
    });

    try {
      await dispatch(logoutUser()).unwrap();

      notification.success({
        message: "Đăng xuất thành công",
        description: "See you again ^-^",
      });

      dispatch(clearMessages());

      disconnectSocket();
    } catch (error) {
      notification.error({
        message: "Lỗi đăng xuất hệ thống",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Analytics", icon: ChartNoAxesCombined },
    { label: "Files", icon: Files },
    { label: "Call", icon: Phone },
    { label: "Messages", icon: MessageCircleMore, active: true },
    { label: "Community", icon: HiOutlineUserGroup },
    { label: "Settings", icon: Settings },
  ];

  return (
    <div
      className={`group/sidebar h-full w-56 flex-col bg-[var(--color-app)] transition-all duration-300 border-r border-[var(--color-border)] overflow-hidden ${
        isMobile ? "flex shadow-2xl" : "hidden lg:flex"
      }`}
    >
      {/* ====== Logo ====== */}
      <header className="h-16 sm:h-20 flex items-center gap-3 px-4 border-b border-[var(--color-border)] transition-all">
        <img src={"/message.svg.png"} alt="" className="w-8 h-8 shrink-0" />
        <p className="text-2xl font-bold text-shadow-sm text-[var(--color-text-primary)]">
          Chatbox
        </p>
      </header>

      {/* ====== Options Navigation ====== */}
      <nav className="flex-1 p-4 text-base" aria-label="Primary">
        <ul className="flex flex-col gap-4">
          {navItems.map(({ label, icon: Icon, active }) => (
            <li key={label}>
              <button
                type="button"
                aria-current={active ? "page" : undefined}
                aria-label={label}
                title={label}
                onClick={onClose}
                className={`group flex w-full items-center gap-6 p-2 rounded-xl text-left transition-colors text-[var(--color-text-primary)] ${
                  active
                    ? "bg-[var(--color-primary-focus)] text-white shadow-xl"
                    : "hover:bg-[var(--color-primary)] hover:text-white hover:shadow-xl"
                }`}
              >
                <Icon
                  size={20}
                  aria-hidden="true"
                  className={`shrink-0 transition-colors ${
                    active
                      ? "text-white"
                      : "text-[var(--color-text-secondary)] group-hover:text-white"
                  }`}
                />
                <span className="min-w-0 whitespace-nowrap">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info */}
      <footer className="flex items-center gap-3 p-4 transition-all">
        <PopoverUserActions userInfo={user}>
          <img
            src={user?.avatar || "/avatarA.jpg"}
            alt={user?.username ? `${user.username} avatar` : "User avatar"}
            className="w-12 h-12 shrink-0 rounded-full border border-[var(--color-border)] object-cover cursor-pointer"
          />
        </PopoverUserActions>

        <div className="flex-col items-start truncate">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {user?.username || "User"}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-medium text-[var(--color-text-secondary)] hover:underline hover:text-red-400"
          >
            Logout
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Sidebar;
