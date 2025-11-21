import { useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  arrow,
  useInteractions,
  useClick,
  useDismiss,
} from "@floating-ui/react";

export const useFloatingMenu = (placement = "bottom") => {
  const [open, setOpen] = useState(false); // trạng thái mở đóng menu
  const arrowRef = useRef(null); // ref cho arrow

  // Cấu hình useFloating
  const {
    refs,
    floatingStyles,
    placement: resolvedPlacement,
    middlewareData,
    context,
  } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(12),
      flip({ fallbackPlacements: ["top", "bottom"] }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Đóng menu khi click ngoài hoặc nhấn esc
  const dismiss = useDismiss(context, {
    outsidePress: true, // click ngoài sẽ đóng
    escapeKey: true,
  });

  // Mở đóng menu khi click vào reference element
  const click = useClick(context);

  // Kết hợp các interactions
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, click]);

  // Tính toán vị trí cho arrow
  const arrowData = middlewareData.arrow || {};
  const side = resolvedPlacement.split("-")[0];
  const staticSide = {
    top: "bottom",
    right: "left",
    bottom: "top",
    left: "right",
  }[side];

  // Style cho arrow
  const arrowStyle = {
    left: arrowData.x != null ? `${arrowData.x}px` : "",
    top: arrowData.y != null ? `${arrowData.y}px` : "",
    [staticSide]: "-6px",
  };

  return {
    open,
    setOpen,
    arrowRef,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    arrowStyle,
  };
};
