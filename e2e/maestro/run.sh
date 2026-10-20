#!/usr/bin/env bash
# Runs the Maestro flows on the booted emulator: the pixel_7 screen at font scale 1.0 and 2.0, then the screen of a
# 360×640 dp phone (1080×1920 at 480 dpi) at 2.0. Called by .github/workflows/android-ui.yml; the APK is the argument.
set -euo pipefail

apk="$1"
out="e2e/maestro-report"
mkdir -p "$out"

# What the app logged when a flow failed: kept as an artifact, and the crash printed here
report() {
  adb logcat -d > "$out/logcat.txt" || true
  # What was on the screen when the flow gave up
  maestro hierarchy > "$out/hierarchy.json" 2>/dev/null || true
  echo "--- texts and ids on the screen ---"
  grep -oE '"(text|resource-id|accessibilityText)" ?: ?"[^"]+"' "$out/hierarchy.json" | sort -u | head -60 || true
  echo "--- app crash (logcat) ---"
  grep -n -A 25 "FATAL EXCEPTION" "$out/logcat.txt" | head -60 || true
  echo "--- app log (ReactNativeJS, last 40) ---"
  grep "ReactNativeJS" "$out/logcat.txt" | tail -40 || true
  echo "--- errors and warnings of the app and its runtime (last 60) ---"
  grep -E "^[0-9-]+ [0-9:.]+ +[0-9]+ +[0-9]+ [EW] " "$out/logcat.txt" | grep -Ei "openmanifest|expo|ReactNative|hermes|okhttp|chromium|AndroidRuntime|System.err" | tail -60 || true
  echo "--- views (dumpsys activity top) ---"
  adb shell dumpsys activity top | sed -n '/View Hierarchy/,$p' | head -120 || true
  echo "--- focused window ---"
  adb shell dumpsys window | grep -E "mCurrentFocus|mFocusedApp" | head -3 || true
  echo "--- the API as the emulator reaches it ---"
  curl -si -m 10 -H "Host: 10.0.2.2:5000" -H "content-type: application/json" -d '{"query":"{ __typename }"}' http://localhost:5000/graphql | head -8 || true
  adb exec-out screencap -p > "$out/screen.png" || true
}

adb install -r "$apk"
adb shell pm list packages | grep -q com.dangertechnologies.openmanifest || { echo "the app is not installed"; exit 1; }
adb logcat -c

run() {
  local name="$1" scale="$2"
  adb shell settings put system font_scale "$scale"
  mkdir -p "$out/$name"
  maestro test --format junit --output "$out/$name.xml" --test-output-dir "$out/$name" e2e/maestro || { report; exit 1; }
}

run pixel7-font1 1.0
run pixel7-font2 2.0

adb shell wm size 1080x1920
adb shell wm density 480
run small-font2 2.0
adb shell wm size reset
adb shell wm density reset
