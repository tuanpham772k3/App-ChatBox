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
      className="flex flex-col bg-[var(--color-app)] transition-all duration-300 w-60 px-4 border-r
    border-[var(--color-border)]"
    >
      {/* TOP: Logo + workspace */}
      <div className="flex items-center gap-2 px-3 h-24 border-b border-[var(--color-border)]">
        <div className="w-9 h-9 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-white font-semibold">
          <MessageCircle className="w-5 h-5" />
        </div>
        <span className="text-2xl font-bold text-[var(--color-text-primary)]">
          Chatbox
        </span>
      </div>

      {/* MIDDLE: Navigation */}
      <nav className="flex-1 flex flex-col gap-5 py-6 text-sm">
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <BarChart2 className="w-4 h-4" />
          <span>Dashboard</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <Users className="w-4 h-4" />
          <span>Analytics</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <FileText className="w-4 h-4" />
          <span>Files</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <Phone className="w-4 h-4" />
          <span>Call</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white
        shadow-sm"
        >
          <MessageCircleMore className="w-4 h-4" />
          <span>Messages</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <Archive className="w-4 h-4" />
          <span>Community</span>
        </button>
        <button
          className="flex items-center gap-6 px-3 py-2 rounded-xl text-[var(--color-text-primary)]
        hover:bg-[var(--color-primary)] hover:text-white transition-colors duration-200 ease-out"
        >
          <Menu className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* BOTTOM: User summary + logout */}
      <div className="flex items-center justify-between gap-3 py-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || "/avatarA.jpg"}
            alt="user"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {user?.username || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="text-[11px] font-medium text-[var(--color-text-secondary)] hover:underline hover:text-[var(--color-primary)]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
