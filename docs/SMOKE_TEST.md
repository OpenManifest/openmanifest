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
- [ ] Install the previous build, log in, then install this build over it: you are still logged in on the same dropzone.
- [ ] Log out, then log in as a different user without restarting the app: data loads, the drawer shows the second user
      and their role, nothing of the first user is left on screen. (The first user's push notifications stop arriving
      on this device once the server clears the token, P6.18.)
- [ ] Settings → Appearance: System / Light / Dark switch the theme; System follows the phone's dark mode.
## Manifest
- [ ] Select a dropzone; manifest board shows today's loads; pull to refresh updates the list.
- [ ] Create a load (staff); it appears on another device without refreshing (also on a phone logged in with Apple: P6.9).
- [ ] Manifest yourself; manifest a group (speed dial on the load screen, and an "Available" row); tap a slot to edit it;
      take someone off; slot counts are correct ("2/14" for two jumpers).
- [ ] Give a 10-minute call: push notification arrives on the jumper's device; countdown shows the right time.
- [ ] Mark as landed; cancel a load; credits are charged/refunded correctly.
## Setup and profile forms
- [ ] Edit dropzone settings, the weather board (winds, temperature, jump run) and your own profile: values are shown, saved, and shown again after reopening.
- [ ] Add a rig, inspect a rig (a required template field blocks "OK to jump" until it is filled), edit a member's access level and membership expiry.
## Layout
Run on a small Android phone (360 dp wide), a large Android phone, an iPhone and an iPad, each at the default and the maximum font size, and in dark mode on one of them.
- [ ] Login: with the keyboard open the form scrolls; "Log in", the Apple button and "Sign up" are reachable; nothing sits under the status bar or notch.
- [ ] Sign-up, user setup, dropzone setup and password wizards: focus each field with the keyboard open; the field, the title and the Next / Back buttons stay visible; no text, button or input is cut off horizontally.
- [ ] Bottom sheets (manifest user, group, credits, aircraft, ticket type, rig): focus the last input; the input and the save button stay visible above the keyboard; the sheet content clears the gesture bar.
- [ ] Manifest board and load screen: scroll to the last load / the last jumper; floating buttons sit above the tab bar and gesture bar and do not cover the last item; the load screen scrolls as one list (no scrolling inside scrolling).
- [ ] Configuration screens (aircraft, ticket types, ticket addons, rigs, dropzone settings, permissions, rig inspection template): the floating button floats, the last row is reachable, and the background follows dark mode.
- [ ] Weather (the wizard, winds, jump run): edit temperature, winds and jump run with the keyboard open; the inputs are wide enough to type in.
- [ ] At maximum font size, slot rows, tables, profile, login and dialogs remain readable (no clipped text); tab bar and floating button labels stop growing at 1.6x.
