import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, Switch } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/themeSlice";
import { useLogout } from "@/hooks/useLogout";
import ModalUserInfo from "./ModalUserInfo";
import UserAvatar from "../ui/avatar/UserAvatar";

const PopoverUserActions = ({ userInfo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logout = useLogout();
  const mode = useSelector((state) => state.theme.mode);
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const openModalUserInfo = () => {
    setOpenModal(true);
    setOpen(false);
  };

  const goToProfile = () => {
    navigate("/profile");
    setOpen(false);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
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
                {userInfo?.username}
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
                onClick={openModalUserInfo}
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
            avatarUrl={userInfo?.avatar?.url}
            name={userInfo?.username}
            size={48}
          />
        </button>
      </Popover>

      <ModalUserInfo isOpen={openModal} onCancel={() => setOpenModal(false)} />
    </>
  );
};

export default PopoverUserActions;
