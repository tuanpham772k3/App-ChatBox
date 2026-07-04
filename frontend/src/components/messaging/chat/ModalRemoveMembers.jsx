import React from "react";
import { useDispatch } from "react-redux";
import { Modal } from "antd";
import { useNotification } from "@/hooks/useNotification";
import { removeMemberFromGroup } from "@/store/conversationsSlice";

const ModalRemoveMembers = ({ isOpen, onCancel, activeConversationId, member }) => {
  const dispatch = useDispatch();
  const notification = useNotification();

  // Xóa thành viên
  const handleRemoveMembersToGroup = async () => {
    try {
      await dispatch(
        removeMemberFromGroup({
          conversationId: activeConversationId,
          memberId: member.id,
        })
      ).unwrap();
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
      <div className="py-4">
        <p>Xóa thành viên này khỏi nhóm: {member?.displayName}</p>
      </div>
    </Modal>
  );
};

export default ModalRemoveMembers;
