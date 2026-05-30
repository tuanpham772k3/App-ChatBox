import React from "react";
import { useDispatch } from "react-redux";
import { Checkbox, Modal } from "antd";
import { useNotification } from "@/hooks/useNotification";
import { removeMemberFromGroup } from "@/store/conversationsSlice";

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
      width="min(calc(100vw - 2rem), 25rem)"
      onOk={handleRemoveMembersToGroup}
      okText="Đồng ý"
      cancelText="Đóng"
      title="Xác nhận xóa thành viên"
    >
      <div className="space-y-4 border-y-1 border-[var(--color-border)] py-4">
        <h3>Xóa thành viên này khỏi nhóm?</h3>
        <div className="flex gap-2">
          <Checkbox />
          <span>Chặn người này tham gia lại</span>
        </div>
      </div>
    </Modal>
  );
};

export default ModalRemoveMembers;
