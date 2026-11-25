# Android release (local, no EAS)

`android/` is generated and gitignored. Everything native comes from `app.json` and `plugins/`.

1. Bump `android.versionCode` in `app.json` above the live Play release (check Play Console).
2. Point the build at production, then check it. Expo inlines `EXPO_PUBLIC_API_URL` at bundle
   time and falls back to `.env.local` (a LAN dev server over http, which release builds block):

       export EXPO_PUBLIC_API_URL=https://api.cryohealth.io
       npm run release:check

3. `npx expo prebuild --platform android --clean`
4. `cd android && ./gradlew bundleRelease`
5. Output: `android/app/build/outputs/bundle/release/app-release.aab`
6. Verify the signer: `keytool -printcert -jarfile app-release.aab` (must NOT be the Android Debug key).

## One-time signing setup
Create the upload keystore outside the repo and back it up in a password manager:

    keytool -genkeypair -v -storetype PKCS12 -keystore ~/.keys/cryohealth-upload.jks \
      -alias cryohealth-upload -keyalg RSA -keysize 2048 -validity 10000

Add to `~/.gradle/gradle.properties` (never the repo):

    CRYO_UPLOAD_STORE_FILE=/home/<you>/.keys/cryohealth-upload.jks
    CRYO_UPLOAD_STORE_PASSWORD=...
    CRYO_UPLOAD_KEY_ALIAS=cryohealth-upload
    CRYO_UPLOAD_KEY_PASSWORD=...

`plugins/withAndroidSigning.js` wires these into the release build; a missing property fails
the build rather than falling back to the debug key.

Earlier releases were signed with the debug keystore, so Play currently trusts that as the
upload key. Before uploading an AAB signed with the new key: Play Console > App integrity >
App signing > Request upload key reset, then register the new certificate.

`google-services.json` is committed (client config, not a secret). Restrict its API key to
`com.uexel.cryohealth` + the release SHA-1 in Google Cloud. Never commit the Firebase
service-account JSON (API server only).

## Known limit: push when the app is swiped away (OnePlus and similar)
Android never delivers FCM to a *force-stopped* app. On OnePlus (OxygenOS, default "Intelligent
Control") swiping CryoHealth out of recents force-stops it, so pushes stop until the app is opened
again. Verified on a OnePlus 6T (Android 11): after App info > Advanced > Battery > Battery
optimization > "Don't optimize", a swipe leaves the app running (`stopped=false`) and pushes arrive.
Only AOSP's `deviceidle whitelist` did not help. The app cannot change this for the user; Settings >
Hazard notifications > "Open app settings" and the permission screen explain it. Mention it in the
release notes. Android 13+ shows a runtime notification prompt that Android 11 test phones skip.
