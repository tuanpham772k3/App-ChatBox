import { deleteConversation } from "@/features/conversations/conversationsSlice";
import { useNotification } from "@/shared/hooks/useNotification";
import { Modal } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const ModalRemoveGroup = ({ open, onClose, conversationId, onBackToList }) => {
  const navigation = useNavigate();
  const notification = useNotification();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);

      await dispatch(deleteConversation(conversationId)).unwrap();

      notification.success({
        message: "Giải tán nhóm thành công",
      });

      onClose();

      onBackToList();
    } catch (err) {
      notification.error({
        message: "Giải tán nhóm thất bại",
        description: err.message || "Có lỗi xảy ra",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleRemove}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
      title="Giải tán nhóm"
    >
      <div className="flex flex-col gap-3">
        <p className="text-red-500 font-medium">
          Hành động này sẽ xóa tất cả tin nhắn và dữ liệu liên quan đến cuộc trò chuyện
          này, và tất cả thành viên sẽ bị kick ra khỏi nhóm.
        </p>
      </div>
    </Modal>
  );
};

export default ModalRemoveGroup;
