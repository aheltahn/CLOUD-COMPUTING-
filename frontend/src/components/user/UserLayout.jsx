import React from "react";
import UserHeader from "./UserHeader";

const UserLayout = ({ children }) => {
  return (
    <div className="min-h-screen" style={{
      backgroundImage:
        "linear-gradient(to bottom, #051F20, #0B2B26, #163832, #235347, #8EB69B, #DAF1DE)",
    }}>
      <UserHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default UserLayout;
