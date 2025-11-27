import React from "react";
import { Archive, Menu, MessageCircle, MessageCircleMore, Store } from "lucide-react";
import { logoutUser } from "@/features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearMessages } from "@/features/chat/messagesSlice";
import { disconnectSocket } from "@/lib/socket";

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

  const handleLogout = async () => {
    try {
      conversations.forEach((conversation) => {
        emitEvent("leave_conversation", conversation._id);
      }); // Rời tất cả các phòng conversation

      await dispatch(logoutUser()).unwrap(); // Thực hiện logout

      dispatch(clearMessages()); // Xóa tin nhắn khỏi store

      disconnectSocket(); // Ngắt kết nối socket
    } catch (error) {
      console.error("Logout error:", err);
    }
  };

  return (
    <aside
      className="flex flex-col justify-between text-[var(--color-text-secondary)]
                transition-all duration-300 w-11"
    >
      {/* TOP ICONS */}
      <div className="flex flex-col items-center">
        <button className="relative group w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)]">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute top-3 right-3 block w-2 h-2 bg-[var(--color-primary)] rounded-full"></span>
        </button>

        {[Store, MessageCircleMore, Archive].map((Icon, i) => (
          <button
            key={i}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover-primary)]"
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}

        {/* Divider */}
        <div className="w-8 h-[1px] bg-[var(--color-border)] my-6"></div>

        {/* APP ICONS */}
        <div className="flex flex-col items-center gap-3 mt-2">
          {appIcons.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt=""
              className="w-9 h-9 rounded-lg object-cover hover:scale-110 transition-transform cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* BOTTOM ICONS */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {/* đăng xuất */}
        <button
          onClick={handleLogout}
          className="rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors"
        >
          Logout
        </button>
        <img
          src="/img/user.jpg"
          alt="user"
          className="w-9 h-9 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
        />
        <button className="rounded-full bg-[var(--bg-gray)] p-2 hover:bg-[var(--bg-hover-primary)] transition-colors">
          <Menu className="w-6 h-6 text-[var(--color-text-primary)]" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
