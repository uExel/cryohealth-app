import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { NotificationResponse } from "expo-notifications";
import { Q } from "@nozbe/watermelondb";
import { database } from "./db";
import { AlertModel } from "./db/models/AlertModel";
import {
  fetchAlert,
  registerPushDevice,
  unregisterPushDevice,
} from "./cryohealth-api";

const PUSH_ENABLED_KEY = "cryohealth_push_enabled";
const PUSH_TOKEN_KEY = "cryohealth_push_token";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = "hazard-alerts";
const CHANNEL_VERSION_KEY = "cryohealth_channel_v2";

async function setAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  // Android freezes a channel's sound once created. Earlier builds created it with
  // sound: "default" (treated as a missing custom file), so recreate it once.
  if ((await SecureStore.getItemAsync(CHANNEL_VERSION_KEY)) !== "true") {
    await Notifications.deleteNotificationChannelAsync(CHANNEL_ID);
    await SecureStore.setItemAsync(CHANNEL_VERSION_KEY, "true");
  }
  // `sound` is omitted on purpose: expo-notifications treats a string as a custom
  // sound filename, and omitting it uses the system default notification sound.
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Hazard alerts",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#0a4d76",
  });
}

async function permissionIsGranted(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

async function getNativeToken(): Promise<string> {
  if (!Device.isDevice) {
    throw new Error("Push notifications require a physical device.");
  }
  const token = await Notifications.getDevicePushTokenAsync();
  if (typeof token.data !== "string" || token.data.length === 0) {
    throw new Error("The device did not return an FCM token.");
  }
  return token.data;
}

async function registerCurrentToken(): Promise<void> {
  if (Platform.OS !== "android") return;
  await setAndroidChannel();
  if (!(await permissionIsGranted())) return;
  const token = await getNativeToken();
  await registerPushDevice(token, "android");
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function refreshPushToken(token: string): Promise<void> {
  if ((await SecureStore.getItemAsync(PUSH_ENABLED_KEY)) === "false") return;
  if (Platform.OS !== "android") return;
  await registerPushDevice(token, "android");
  await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
}

export async function enablePushNotifications(): Promise<boolean> {
  if (Platform.OS !== "android") {
    throw new Error(
      "Push notifications are currently configured for Android only.",
    );
  }
  await setAndroidChannel();
  let { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== "granted") return false;

  // Opt in before registering: registration needs the network, and an offline first launch
  // must not trap the user on the permission screen. `syncPushRegistration` retries the
  // registration on every sync until it succeeds.
  await SecureStore.setItemAsync(PUSH_ENABLED_KEY, "true");
  try {
    await registerCurrentToken();
  } catch (err) {
    console.warn("Push registration failed, will retry on next sync", err);
  }
  return true;
}

/** Unregisters the stored token with the server. A failure (offline) leaves the token in
 *  SecureStore as "pending" so `syncPushRegistration` retries it, and never blocks the
 *  user's choice -- the opt-out flag is already saved by then. */
async function flushPendingUnregister(): Promise<void> {
  const token = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
  if (!token) return;
  await unregisterPushDevice(token);
  await SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
}

export async function disablePushNotifications(): Promise<void> {
  // Flag first: turning alerts off must work offline.
  await SecureStore.setItemAsync(PUSH_ENABLED_KEY, "false");
  try {
    await flushPendingUnregister();
  } catch (err) {
    console.warn("Push unregister failed, will retry on next sync", err);
  }
}

export async function getPushNotificationsEnabled(): Promise<boolean> {
  if (Platform.OS !== "android") return false;
  if ((await SecureStore.getItemAsync(PUSH_ENABLED_KEY)) === "false")
    return false;
  return permissionIsGranted();
}

export async function syncPushRegistration(): Promise<void> {
  if (Platform.OS !== "android") return;
  if ((await SecureStore.getItemAsync(PUSH_ENABLED_KEY)) === "false") {
    await flushPendingUnregister();
    return;
  }
  await registerCurrentToken();
}

export function alertIdFromResponse(
  response: NotificationResponse,
): string | undefined {
  const value = response.notification.request.content.data?.alertId;
  return typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
    ? value
    : undefined;
}

export function alertTierFromResponse(
  response: NotificationResponse,
): string | undefined {
  const value = response.notification.request.content.data?.tier;
  return typeof value === "string" ? value : undefined;
}

export async function cacheAlertFromPush(alertId: string): Promise<void> {
  const alert = await fetchAlert(alertId);
  await database.write(async () => {
    const collection = database.get<AlertModel>("alerts");
    const existing = await collection
      .query(Q.where("remote_id", alert.id))
      .fetch()
      .then((rows) => rows[0]);

    const writeAlert = (record: AlertModel) => {
      record.remoteId = alert.id;
      record.lakeId = alert.lakeId;
      record.tier = alert.tier;
      record.title = alert.title;
      record.body = alert.body;
      record.bodyUr = alert.bodyUr;
      record.downstreamSummary = alert.downstreamSummary;
      record.windowStart = alert.windowStart;
      record.windowEnd = alert.windowEnd;
      record.chips = alert.chips;
      record.checklist = alert.checklist;
      record.status = alert.status;
      record.issuedAt = alert.createdAt;
      record.syncedAt = Date.now();
    };

    if (existing) {
      await existing.update(writeAlert);
    } else {
      await collection.create(writeAlert);
    }
  });
}
