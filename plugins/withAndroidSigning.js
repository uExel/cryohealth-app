/** Signs Android release builds with the upload keystore named in
 *  ~/.gradle/gradle.properties (CRYO_UPLOAD_STORE_FILE, CRYO_UPLOAD_STORE_PASSWORD,
 *  CRYO_UPLOAD_KEY_ALIAS, CRYO_UPLOAD_KEY_PASSWORD). The generated build.gradle signs
 *  release with the public debug keystore; this replaces that on every prebuild so no
 *  secret ever lands in the repo and `android/` stays disposable. */
const { withAppBuildGradle } = require("expo/config-plugins");

const RELEASE_SIGNING = `
        release {
            // Properties live in ~/.gradle/gradle.properties, never in the repo. A missing
            // property fails the release build instead of falling back to the debug key.
            storeFile file(findProperty('CRYO_UPLOAD_STORE_FILE') ?: 'missing-upload-keystore')
            storePassword findProperty('CRYO_UPLOAD_STORE_PASSWORD')
            keyAlias findProperty('CRYO_UPLOAD_KEY_ALIAS')
            keyPassword findProperty('CRYO_UPLOAD_KEY_PASSWORD')
        }`;

const DEBUG_BLOCK = /(signingConfigs\s*\{\s*debug\s*\{[^}]*\})/;
const RELEASE_BUILD_TYPE = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/;

function applySigning(contents) {
  if (contents.includes("CRYO_UPLOAD_STORE_FILE")) return contents;
  if (!DEBUG_BLOCK.test(contents) || !RELEASE_BUILD_TYPE.test(contents)) {
    throw new Error(
      "withAndroidSigning: could not find the debug signingConfig / release buildType in app/build.gradle. " +
        "The Expo template changed; update plugins/withAndroidSigning.js.",
    );
  }
  return contents
    .replace(DEBUG_BLOCK, `$1${RELEASE_SIGNING}`)
    .replace(RELEASE_BUILD_TYPE, "$1signingConfig signingConfigs.release");
}

module.exports = (config) =>
  withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== "groovy") {
      throw new Error("withAndroidSigning: only a Groovy app/build.gradle is supported.");
    }
    cfg.modResults.contents = applySigning(cfg.modResults.contents);
    return cfg;
  });

module.exports.applySigning = applySigning;
