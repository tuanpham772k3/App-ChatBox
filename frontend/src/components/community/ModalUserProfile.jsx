import React from "react";
import { Descriptions, Modal } from "antd";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdBlock } from "react-icons/md";
import UserAvatar from "../ui/avatar/UserAvatar";

const ModalUserProfile = ({
  isOpen,
  onCancel,
  selectedUser,
  onAcceptRequest,
  onCancelRequest,
}) => {
  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      width="min(calc(100vw - 2rem), 25rem)"
      footer={null}
      styles={{
        content: {
          padding: 0,
        },
      }}
      centered
    >
      <div className="h-[70vh] flex flex-col overflow-hidden">
        <header className="h-12 flex items-center px-4">
          <h1 className="text-[var(--color-text-primary)] text-base font-semibold">
            Thông tin tài khoản
          </h1>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <section className="border-b-4 border-[var(--color-border)]">
            <img
              src="https://24hstore.vn/upload_images/images/anh-bia-facebook-dep/anh-bia-facebook-dep_(1).jpg"
              alt="Ảnh bìa"
              className="w-full h-40 object-cover"
            />
            {/* Avatar + Name */}
            <div className="relative h-20 px-4">
              <div className="absolute bottom-4 flex items-center gap-4">
                <UserAvatar
                  name={selectedUser?.username || "Người dùng"}
                  avatarUrl={selectedUser?.avatar?.url}
                  size={80}
                />
                <div>
                  <h2 className="min-w-0 truncate text-base font-medium">
                    {selectedUser?.username}
                  </h2>
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="flex gap-2 px-4 pb-4">
              {/* Bạn bè */}
              {selectedUser?.relationship?.status === "friend" && (
                <>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-white
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                active:bg-[var(--color-primary-active)]"
                  >
                    Nhắn tin
                  </button>
                </>
              )}
              {/* Không phải bạn bè */}
              {selectedUser?.relationship?.status === "not_friend" && (
                <>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-chat)]
                hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Kết bạn
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-white
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                active:bg-[var(--color-primary-active)]"
                  >
                    Nhắn tin
                  </button>
                </>
              )}
              {/* Đã gửi yêu cầu và đang chờ xác nhận */}
              {selectedUser?.relationship?.status === "pending_sent" && (
                <>
                  <button
                    onClick={() => onCancelRequest(selectedUser?.relationship?._id)}
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-chat)]
                hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Hủy lời mời
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-white
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                active:bg-[var(--color-primary-active)]"
                  >
                    Nhắn tin
                  </button>
                </>
              )}
              {/* Nhận được yêu cầu */}
              {selectedUser?.relationship?.status === "pending_received" && (
                <>
                  <button
                    onClick={() => onAcceptRequest(selectedUser?.relationship?._id)}
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-chat)]
                hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Chấp nhận
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium text-white
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
                active:bg-[var(--color-primary-active)]"
                  >
                    Nhắn tin
                  </button>
                </>
              )}
              {/* Bạn đã chặn người này */}
              {selectedUser?.relationship?.status === "blocked_by_me" && (
                <>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-chat)]
                hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Bỏ chặn người này
                  </button>
                </>
              )}
              {/* Bạn đã bị người này chặn */}
              {selectedUser?.relationship?.status === "blocked_by_other" && (
                <>
                  <button
                    type="button"
                    className="flex-1 h-8 rounded-sm font-medium
                text-[var(--color-text-primary)] bg-[var(--color-chat)]
                hover:bg-[var(--color-hover-elevated)] active:bg-[var(--color-active)]"
                  >
                    Bạn đã bị người này chặn
                  </button>
                </>
              )}
            </div>
          </section>

          {/* Personal Info */}
          <section className="p-4 border-b-4 border-[var(--color-border)]">
            <h3 className="mb-4 text-base font-medium">Thông tin cá nhân</h3>

            <Descriptions column={1}>
              <Descriptions.Item label="Giới tính">Nam</Descriptions.Item>

              <Descriptions.Item label="Ngày sinh">07 tháng 07, 2003</Descriptions.Item>

              <Descriptions.Item label="Email">{selectedUser?.email}</Descriptions.Item>

              <Descriptions.Item label="Bio">
                {selectedUser?.bio || "..."}
              </Descriptions.Item>
            </Descriptions>
          </section>

          <section className="flex flex-col py-4">
            <button className="w-full flex items-center gap-3 py-4 px-4 hover:bg-[var(--color-hover)]">
              <HiOutlineUsers size={20} />
              <span>Nhóm chung (1)</span>
            </button>
            <button className="w-full flex items-center gap-3 py-4 px-4 hover:bg-[var(--color-hover)]">
              <MdBlock size={20} />
              <span>Chặn tin nhắn và cuộc gọi</span>
            </button>
          </section>
        </div>
      </div>
    </Modal>
  );
};

export default ModalUserProfile;
