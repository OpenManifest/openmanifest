# Owner smoke test checklist

Run on: (1) an iPhone, (2) a typical Android phone, (3) a small Android phone or emulator profile at 360×640 dp,
(4) any of them with system font size at maximum (Android: Settings → Display → Font size largest + Display size largest;
iOS: Larger Accessibility Sizes). Until EAS builds exist (Phase 3, decision D2), run the web build in the phone's browser
(`EXPO_ENV=local npx expo start --web` on your machine; open http://<your-ip>:19006 on the phone).

## Devices
- [ ] Record device model, OS version, screen size, font scale.
## Web
- [ ] Desktop browser at 1280×800: login, dropzone, manifest, load all render.
## Login
- [ ] Email login works; wrong password shows an error.
- [ ] "Sign up" and "Forgot your password?" are reachable without zooming; with the keyboard open the focused field stays visible.
- [ ] Log out, log in again without restarting the app: data loads.
## Manifest
- [ ] Select a dropzone; manifest board shows today's loads; pull to refresh updates the list.
- [ ] Create a load (staff); it appears on another device without refreshing.
- [ ] Manifest yourself; manifest a group; take someone off; slot counts are correct ("2/14" for two jumpers).
- [ ] Give a 10-minute call: push notification arrives on the jumper's device; countdown shows the right time.
- [ ] Mark as landed; cancel a load; credits are charged/refunded correctly.
## Layout
- [ ] No text, button or input is cut off horizontally on the 360 dp device in: sign-up, user setup wizard, dropzone setup wizard, weather screens.
- [ ] Floating buttons do not cover the tab bar, gesture bar or the last list item.
- [ ] Bottom sheets: every field stays visible above the keyboard; the submit button is reachable.
- [ ] At maximum font size, slot rows, tables and dialogs remain readable (no clipped text).
