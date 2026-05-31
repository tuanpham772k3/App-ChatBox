import React, { useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { Drawer, Grid } from "antd";
import Sidebar from "@/components/layout/Sidebar";
import { LayoutProvider } from "@/contexts/LayoutContext";

const { useBreakpoint } = Grid;

const MainLayout = () => {
  const screens = useBreakpoint();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (screens.md) {
      setIsSidebarOpen(false);
    }
  }, [screens.md]);

  const layoutValue = useMemo(
    () => ({
      openMobileSidebar: () => setIsSidebarOpen(true),
      closeMobileSidebar: () => setIsSidebarOpen(false),
    }),
    []
  );

  return (
    <LayoutProvider value={layoutValue}>
      <main
        className="min-h-screen h-dvh flex overflow-hidden"
        aria-label="Application"
      >
        <aside className="shrink-0" aria-label="Primary navigation">
          <Sidebar />
        </aside>

        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          placement="left"
          width={224}
          closable={false}
          styles={{ body: { padding: 0 } }}
          rootClassName="lg:hidden"
          destroyOnHidden
        >
          <Sidebar mode="mobile" onClose={() => setIsSidebarOpen(false)} />
        </Drawer>

        <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </main>
    </LayoutProvider>
  );
};

export default MainLayout;
