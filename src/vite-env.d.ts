/// <reference types="vite/client" />

interface ConfigType {
  LAPTOP_IP: string;
  LAPTOP_PORT: number;
  MOTION_SENSITIVITY: number;
  SESSION_TIMEOUT_SECONDS: number;
}

declare const CONFIG: ConfigType;
