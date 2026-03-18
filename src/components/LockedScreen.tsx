import { ClockDisplay } from "@/components/ClockDisplay";
import { ShieldAlert, RefreshCw, LogIn } from "lucide-react";

interface LockedScreenProps {
  onRetry: () => void;
  onManualLogin: () => void;
}

export function LockedScreen({ onRetry, onManualLogin }: LockedScreenProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center metal-chassis animate-fade-in">
      <div className="flex flex-col items-center gap-6">
        {/* Warning icon in LCD */}
        <div className="lcd-display p-6 flex flex-col items-center gap-3">
          <div className="relative z-10">
            <ShieldAlert className="w-14 h-14 text-amber-400" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-amber-400/30 animate-pulse-glow" />
          </div>
          <span className="text-base font-mono text-amber-400 tracking-wider lcd-text relative z-10">UNRECOGNIZED</span>
          <span className="text-xs font-mono text-primary/40 relative z-10">Access denied • Attempt logged</span>
        </div>

        {/* Action buttons as metal keycaps */}
        <div className="flex gap-3 mt-2">
          <button className="macropad-key macropad-key-silver px-5 py-2.5 flex items-center gap-2 font-mono text-xs" onClick={onManualLogin}>
            <LogIn className="w-4 h-4" /> Manual Login
          </button>
          <button className="macropad-key macropad-key-silver px-5 py-2.5 flex items-center gap-2 font-mono text-xs" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>

      {/* Bottom Clock */}
      <div className="absolute bottom-10">
        <ClockDisplay size="small" />
      </div>
    </div>
  );
}
