import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

const BaseModal = ({ open, onCancel, width = 500, footer = null, children, title }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={footer}
      width={width}
      centered
      closeIcon={<CloseOutlined style={{ color: "white" }} />}
      styles={{
        content: {
          backgroundColor: "var(--bg-primary)",
          padding: 0,
        },
      }}
    >
      {/* Header */}
      {title && (
        <div className="px-4 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
        </div>
      )}

      {children}
    </Modal>
  );
};

export default BaseModal;
