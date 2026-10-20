# Android release (local, no EAS)

`android/` is generated and gitignored. Everything native comes from `app.json` and `plugins/`.

1. Bump `android.versionCode` in `app.json` above the live Play release (check Play Console).
2. `npx expo prebuild --platform android --clean`
3. `cd android && ./gradlew bundleRelease`
4. Output: `android/app/build/outputs/bundle/release/app-release.aab`
5. Verify the signer: `keytool -printcert -jarfile app-release.aab` (must NOT be the Android Debug key).

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
