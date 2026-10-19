#!/usr/bin/env bash
# Runs the Maestro flows on the booted emulator: the pixel_7 screen at font scale 1.0 and 2.0, then the screen of a
# 360×640 dp phone (1080×1920 at 480 dpi) at 2.0. Called by .github/workflows/android-ui.yml; the APK is the argument.
set -euo pipefail

apk="$1"
out="e2e/.maestro"
mkdir -p "$out"
adb install -r "$apk"

run() {
  local name="$1" scale="$2"
  adb shell settings put system font_scale "$scale"
  mkdir -p "$out/$name"
  maestro test --format junit --output "$out/$name.xml" --test-output-dir "$out/$name" e2e/maestro
}

run pixel7-font1 1.0
run pixel7-font2 2.0

adb shell wm size 1080x1920
adb shell wm density 480
run small-font2 2.0
adb shell wm size reset
adb shell wm density reset
