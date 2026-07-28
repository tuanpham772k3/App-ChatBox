import { Popover } from "antd";
import { X } from "lucide-react";
import { REACTIONS } from "@/constants/reactions";

const ReactionPicker = ({ children, onSelect, open, onOpenChange, myReaction }) => {
  const REACTIONS_LIST = Object.values(REACTIONS);

  const content = (
    <div className="flex items-center gap-3">
      {REACTIONS_LIST.map((reaction) => (
        <button
          key={reaction.key}
          type="button"
          onClick={() => {
            onSelect?.(reaction.key);
            onOpenChange?.(false);
          }}
          className="flex items-center justify-center rounded-full transition-transform duration-150 hover:scale-125 active:scale-110"
        >
          <img
            src={reaction.src}
            alt={reaction.label}
            className="h-6 w-6 select-none"
            draggable={false}
          />
        </button>
      ))}
      {myReaction && (
        <button
          type="button"
          onClick={() => {
            onSelect?.(myReaction.emoji);
            onOpenChange?.(false);
          }}
        >
          <X size={20} />
        </button>
      )}
    </div>
  );

  return (
    <Popover
      trigger="hover"
      placement="topRight"
      content={content}
      open={open}
      onOpenChange={onOpenChange}
      mouseEnterDelay={0.2}
    >
      {children}
    </Popover>
  );
};

export default ReactionPicker;
