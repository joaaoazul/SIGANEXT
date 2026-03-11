/**
 * Capacitor bridge utilities
 * Detects if running inside a native app and provides native feature access.
 * Safe to import in any component — returns graceful fallbacks on web.
 */

import { Capacitor } from "@capacitor/core";

/** True if running inside a native iOS/Android shell */
export const isNative = Capacitor.isNativePlatform();

/** "ios" | "android" | "web" */
export const platform = Capacitor.getPlatform() as "ios" | "android" | "web";

/** Configure status bar for native apps */
export async function configureStatusBar() {
  if (!isNative) return;
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  await StatusBar.setStyle({ style: Style.Dark });
  if (platform === "android") {
    await StatusBar.setBackgroundColor({ color: "#030712" });
  }
}

/** Configure keyboard behavior for native apps */
export async function configureKeyboard() {
  if (!isNative) return;
  const { Keyboard } = await import("@capacitor/keyboard");
  // Scroll input into view when keyboard opens
  Keyboard.addListener("keyboardWillShow", () => {
    document.body.classList.add("keyboard-open");
  });
  Keyboard.addListener("keyboardWillHide", () => {
    document.body.classList.remove("keyboard-open");
  });
}

/** Hide splash screen */
export async function hideSplashScreen() {
  if (!isNative) return;
  const { SplashScreen } = await import("@capacitor/splash-screen");
  await SplashScreen.hide();
}

/** Trigger haptic feedback */
export async function hapticFeedback(type: "light" | "medium" | "heavy" = "light") {
  if (!isNative) return;
  const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
  const styleMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };
  await Haptics.impact({ style: styleMap[type] });
}

/** Open URL in native in-app browser */
export async function openInBrowser(url: string) {
  if (!isNative) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
}

/** Register for push notifications (native only) */
export async function registerPushNotifications() {
  if (!isNative) return null;
  const { PushNotifications } = await import("@capacitor/push-notifications");

  const permResult = await PushNotifications.requestPermissions();
  if (permResult.receive !== "granted") return null;

  await PushNotifications.register();

  return new Promise<string>((resolve) => {
    PushNotifications.addListener("registration", (token) => {
      resolve(token.value);
    });
  });
}

/** Initialize all native features — call once in root layout */
export async function initCapacitor() {
  if (!isNative) return;
  await configureStatusBar();
  await configureKeyboard();
  // Splash screen auto-hides via config, but ensure it's hidden after 3s
  setTimeout(() => hideSplashScreen(), 3000);
}
