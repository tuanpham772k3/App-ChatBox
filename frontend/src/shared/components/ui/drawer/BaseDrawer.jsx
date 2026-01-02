import { Drawer } from "antd";

const BaseDrawer = ({
  open,
  onClose,
  title,
  width = 360,
  children,
  placement = "right",
}) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={width}
      title={<div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{title}</div>}
      placement={placement}
      styles={{ body: { padding: 0 }, header: { textAlign: "center" } }}
    >
      {children}
    </Drawer>
  );
};

export default BaseDrawer;
