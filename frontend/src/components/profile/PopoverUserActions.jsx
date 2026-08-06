import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Popover, Switch } from "antd";
import { toggleTheme } from "@/store/themeSlice";
import ModalMyProfile from "./ModalMyProfile";
import UserAvatar from "../ui/avatar/UserAvatar";
import { logoutUser } from "@/store/authSlice";
import { useNotification } from "@/hooks/useNotification";
import { clearMessages } from "@/store/messagesSlice";
import { disconnectSocket } from "@/lib/socket";

const PopoverUserActions = ({ currentUser }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((state) => state.theme.mode);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const notification = useNotification();

  const openModalMyProfile = () => {
    setOpenModal(true);
    setOpen(false);
  };

  const goToProfile = () => {
    navigate("/profile");
    setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);

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

  return (
    <>
      <Popover
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="rightTop"
        content={
          <div className="w-[180px]">
            <header className="border-b border-[var(--color-border)]">
              <h2 className="px-3 pb-2 text-lg font-medium text-[var(--color-text-primary)]">
                {currentUser?.displayName}
              </h2>
            </header>

            <div className="flex flex-col gap-1">
              <div
                className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded"
              >
                <span>Chế độ tối</span>
                <Switch
                  aria-label="Chuyển đổi chế độ tối"
                  size="small"
                  checked={mode === "dark"}
                  onChange={() => dispatch(toggleTheme())}
                />
              </div>

              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded"
              >
                Nâng cấp tài khoản
              </button>
              <button
                type="button"
                onClick={openModalMyProfile}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded"
              >
                Xem hồ sơ
              </button>
              <button
                type="button"
                onClick={goToProfile}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded"
              >
                Chỉnh sửa hồ sơ
              </button>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)]
            hover:bg-[var(--color-hover)] rounded"
              >
                Cài đặt
              </button>
            </div>

            <footer className="pt-1 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-[var(--color-hover)] rounded"
              >
                Đăng xuất
              </button>
            </footer>
          </div>
        }
      >
        <button
          type="button"
          className="w-12 h-12 rounded-full focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          <UserAvatar
            avatarUrl={currentUser?.avatar?.url}
            name={currentUser?.displayName}
            size={48}
          />
        </button>
      </Popover>

      <ModalMyProfile isOpen={openModal} onCancel={() => setOpenModal(false)} />
    </>
  );
};

export default PopoverUserActions;
