'use client';

import { DashboardSidebar } from './DashboardSidebar';
import { Partner } from '@/types/partner';

interface DashboardLayoutProps {
  partner: Partner;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function DashboardLayout({ partner, children, activeTab, setActiveTab }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar partner={partner} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8 px-6">
          {children}
        </div>
      </main>
    </div>
  );
}