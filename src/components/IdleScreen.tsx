import { ClockDisplay } from "@/components/ClockDisplay";
import { KeyRound } from "lucide-react";

interface IdleScreenProps {
  onManualLogin: () => void;
}

export function IdleScreen({ onManualLogin }: IdleScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center metal-chassis animate-fade-in">
      <div className="flex flex-col items-center gap-8">
        <ClockDisplay size="large" />
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/30">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse-glow shadow-[0_0_6px_hsl(160_70%_50%/0.5)]" />
            <span>Watching for presence</span>
          </div>
          <button className="macropad-key macropad-key-silver px-5 py-2.5 flex items-center gap-2 font-mono text-xs" onClick={onManualLogin}>
            <KeyRound className="w-3.5 h-3.5" /> Manual Login
          </button>
        </div>
      </div>
    </div>
  );
}
