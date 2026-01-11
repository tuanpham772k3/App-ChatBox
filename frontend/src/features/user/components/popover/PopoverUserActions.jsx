import React, { useState } from "react";
import { Popover } from "antd";
import ModalUserInfo from "../modal/ModalUserInfo";

const PopoverUserActions = ({ children, userInfo }) => {
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const openModalUserInfo = () => {
    setOpenModal(true);
    setOpen(false);
  };
  const closeModalUserInfo = () => setOpenModal(false);

  return (
    <>
      <Popover
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        placement="rightTop"
        content={
          <div className="w-[160px]">
            {/* header */}
            <header className="border-b border-[var(--color-border)]">
              <h2 className="px-3 pb-2 text-lg font-medium text-[var(--color-text-primary)]">
                {userInfo.username}
              </h2>
            </header>
            {/* body */}
            <div className="flex flex-col gap-1">
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)] 
            hover:bg-[var(--color-hover-surface)] rounded"
              >
                Năng cấp tài khoản
              </button>
              <button
                onClick={openModalUserInfo}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)] 
            hover:bg-[var(--color-hover-surface)] rounded"
              >
                Hồ sơ
              </button>
              <button
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-[var(--color-text-primary)] 
            hover:bg-[var(--color-hover-surface)] rounded"
              >
                Cài đặt
              </button>
            </div>
            {/* footer */}
            <footer className="pt-1 border-t border-[var(--color-border)]">
              <button className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-[var(--color-hover-surface)] rounded">
                Đăng xuất
              </button>
            </footer>
          </div>
        }
      >
        {children}
      </Popover>

      <ModalUserInfo isOpen={openModal} onCancel={closeModalUserInfo} />
    </>
  );
};

export default PopoverUserActions;
