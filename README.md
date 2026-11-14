# CardScan

Scan a trading card with your phone camera, see what it is and what it's worth.
Built with Expo (React Native) + TypeScript.

See `docs/PLAN.md` for the full plan, costs and risks.

## Run it on your phone (Phase 1)

1. Install **Expo Go** on your phone (App Store / Google Play). If the store version
   says it needs a different SDK, see https://expo.dev/go.
2. On your computer, with Node.js 20+ installed:

   ```bash
   npm install
   npx expo start
   ```

3. Scan the QR code in the terminal with your phone's camera (iPhone) or with
   Expo Go (Android). Phone and computer must be on the same Wi-Fi.
   If it won't connect, run `npx expo start --tunnel`.
4. Allow camera access when asked. Line a card up inside the frame and tap the
   yellow shutter.

## Project layout

```
App.tsx                 root: switches between camera and preview
src/theme.ts            colours, spacing, card aspect ratio
src/screens/            CameraScreen, PreviewScreen
src/components/         CardGuide (overlay), PrimaryButton
docs/PLAN.md            plan, costs, risks
```

## Checks before committing

```bash
npx tsc --noEmit
```
