import React from "react";
import { Menu } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";

const CommunityPage = () => {
  const { openMobileSidebar } = useLayout();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <header className="h-16 sm:h-20 flex items-center gap-3 px-4 border-b border-[var(--color-border)] shrink-0">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={openMobileSidebar}
          className="flex lg:hidden size-10 shrink-0 items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-hover)] active:bg-[var(--color-active)] transition-colors"
        >
          <Menu size={22} />
        </button>
        <h1 className="min-w-0 truncate font-bold text-2xl text-[var(--color-primary)] text-shadow-sm">
          Community
        </h1>
      </header>

      <div className="flex-1 p-4 overflow-y-auto text-[var(--color-text-secondary)]">
        Trang Community — sắp có thêm kết bạn và nhắn tin.
      </div>
    </div>
  );
};

export default CommunityPage;
