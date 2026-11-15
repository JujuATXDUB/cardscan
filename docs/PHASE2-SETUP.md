# Phase 2 setup — connecting the card identifier

Phase 2 adds a small server piece. The app sends the photo to a function running
on Supabase; that function asks CardSight AI what the card is, using your
CardSight key; the answer comes back to the phone. The key never leaves the server.

You do this once. About 15 minutes. Nothing here costs money.

## A. Get your CardSight API key

1. Sign in at https://cardsight.ai.
2. Find **API Keys** (in the dashboard or account menu) and copy your key.
   Keep it somewhere safe for step C. Do not paste it into chat.

## B. Create the Supabase project

1. Sign in at https://supabase.com and click **New project**.
2. Name: `cardscan`. Database password: click **Generate** and save it in your
   password manager (we do not need it today). Region: the one closest to you.
3. Click **Create new project** and wait a minute or two while it sets up.

## C. Store the CardSight key as a secret

1. In the left sidebar click **Edge Functions**.
2. Open the **Secrets** tab (or Manage secrets).
3. Add a secret. Name exactly: `CARDSIGHT_API_KEY`. Value: your CardSight key.
4. Save.

## D. Deploy the function

1. Still in **Edge Functions**, click **Deploy a new function** and choose
   **Via Editor** (the in-browser editor).
2. Function name exactly: `identify-card`.
3. Delete the example code in the editor. Open this file on GitHub:
   `supabase/functions/identify-card/index.ts` in your `cardscan` repository,
   click the copy icon, and paste the whole thing into the Supabase editor.
4. If there is a setting called **Verify JWT** (or "Enforce JWT verification"),
   turn it **off** for now. The app does not have user accounts yet; we lock this
   down in Phase 5.
5. Click **Deploy**.

## E. Tell the app where the server is

1. In Supabase go to **Project Settings** (gear icon) → **API** (or **API Keys**).
2. Copy two things:
   - **Project URL**, which looks like `https://abcdefghijkl.supabase.co`
   - the **anon / public** key (on some dashboards called the **publishable** key,
     starting `sb_publishable_`). This key is designed to be public.
3. Send both to Claude in chat. They go into `src/config.ts`.

## F. Get the new code onto your laptop

The project now lives on GitHub, so updates arrive through GitHub instead of zips.

1. Install **GitHub Desktop** from https://desktop.github.com and sign in with
   your GitHub account.
2. **File → Clone repository**, pick `JujuATXDUB/cardscan`, keep the suggested
   location (Documents\GitHub\cardscan), click **Clone**.
3. Open PowerShell in that folder (click the address bar in File Explorer, type
   `powershell`, Enter) and run:

   ```
   npm install
   npx expo start
   ```

4. Scan the QR code with your iPhone as before.

From now on, when Claude says "pushed", open GitHub Desktop, click
**Fetch origin** then **Pull origin**, and restart `npx expo start`.
If Claude says new packages were added, run `npm install` first.

The old copy in Downloads\cardscan-phase1 can be deleted once this works.

## What you should see

- Camera screen now has a row of category chips (Baseball, Football, … Pokémon).
  Pick the one that matches your card. It remembers your last choice.
- Take a photo → Use photo → "Identifying…" for a few seconds → the card's
  name, year, brand, set and number, with a confidence badge. If CardSight is
  unsure it lists alternatives you can tap.
- Until step E is done, the result screen shows a friendly "backend not set up
  yet" message instead. That is expected.
