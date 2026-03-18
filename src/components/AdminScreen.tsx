import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Users, BarChart3, ArrowLeft, Plus, Trash2, Shield, Clock, Eye, Hash, Upload, Loader2, Camera, X,
} from "lucide-react";
import { type SessionAnalytics } from "@/hooks/useAppState";
import { type MutableRefObject } from "react";
import { deleteUser, fetchUsers, registerUser, type UserRecord } from "@/lib/api";
import { toast } from "@/components/ui/sonner";

type ManagedUser = UserRecord & { id: string };

interface AdminScreenProps {
  analytics: SessionAnalytics;
  sessionStartRef: MutableRefObject<number | null>;
  onBack: () => void;
}

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function AdminScreen({ analytics, sessionStartRef, onBack }: AdminScreenProps) {
  const [tab, setTab] = useState<"users" | "analytics">("users");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [faceImageBase64, setFaceImageBase64] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const camVideoRef = useRef<HTMLVideoElement | null>(null);
  const camCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const currentSessionMs = sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
  const totalMs = analytics.totalDeskTimeMs + currentSessionMs;

  const stopCamera = useCallback(() => {
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    camStreamRef.current = null;
    setCameraReady(false);
    if (camVideoRef.current) camVideoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      camStreamRef.current = stream;
      if (camVideoRef.current) {
        camVideoRef.current.srcObject = stream;
        await camVideoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      toast.error("Could not access camera.");
      setIsCameraOpen(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await fetchUsers();
      if (!alive) return;
      setUsers(list.map((u) => ({ ...u, id: u.username })));
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!isCameraOpen) {
      stopCamera();
      return;
    }
    void startCamera();
    return () => stopCamera();
  }, [isCameraOpen, startCamera, stopCamera]);

  useEffect(() => {
    // Cleanup on unmount
    return () => stopCamera();
  }, [stopCamera]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const canAddUser = useMemo(() => {
    return Boolean(newUsername.trim() && newPassword.trim() && faceImageBase64);
  }, [newUsername, newPassword, faceImageBase64]);

  const handleAddUser = async () => {
    if (!newUsername.trim() || !newPassword.trim() || !faceImageBase64) {
      toast.error("Please fill all fields and provide a face image.");
      return;
    }
    setIsUploading(true);
    try {
      const result = await registerUser(newUsername.trim(), newPassword, newRole, faceImageBase64);
      if (result.status !== "ok") {
        console.error("Failed to register face:", result.error);
        toast.error(result.error || "Failed to register user on the server.");
        return;
      }
      const fresh = await fetchUsers();
      setUsers(fresh.map((u) => ({ ...u, id: u.username })));
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
      setFaceFile(null);
      setFaceImageBase64(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success(`User "${newUsername.trim()}" registered successfully.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    const res = await deleteUser(username);
    if (res.status !== "ok") {
      toast.error(res.error || "Failed to delete user.");
      return;
    }
    const fresh = await fetchUsers();
    setUsers(fresh.map((u) => ({ ...u, id: u.username })));
    toast.success(`User "${username}" deleted.`);
  };

  return (
    <div className="absolute inset-0 bg-background p-4 animate-fade-in">
      <div className="h-full flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="font-mono text-xs gap-1 text-muted-foreground" onClick={onBack}>
              <ArrowLeft className="w-3 h-3" /> Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary tracking-wider">ADMIN PANEL</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <Button
            variant={tab === "users" ? "default" : "secondary"}
            size="sm"
            className="font-mono text-xs gap-1"
            onClick={() => setTab("users")}
          >
            <Users className="w-3 h-3" /> Users
          </Button>
          <Button
            variant={tab === "analytics" ? "default" : "secondary"}
            size="sm"
            className="font-mono text-xs gap-1"
            onClick={() => setTab("analytics")}
          >
            <BarChart3 className="w-3 h-3" /> Analytics
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {tab === "users" && (
            <div className="flex flex-col gap-4">
              {/* Add user form */}
              <div className="glass-panel p-4">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 block">Add User</span>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Username</label>
                    <Input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="username"
                      className="font-mono text-sm bg-muted border-border"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="password"
                      className="font-mono text-sm bg-muted border-border"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as "admin" | "user")}
                      className="w-full h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono text-foreground"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-mono text-muted-foreground mb-1 block">Face Image</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0] || null;
                          setFaceFile(file);
                          if (!file) {
                            setFaceImageBase64(null);
                            return;
                          }
                          try {
                            const b64 = await fileToBase64(file);
                            setFaceImageBase64(b64);
                          } catch {
                            toast.error("Failed to read image.");
                            setFaceImageBase64(null);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 gap-1 font-mono text-xs"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-3 h-3" />
                        {faceFile ? faceFile.name.slice(0, 15) : "Upload"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 gap-1 font-mono text-xs"
                        onClick={() => setIsCameraOpen(true)}
                      >
                        <Camera className="w-3 h-3" />
                        Live
                      </Button>
                      {faceImageBase64 && (
                        <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-muted">
                          <img
                            src={faceImageBase64}
                            alt="Face preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={handleAddUser} size="sm" className="h-10 gap-1 font-mono text-xs" disabled={isUploading || !canAddUser}>
                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    {isUploading ? "Saving…" : "Add"}
                  </Button>
                </div>
              </div>

              {isCameraOpen && (
                <div className="overlay-backdrop">
                  <div className="overlay-panel w-[min(720px,95vw)] p-5">
                    <div className="flex items-center justify-between relative z-10 mb-3">
                      <span className="text-xs font-mono text-foreground/70 tracking-wider uppercase">
                        Live Capture
                      </span>
                      <button
                        className="metal-close-btn"
                        onClick={() => setIsCameraOpen(false)}
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-4 relative z-10 flex-col sm:flex-row">
                      <div className="flex-1">
                        <div className="lcd-display overflow-hidden">
                          <video
                            ref={camVideoRef}
                            className="w-full h-[260px] sm:h-[320px] object-cover"
                            playsInline
                            muted
                          />
                        </div>
                        <canvas ref={camCanvasRef} className="hidden" />
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            type="button"
                            className="gap-1 font-mono text-xs"
                            disabled={!cameraReady}
                            onClick={() => {
                              const video = camVideoRef.current;
                              const canvas = camCanvasRef.current;
                              if (!video || !canvas || video.readyState < 2) {
                                toast.error("Camera not ready yet.");
                                return;
                              }
                              const ctx = canvas.getContext("2d");
                              if (!ctx) return;
                              canvas.width = video.videoWidth || 640;
                              canvas.height = video.videoHeight || 480;
                              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                              const b64 = canvas.toDataURL("image/jpeg", 0.85);
                              setFaceFile(null);
                              setFaceImageBase64(b64);
                              setIsCameraOpen(false);
                            }}
                          >
                            <Camera className="w-3 h-3" /> Capture
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="gap-1 font-mono text-xs"
                            onClick={() => {
                              setFaceFile(null);
                              setFaceImageBase64(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>

                      <div className="w-full sm:w-52">
                        <span className="text-xs font-mono text-muted-foreground block mb-2">Preview</span>
                        <div className="lcd-display overflow-hidden h-[140px] sm:h-[160px] flex items-center justify-center">
                          {faceImageBase64 ? (
                            <img src={faceImageBase64} alt="Captured face" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-mono text-foreground/30">No image yet</span>
                          )}
                        </div>
                        <div className="mt-3 text-[10px] font-mono text-foreground/35 leading-relaxed">
                          Capture a clear, front-facing image.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* User table */}
              <div className="glass-panel overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono text-xs">Username</TableHead>
                      <TableHead className="font-mono text-xs">Role</TableHead>
                      <TableHead className="font-mono text-xs">Created</TableHead>
                      <TableHead className="font-mono text-xs w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.username}</TableCell>
                        <TableCell>
                          <span className={`font-mono text-xs px-2 py-0.5 rounded ${user.role === "admin" ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user.username !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user.username)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-6 flex flex-col gap-2">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Total Desk Time
                </span>
                <span className="text-3xl font-mono text-foreground">{formatDuration(totalMs)}</span>
              </div>
              <div className="glass-panel p-6 flex flex-col gap-2">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Session Count
                </span>
                <span className="text-3xl font-mono text-foreground">{analytics.sessionCount}</span>
              </div>
              <div className="glass-panel p-6 flex flex-col gap-2">
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Last Seen
                </span>
                <span className="text-xl font-mono text-foreground">
                  {analytics.lastSeenTime
                    ? analytics.lastSeenTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "—"}
                </span>
              </div>

              <div className="glass-panel p-6 col-span-3 flex flex-col gap-3">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Session History</span>
                <div className="flex flex-col gap-2">
                  {analytics.sessionCount === 0 ? (
                    <span className="text-sm font-mono text-muted-foreground">No sessions recorded yet.</span>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 text-xs font-mono text-muted-foreground">
                      <span>Current session active</span>
                      <span>Duration: {formatDuration(currentSessionMs)}</span>
                      <span>Total sessions: {analytics.sessionCount}</span>
                      <span>Avg: {analytics.sessionCount > 0 ? formatDuration(totalMs / analytics.sessionCount) : "—"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
