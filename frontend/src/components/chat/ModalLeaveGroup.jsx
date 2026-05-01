import React, { useState } from "react";
import { Modal, Select } from "antd";
import { useDispatch } from "react-redux";
import { transferGroupOwnership } from "@/store/conversationsSlice";

const ModalLeaveGroup = ({
  isOpen,
  onClose,
  onLeave,
  conversationId,
  currentUser,
  members = [],
}) => {
  const dispatch = useDispatch();
  const [newOwnerId, setNewOwnerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const isOwner = currentUser?.role === "owner";

  const handleLeave = async () => {
    try {
      setLoading(true);

      // OWNER → phải transfer trước
      if (isOwner) {
        if (!newOwnerId) return;

        await dispatch(transferGroupOwnership({ conversationId, newOwnerId })).unwrap();
      }

      if (onLeave) {
        await onLeave();
      }

      onClose();
    } catch (err) {
      console.log("Lỗi rời nhóm:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter member có thể làm owner (trừ chính mình)
  const availableMembers = members.filter((m) => m.id !== currentUser?.id);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      onOk={handleLeave}
      confirmLoading={loading}
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
              label: m.name,
              value: m.id,
            }))}
          />
        </div>
      )}
    </Modal>
  );
};

export default ModalLeaveGroup;
