import { useState, useEffect } from "react";
import { format } from "date-fns";

interface ClockDisplayProps {
  size?: "large" | "small";
}

export function ClockDisplay({ size = "large" }: ClockDisplayProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (size === "small") {
    return (
      <div className="lcd-display h-full p-3 flex flex-col items-center justify-center">
        <span className="text-3xl font-mono font-light text-primary tracking-wider lcd-text relative z-10">
          {format(now, "HH:mm")}
        </span>
        <span className="text-[9px] font-mono text-primary/50 mt-1 tracking-wide relative z-10">
          {format(now, "EEE, MMM d")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="lcd-display px-12 py-8">
        <span className="text-8xl font-mono font-extralight text-primary tracking-widest lcd-text relative z-10">
          {format(now, "HH:mm")}
        </span>
      </div>
      <span className="text-sm font-mono text-foreground/30 mt-4 tracking-wide">
        {format(now, "EEEE, MMMM d, yyyy")}
      </span>
    </div>
  );
}
