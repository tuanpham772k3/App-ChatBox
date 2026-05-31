import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ChartNoAxesCombined,
  Files,
  LayoutDashboard,
  MessageCircleMore,
  Phone,
  Settings,
} from "lucide-react";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useLogout } from "@/hooks/useLogout";
import PopoverUserActions from "@/components/profile/PopoverUserActions";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/#" },
  { label: "Analytics", icon: ChartNoAxesCombined, path: "/#" },
  { label: "Files", icon: Files, path: "/#" },
  { label: "Call", icon: Phone, path: "/#" },
  { label: "Messages", icon: MessageCircleMore, path: "/messages" },
  { label: "Community", icon: HiOutlineUserGroup, path: "/community" },
  { label: "Settings", icon: Settings, path: "/#" },
];

const Sidebar = ({ mode = "desktop", onClose }) => {
  const profile = useSelector((state) => state.user.profile);
  const logout = useLogout();
  const isMobile = mode === "mobile";

  return (
    <div
      className={`group/sidebar h-full w-56 flex-col bg-[var(--color-app)] transition-all duration-300 border-r border-[var(--color-border)] overflow-hidden ${
        isMobile ? "flex shadow-2xl" : "hidden lg:flex"
      }`}
    >
      <header className="h-16 sm:h-20 flex items-center gap-3 px-4 border-b border-[var(--color-border)] transition-all">
        <img src={"/message.svg.png"} alt="" className="w-8 h-8 shrink-0" />
        <p className="text-2xl font-bold text-shadow-sm text-[var(--color-text-primary)]">
          Chatbox
        </p>
      </header>

      <nav className="flex-1 p-4 text-base" aria-label="Primary">
        <ul className="flex flex-col gap-4">
          {navItems.map(({ label, icon: Icon, path }) => (
            <li key={label}>
              <NavLink
                to={path}
                onClick={onClose}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-6 p-2 rounded-xl text-left transition-colors text-[var(--color-text-primary)] ${
                    isActive
                      ? "bg-[var(--color-primary-focus)] text-white shadow-xl"
                      : "hover:bg-[var(--color-primary-hover)] hover:text-white hover:shadow-xl"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      aria-hidden="true"
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-[var(--color-text-secondary)] group-hover:text-white"
                      }`}
                    />
                    <span className="min-w-0 whitespace-nowrap">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <footer className="flex items-center gap-3 p-4 transition-all">
        <PopoverUserActions userInfo={profile} />

        <div className="flex-col items-start truncate">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {profile?.username || "User"}
          </p>
          <button
            type="button"
            onClick={logout}
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
