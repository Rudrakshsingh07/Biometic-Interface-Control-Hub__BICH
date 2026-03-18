import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/config";
import {
  Power, Lock, Code2, Camera, Github, Timer, Pencil, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Command {
  action: string;
  label: string;
  icon: React.ReactNode;
  isShutdown?: boolean;
}

const COMMANDS: Command[] = [
  { action: "shutdown", label: "Shut Down", icon: <Power className="w-6 h-6" />, isShutdown: true },
  { action: "lock", label: "Lock", icon: <Lock className="w-6 h-6" /> },
  { action: "coding_workspace", label: "Code", icon: <Code2 className="w-6 h-6" /> },
  { action: "capture_inspiration", label: "Capture Inspiration", icon: <Camera className="w-6 h-6" /> },
  { action: "system_upgrade", label: "Project Stats", icon: <Github className="w-6 h-6" /> },
  { action: "pomodoro_30", label: "Pomodoro", icon: <Timer className="w-6 h-6" /> },
];

async function runCommand(action: string) {
  try {
    const res = await fetch(`${getApiBase()}/command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    return await res.json();
  } catch {
    return { status: "error" };
  }
}

export function CommandsWidget() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [pressing, setPressing] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [repoOverlayOpen, setRepoOverlayOpen] = useState(false);
  const [repoLink, setRepoLink] = useState("");

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleCommand = async (action: string) => {
    setLastResult(null);
    const result = await runCommand(action);
    setLastResult(result.status === "ok" ? `✓ ${action}` : `✗ ${action}`);
    setTimeout(() => setLastResult(null), 2000);
  };

  return (
    <div className="macropad-body h-full p-5 flex flex-col gap-4 overflow-hidden">
      {/* Status LCD */}
      <div className="lcd-display px-4 py-2 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-primary lcd-text">
          Macro Pad — Ready
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-primary/70 lcd-text tabular-nums">
            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {lastResult && (
            <span className="text-[10px] font-mono text-primary animate-fade-in lcd-text">{lastResult}</span>
          )}
        </div>
      </div>

      {/* Button Grid — 3×2 */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 min-h-0">
        {COMMANDS.map((cmd) => (
          <button
            key={cmd.action}
            className={`macropad-key group relative flex flex-col items-center justify-center gap-2.5 rounded-xl transition-all duration-100 select-none
              ${cmd.isShutdown ? "macropad-key-shutdown" : "macropad-key-silver"}
              ${pressing === cmd.action ? "macropad-key-pressed" : ""}
            `}
            onPointerDown={() => setPressing(cmd.action)}
            onPointerUp={() => setPressing(null)}
            onPointerLeave={() => setPressing(null)}
            onClick={() => handleCommand(cmd.action)}
          >
            {cmd.action === "system_upgrade" && (
              <button
                type="button"
                className="absolute bottom-2 right-2 h-7 w-7 rounded-full flex items-center justify-center border border-white/10 bg-black/20 hover:bg-black/30 transition"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRepoOverlayOpen(true);
                }}
                aria-label="Edit GitHub repo link"
                title="Set GitHub repo link"
              >
                <Pencil className="w-3.5 h-3.5 text-foreground/70" />
              </button>
            )}
            <div className={`${cmd.isShutdown ? "text-orange-950" : "text-foreground/80"} group-hover:scale-110 transition-transform drop-shadow-sm`}>
              {cmd.icon}
            </div>
            <span className={`text-[10px] font-mono font-semibold tracking-wider uppercase ${cmd.isShutdown ? "text-orange-950" : "text-foreground/60"}`}>
              {cmd.label}
            </span>
          </button>
        ))}
      </div>

      {repoOverlayOpen && (
        <div className="overlay-backdrop" onClick={() => setRepoOverlayOpen(false)}>
          <div
            className="overlay-panel w-[min(520px,92vw)] p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="macropad-screw" />
                <div className="lcd-display px-3 py-1.5 flex items-center gap-2 text-sm font-mono text-primary">
                  <Github className="w-4 h-4" />
                  <span className="lcd-text">Project Repo Link</span>
                </div>
              </div>
              <button className="metal-close-btn" onClick={() => setRepoOverlayOpen(false)} aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="lcd-display p-3 flex flex-col gap-2 relative z-10">
              <span className="text-[10px] font-mono text-primary/40">
                Paste a GitHub repository URL (e.g. https://github.com/org/repo)
              </span>
              <Input
                value={repoLink}
                onChange={(e) => setRepoLink(e.target.value)}
                placeholder="https://github.com/..."
                className="font-mono bg-transparent border-0 text-primary placeholder:text-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 relative z-10">
              <Button
                type="button"
                variant="secondary"
                className="font-mono text-xs"
                onClick={() => setRepoOverlayOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="font-mono text-xs gap-1"
                onClick={() => setRepoOverlayOpen(false)}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
