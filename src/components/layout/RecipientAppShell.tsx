import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { RecipientSidebar } from './RecipientSidebar';
import { RecipientTopBar } from './RecipientTopBar';

export const RecipientAppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#0F172A] flex flex-col font-sans relative overflow-x-hidden">
      {/* Left Recipient Sidebar (~250px) */}
      <RecipientSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
          sidebarCollapsed ? 'pl-20' : 'pl-[250px]'
        }`}
      >
        {/* Top Header Bar */}
        <RecipientTopBar />

        {/* Page Content Viewport */}
        <main className="flex-1 p-5 sm:p-6 lg:p-7 max-w-[1680px] w-full mx-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
