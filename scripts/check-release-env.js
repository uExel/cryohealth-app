#!/usr/bin/env node
/** Run before a local Android release build (docs/ai/RELEASE-ANDROID.md).
 *
 *  Expo inlines EXPO_PUBLIC_* at bundle time and reads .env.local when the shell has no
 *  value, so a release built on a dev machine silently talks to the developer's LAN server
 *  over plain HTTP, which release builds block. Require an explicit public https URL. */
const url = process.env.EXPO_PUBLIC_API_URL;

function fail(msg) {
  console.error(`release:check failed: ${msg}`);
  console.error("Set it for this shell, e.g.  export EXPO_PUBLIC_API_URL=https://api.cryohealth.io");
  process.exit(1);
}

if (!url) fail("EXPO_PUBLIC_API_URL is not set in the shell (the build would fall back to .env.local).");

let parsed;
try {
  parsed = new URL(url);
} catch {
  fail(`EXPO_PUBLIC_API_URL is not a valid URL: ${url}`);
}

if (parsed.protocol !== "https:") fail(`EXPO_PUBLIC_API_URL must be https, got ${parsed.protocol}//`);

const host = parsed.hostname;
const privateHost =
  host === "localhost" ||
  /^\d{1,3}(\.\d{1,3}){3}$/.test(host) ||
  host.endsWith(".local") ||
  host === "10.0.2.2";
if (privateHost) fail(`EXPO_PUBLIC_API_URL points at a local/private address (${host}).`);

console.log(`release:check ok: API URL is ${parsed.origin}`);
