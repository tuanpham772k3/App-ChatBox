import React from "react";
import {
  Archive,
  BarChart2,
  FileText,
  Menu,
  MessageCircle,
  MessageCircleMore,
  Phone,
  Users,
} from "lucide-react";
import { logoutUser } from "@/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages } from "@/features/chat/messagesSlice";
import { disconnectSocket, emitEvent } from "@/shared/lib/socket";

const appIcons = [
  "../../assets/img/app1.jpg",
  "/img/app2.png",
  "/img/app3.png",
  "/img/app4.png",
  "/img/app5.png",
  "/img/app6.png",
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const { conversations } = useSelector((state) => state.conversations);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      conversations.forEach((conversation) => {
        emitEvent("leave_conversation", conversation._id);
      }); // Rời tất cả các phòng conversation

      await dispatch(logoutUser()).unwrap(); // Thực hiện logout

      dispatch(clearMessages()); // Xóa tin nhắn khỏi store

      disconnectSocket(); // Ngắt kết nối socket
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside
      className="flex flex-col justify-between bg-[var(--bg-primary)] rounded-2xl shadow-sm
                text-[var(--color-text-secondary)] transition-all duration-300 w-60 px-4 py-5"
    >
      {/* TOP: Logo + workspace */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            Chatbox
          </span>
          <span className="text-xs text-[var(--color-text-secondary)]">
            All messages
          </span>
        </div>
      </div>

      {/* MIDDLE: Navigation */}
      <nav className="flex-1 flex flex-col gap-1 text-sm">
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <Users className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <FileText className="w-4 h-4" />
          <span>Files</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
          <MessageCircleMore className="w-4 h-4" />
          <span>Messages</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <Archive className="w-4 h-4" />
          <span>Community</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--color-text-secondary)] hover:bg-[var(--bg-hover-secondary)]">
          <Menu className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* BOTTOM: User summary + logout */}
      <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatarUrl?.url || "/img/user.jpg"}
            alt="user"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {user?.username || "User"}
            </span>
            <span className="text-[11px] text-[var(--color-text-secondary)]">
              Online
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
