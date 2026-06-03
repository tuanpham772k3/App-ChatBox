import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import CommunityPanel from "@/components/community/CommunityPanel";
import CommunityFriends from "@/pages/CommunityFriends";

const CommunityLayout = () => {
  const location = useLocation();
  const isCommunityHome = location.pathname === "/community";

  return (
    <div className="h-full flex">
      <CommunityPanel isDetailOpen={!isCommunityHome} />

      {isCommunityHome ? <CommunityFriends /> : <Outlet />}
    </div>
  );
};

export default CommunityLayout;
