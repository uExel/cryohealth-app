import { Linking, Platform } from "react-native";
import * as Device from "expo-device";
import * as SecureStore from "expo-secure-store";

const BATTERY_PROMPT_KEY = "cryohealth_battery_prompted";

/** True once per install, on Android, before the first screen after the splash. */
export async function shouldShowBatteryPrompt(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  return (await SecureStore.getItemAsync(BATTERY_PROMPT_KEY)) !== "true";
}

export async function markBatteryPromptSeen(): Promise<void> {
  await SecureStore.setItemAsync(BATTERY_PROMPT_KEY, "true");
}

/** Opens Android's list of apps excluded from battery optimisation. This needs no special
 *  permission, so it is the route Google Play accepts without a declaration. Falls back to
 *  the app's info page when the device does not resolve the intent. */
export async function openBatteryOptimizationSettings(): Promise<void> {
  try {
    await Linking.sendIntent("android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS");
  } catch {
    await Linking.openSettings();
  }
}

/** Battery exemption alone does not stop some vendors' own killers, so add their extra step. */
export function oemBatteryHint(): string | undefined {
  const maker = (Device.manufacturer ?? "").toLowerCase();
  if (/oneplus|oppo|realme/.test(maker))
    return "On OnePlus and OPPO phones, also turn off Intelligent Control for CryoHealth.";
  if (/vivo|iqoo/.test(maker))
    return "On Vivo phones, also turn on Auto-start for CryoHealth.";
  if (/xiaomi|redmi|poco/.test(maker))
    return "On Xiaomi phones, also turn on Autostart for CryoHealth.";
  if (/huawei|honor/.test(maker))
    return "On Huawei phones, also turn on Launch and Run in background for CryoHealth.";
  if (/samsung/.test(maker))
    return "On Samsung phones, also set CryoHealth battery usage to Unrestricted.";
  return undefined;
}

/** Opens CryoHealth's system "App info" page (used from Settings). */
export function openAppSettings(): Promise<void> {
  return Linking.openSettings();
}
