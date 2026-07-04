import React, { useState } from "react";
import { Modal, Select } from "antd";
import { useDispatch } from "react-redux";
import { leaveGroup, transferGroupOwnership } from "@/store/conversationsSlice";

const ModalLeaveGroup = ({ isOpen, onClose, conversationId, me, members = [] }) => {
  const dispatch = useDispatch();
  const [newOwnerId, setNewOwnerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const isOwner = me?.role === "owner";
  // Filter member có thể làm owner (trừ chính mình)
  const availableMembers = members.filter((m) => m.id !== me?.id);

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);

      // OWNER → phải transfer trước
      if (isOwner) {
        if (!newOwnerId) return;

        await dispatch(transferGroupOwnership({ conversationId, newOwnerId })).unwrap();
      }

      await dispatch(leaveGroup(conversationId)).unwrap();

      notification.success({
        message: "Rời nhóm thành công",
      });

      onClose();
    } catch (error) {
      notification.error({
        message: "Rời nhóm thất bại",
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleLeaveGroup}
      confirmLoading={loading}
      width="min(calc(100vw - 2rem), 25rem)"
      okText="Xác nhận"
      cancelText="Hủy"
      title="Rời nhóm"
    >
      {!isOwner ? (
        <p>Bạn có chắc muốn rời nhóm không?</p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-red-500 font-medium">
            Bạn là trưởng nhóm. Bạn phải nhượng quyền trước khi rời nhóm.
          </p>

          <Select
            placeholder="Chọn thành viên làm trưởng nhóm mới"
            value={newOwnerId}
            onChange={setNewOwnerId}
            options={availableMembers.map((m) => ({
              label: m.displayName,
              value: m.id,
            }))}
          />
        </div>
      )}
    </Modal>
  );
};

export default ModalLeaveGroup;
