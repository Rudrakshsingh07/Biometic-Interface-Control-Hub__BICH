import { ClockDisplay } from "@/components/ClockDisplay";
import { CalendarWidget } from "@/components/CalendarWidget";
import { AnalyticsWidget } from "@/components/AnalyticsWidget";
import { CommandsWidget } from "@/components/CommandsWidget";
import { type SessionAnalytics } from "@/hooks/useAppState";
import { User, LogOut, Lock, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type MutableRefObject } from "react";

interface DashboardScreenProps {
  userId: string;
  analytics: SessionAnalytics;
  sessionStartRef: MutableRefObject<number | null>;
  onLogout: () => void;
  onLock: () => void;
  onAdmin: () => void;
  isAdmin: boolean;
}

export function DashboardScreen({ userId, analytics, sessionStartRef, onLogout, onLock, onAdmin, isAdmin }: DashboardScreenProps) {
  return (
    <div className="absolute inset-0 bg-background p-3 animate-fade-in">
      <div className="h-full flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-xs font-mono text-primary tracking-wider uppercase">Authenticated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5">
              <User className="w-3 h-3" /> {userId}
            </span>
            {isAdmin && (
              <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-xs text-muted-foreground gap-1" onClick={onAdmin}>
                <Settings className="w-3 h-3" /> Admin
              </Button>
            )}
            <Button variant="secondary" size="sm" className="h-7 px-2 font-mono text-xs gap-1" onClick={onLock}>
              <Lock className="w-3 h-3" /> Lock
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 font-mono text-xs text-muted-foreground gap-1" onClick={onLogout}>
              <LogOut className="w-3 h-3" /> Logout
            </Button>
          </div>
        </div>

        {/* Main Layout — two columns */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left: Commands + small widgets */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex-1 min-h-0">
              <CommandsWidget />
            </div>
            <div className="flex gap-3 h-24">
              <div className="flex-1">
                <ClockDisplay size="small" />
              </div>
              <div className="w-40">
                <CalendarWidget />
              </div>
              <div className="glass-panel flex flex-col items-center justify-center gap-1 p-2 w-20">
                <span className="text-[10px] font-mono text-muted-foreground leading-tight text-center">DESK<br/>COMPANION</span>
                <span className="text-[9px] font-mono text-muted-foreground/40">v1.0</span>
              </div>
            </div>
          </div>

          {/* Right: Analytics with charts */}
          <div className="w-80 min-h-0">
            <AnalyticsWidget analytics={analytics} sessionStartRef={sessionStartRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
