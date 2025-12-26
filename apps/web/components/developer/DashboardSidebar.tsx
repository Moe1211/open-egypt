'use client';

import { 
  LayoutDashboard, 
  Key, 
  BookOpen, 
  Settings, 
  Pyramid,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Partner } from '@/types/partner';
import { useState } from 'react';

interface DashboardSidebarProps {
  partner: Partner;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { id: 'keys', icon: Key, label: 'API Keys' },
  { id: 'docs', icon: BookOpen, label: 'Documentation' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function DashboardSidebar({ partner, activeTab, setActiveTab }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "h-screen sticky top-0 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[260px]"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Pyramid className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-up">
              <h2 className="font-semibold text-sidebar-foreground truncate">{partner.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge 
                  variant={partner.tier === 'partner' ? 'default' : 'secondary'}
                  className={cn(
                    "text-xs capitalize",
                    partner.tier === 'partner' && "gradient-primary border-0"
                  )}
                >
                  {partner.tier === 'partner' && <Sparkles className="w-3 h-3 mr-1" />}
                  {partner.tier}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                "text-sidebar-foreground hover:bg-sidebar-accent",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive && "text-primary"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Upgrade CTA (only for free tier) */}
      {partner.tier === 'free' && !collapsed && (
        <div className="p-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Upgrade to Partner</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Unlock higher rate limits and premium support
            </p>
            <Button size="sm" className="w-full gradient-primary text-primary-foreground">
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}