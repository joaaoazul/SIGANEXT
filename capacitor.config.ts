import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "pt.siga180.app",
  appName: "SIGA180",
  // Server-rendered Next.js — load the live URL
  server: {
    url: "https://siga180.pt",
    cleartext: false, // HTTPS only
  },
  // Fallback webDir (required by Capacitor CLI, but not used in live mode)
  webDir: "public",

  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: "#030712", // dark bg matching app
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#10b981", // emerald-500
    },
    StatusBar: {
      style: "DARK", // light text for dark status bar
      backgroundColor: "#030712",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },

  // iOS-specific config
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "SIGA180",
    backgroundColor: "#030712",
  },

  // Android-specific config
  android: {
    backgroundColor: "#030712",
    allowMixedContent: false, // security: no HTTP on HTTPS pages
    captureInput: true,
    webContentsDebuggingEnabled: false, // disable in production
  },
};

export default config;
