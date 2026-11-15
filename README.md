# CardScan

Scan a trading card with your phone camera, see what it is and what it's worth.
Built with Expo (React Native) + TypeScript. Sports cards first; Pokémon, Magic, One Piece, Marvel and Disney also supported by the identifier.

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
src/app/                screens as routes (Expo Router): index = camera, preview, result
src/screens/            the screen components themselves
src/components/         CardGuide, CategoryPicker, PrimaryButton
src/services/identify.ts  shrinks the photo and calls the backend
src/categories.ts       the card categories (sports + TCGs)
src/config.ts           backend URL + public key
supabase/functions/identify-card/   the server function that calls CardSight AI
docs/PLAN.md            plan, costs, risks
docs/PHASE2-SETUP.md    one-time setup for identification
```

## Checks before committing

```bash
npx tsc --noEmit
```
