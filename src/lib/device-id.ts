import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'cryohealth_device_id';

/** Stable per-install id used as ChwCase.deviceId \u2014 generated once, kept in SecureStore
 *  (survives app restarts, not backups/reinstalls, which is fine: a reinstall is a new device). */
export async function getDeviceId(): Promise<string> {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = Crypto.randomUUID();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}
