import React from 'react';
import { EmconHeader } from '../components/emcon/EmconHeader';
import { EmconStatusCards } from '../components/emcon/EmconStatusCards';
import { OperationalCommsMap } from '../components/emcon/OperationalCommsMap';
import { RecentEmconEventsCard } from '../components/emcon/RecentEmconEventsCard';
import { EmconIncidentAlertsCard } from '../components/emcon/EmconIncidentAlertsCard';
import { CommunicationLogCard } from '../components/emcon/CommunicationLogCard';

export const EmconPage: React.FC = () => {
  return (
    <div className="relative space-y-4 animate-fadeIn pb-10 min-h-screen">
      {/* Confined Warship Silhouette Overlay behind header */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[550px] h-[190px] opacity-25 mix-blend-screen bg-contain bg-no-repeat bg-right-top z-0"
        style={{
          backgroundImage: `url('/Login_BG.png')`,
          maskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 95%)',
        }}
      />

      {/* Page Header */}
      <EmconHeader />

      {/* Row 1: 4 Status Cards */}
      <EmconStatusCards />

      {/* Row 2: Operational Map (60%) + Events & Incident Alerts (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start relative z-10">
        {/* Left Column: Operational Communication Map (~60% / 7 cols) */}
        <div className="lg:col-span-12 xl:col-span-7 2xl:col-span-7 flex flex-col">
          <OperationalCommsMap />
        </div>

        {/* Right Column: Events & Incidents (~40% / 5 cols) */}
        <div className="lg:col-span-12 xl:col-span-5 2xl:col-span-5 space-y-4">
          <RecentEmconEventsCard />
          <EmconIncidentAlertsCard />
        </div>
      </div>

      {/* Row 3: Full Width Communication Audit Log */}
      <div className="relative z-10">
        <CommunicationLogCard />
      </div>
    </div>
  );
};

export default EmconPage;
