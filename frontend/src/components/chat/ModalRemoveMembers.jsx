import React from "react";
import { Button, Checkbox, Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useNotification } from "@/hooks/useNotification";
import { removeMemberFromGroup } from "@/store/conversationsSlice";
import { useDispatch } from "react-redux";

const ModalRemoveMembers = ({ isOpen, onCancel, memberId, conversationId }) => {
  const dispatch = useDispatch();
  const notification = useNotification();

  // Xóa thành viên
  const handleRemoveMembersToGroup = async () => {
    try {
      await dispatch(removeMemberFromGroup({ conversationId, memberId })).unwrap();
      onCancel();
    } catch (error) {
      notification.error({
        message: "Xóa thành viên thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onCancel}
      footer={null}
      width="min(calc(100vw - 2rem), 25rem)"
      centered
      closeIcon={<CloseOutlined style={{ color: "var(--color-text-secondary)" }} />}
      styles={{
        content: {
          backgroundColor: "var(--color-app)",
          padding: 0,
        },
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-[var(--color-text-primary)] text-lg font-semibold">
          Xác nhận
        </h2>
      </div>
      {/* Body */}
      <div className="p-4 space-y-4">
        <h3>Xóa thành viên này khỏi nhóm?</h3>
        <div className="flex gap-2">
          <Checkbox />
          <span>Chặn người này tham gia lại</span>
        </div>
      </div>
      {/* Footer */}
      <div className="p-4 flex justify-end gap-3 border-t border-[var(--color-border)]">
        <Button onClick={onCancel}>Đóng</Button>
        <Button onClick={handleRemoveMembersToGroup} type="primary">
          Đồng ý
        </Button>
      </div>
    </Modal>
  );
};

export default ModalRemoveMembers;
