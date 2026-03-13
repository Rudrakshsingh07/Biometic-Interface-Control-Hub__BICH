import { type SessionAnalytics } from "@/hooks/useAppState";
import { Activity, Clock, Eye, Hash } from "lucide-react";
import { type MutableRefObject, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface AnalyticsWidgetProps {
  analytics: SessionAnalytics;
  sessionStartRef: MutableRefObject<number | null>;
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// Generate mock session data for charts based on real analytics
function generateSessionData(sessionCount: number) {
  const hours = ["6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
  return hours.map((hour, i) => ({
    hour,
    activity: Math.max(0, Math.round(Math.sin((i - 2) * 0.5) * 40 + 30 + Math.random() * 20)),
    sessions: Math.round(Math.random() * Math.max(1, sessionCount / 3)),
  }));
}

function generateWeeklyData(totalMs: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  return days.map((day, i) => ({
    day,
    minutes: i <= (today === 0 ? 6 : today - 1)
      ? Math.round(Math.random() * 120 + 10)
      : 0,
  }));
}

export function AnalyticsWidget({ analytics, sessionStartRef }: AnalyticsWidgetProps) {
  const currentSessionMs = sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
  const totalMs = analytics.totalDeskTimeMs + currentSessionMs;

  const sessionData = useMemo(() => generateSessionData(analytics.sessionCount), [analytics.sessionCount]);
  const weeklyData = useMemo(() => generateWeeklyData(totalMs), [totalMs]);

  return (
    <div className="glass-panel h-full p-4 flex flex-col gap-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <Activity className="w-3 h-3" /> Dashboard Analytics
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-panel p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> Desk Time
          </span>
          <span className="text-lg font-mono font-semibold text-foreground">{formatDuration(totalMs)}</span>
        </div>
        <div className="glass-panel p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Hash className="w-2.5 h-2.5" /> Sessions
          </span>
          <span className="text-lg font-mono font-semibold text-foreground">{analytics.sessionCount}</span>
        </div>
        <div className="glass-panel p-3 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" /> Last Seen
          </span>
          <span className="text-lg font-mono font-semibold text-foreground">
            {analytics.lastSeenTime
              ? analytics.lastSeenTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "—"}
          </span>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Today's Activity</span>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="activity"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#activityGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Weekly Desk Time (min)</span>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
