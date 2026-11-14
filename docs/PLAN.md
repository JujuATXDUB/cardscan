# CardScan — plan, costs and risks

_Written 14 Nov 2026. Anything marked **verify** came from web search summaries, not the source's own page (this build sandbox could not open those sites), so re-check it before relying on it._

## Assumptions I made

Your brief left three blanks. I filled them like this; tell me if any is wrong.

| Blank | Assumed |
|---|---|
| Card game | Pokémon TCG |
| Your one difference | Accurate European prices in EUR/GBP (Cardmarket-style data) |
| Extra Pro feature | Cloud backup and sync of the collection, plus price-drop alerts |

## 1. Tech stack

**React Native + Expo (SDK 58) in TypeScript.** Your instinct is right. Reasons:

- One codebase for iPhone and Android.
- You can test on your real phone without a Mac or Android Studio.
- The libraries we need all exist with Expo support: camera (`expo-camera`), on-device text recognition (Google ML Kit), AdMob ads, RevenueCat for subscriptions, SQLite for the collection.
- Flutter would also work, but its ecosystem for ads/subscriptions/scanning is no better and the JavaScript ecosystem is easier to learn from.

**Other pieces, phase by phase:**

| Phase | Tool | Why |
|---|---|---|
| 1 Camera | `expo-camera`, `expo-image` | Built in, works in Expo Go |
| 2 Identify | Card database (pokemontcg.io or a copy of it) + on-device OCR of the card number + optional AI vision fallback | Decided properly in Phase 2, see below |
| 3 Price | Whichever source we're allowed to use (see Phase 3 section) | |
| 4 Collection | `expo-sqlite` on the phone first; Supabase later for accounts/sync | Local-first is simpler, free, and works offline |
| 5 Money | AdMob (`react-native-google-mobile-ads`) + RevenueCat | Industry standard; RevenueCat is free until you earn real money |

**How you test on your phone**

- Phases 1–4 run in **Expo Go**, Expo's free preview app. You scan a QR code from your laptop and the app appears on your phone.
- Phase 5 (ads) adds native code that Expo Go does not contain, so from then on we make a **development build** with EAS Build (Expo's cloud build service). On Android that is a free APK you install directly. On iPhone it requires the Apple Developer account.
- **verify:** During 2026 Expo Go for new SDKs has sometimes been stuck in Apple's review for months. If Expo Go for SDK 58 is not in the App Store when you try, the fallbacks are: use an Android phone, or run `npx eas-cli@latest go` (needs the Apple account), or we build a development build early. Check https://expo.dev/go.

## 2. Costs

| Item | Cost | When you need it |
|---|---|---|
| Apple Developer Program | US$99 / year | To put the app on any iPhone other than via Expo Go, and to publish |
| Google Play Console | US$25 once | To publish on Android. New personal accounts must also run a closed test with 12 testers for 14 days before going public |
| Expo EAS Build | Free tier (small monthly build quota), then from ~US$19/month **verify** | Phase 5, or earlier if Expo Go is unavailable |
| Supabase (accounts + sync) | Free tier is plenty for launch | Phase 4b / Pro feature |
| Card database (pokemontcg.io) | Free with an API key **verify**: ~20k requests/day | Phase 2 |
| AI vision fallback (Claude/Gemini) | Pay per scan, roughly a fraction of a cent to ~1 cent per image | Phase 2, only if we use it |
| Price data | See Phase 3 table; ranges from free to a paid monthly subscription | Phase 3 |
| AdMob, RevenueCat | Free (RevenueCat takes a cut only above ~US$2.5k/month revenue **verify**) | Phase 5 |
| Domain + privacy-policy page | ~US$10–15 / year | Both stores require a privacy policy URL |

Realistic total to launch: about **US$125 in store fees**, plus whatever price-data source we pick.

## 3. Phase 2 — how to identify a card (preview)

No single method is reliable alone. The plan I'll propose when we get there:

1. **OCR the card number** (e.g. "025/198") and the set symbol area using on-device text recognition. The number plus the set narrows it to one card in the database. Free, fast, works offline.
2. **Image matching** against the card's official artwork as a check, or as the primary method when the number is unreadable.
3. **AI vision model fallback** (send the photo to a model like Claude) for damaged, foreign-language or oddly lit cards. Costs money per scan, so used sparingly and capped for free users.
4. **Variant (holo / reverse holo / etc.)**: this is genuinely hard from a photo and the big apps get it wrong too. The honest approach is to detect what we can and let the user confirm the variant with one tap.

## 4. Phase 3 — price data sources (preview)

This is where the idea is most at risk. Summary from what I could find today (all **verify** before we commit):

| Source | What it gives | Cost | Allowed in a commercial app? |
|---|---|---|---|
| **TCGplayer API** | US market prices | n/a | **Closed to new developers** ("no longer granting new API access") |
| **Cardmarket API** | European prices in EUR | n/a | Help page says they are **not accepting new API applications**; third-party apps need Cardmarket verification |
| **pokemontcg.io** | Card database + TCGplayer and Cardmarket price snapshots | Free | Community project; terms and long-term reliability unclear, price data can lag |
| **PriceCharting** | Prices incl. Pokémon cards and graded cards | Paid subscription | Yes, with a paid plan (confirm the exact tier) |
| **eBay Marketplace Insights** (sold listings) | Real recent sales | Free | Limited release, needs eBay approval; usually not granted to small apps |
| **Third-party price APIs** (e.g. PokemonPriceTracker, TCG API) | Aggregated prices, often resold TCGplayer data | Free tier + paid plans | Depends on their terms and on where they get the data |
| Scraping Cardmarket/TCGplayer | Anything | "Free" | **No.** Breaks terms of service, fragile, and a store takedown risk |

Implication: "Cardmarket prices in euros" is the differentiator, but the official door to Cardmarket data is currently shut. Options are to use pokemontcg.io's Cardmarket snapshot (fast to start, uncertain long-term), apply to Cardmarket anyway and build on the snapshot meanwhile, or pivot the differentiator. **This is a decision for you before Phase 3.**

## 5. Risks and problems with the idea

1. **Price data access** (above). Biggest risk to the business model, not to the code.
2. **Identifying variants** from a photo. Expect to ask the user to confirm.
3. **Pokémon trademarks.** Don't use "Pokémon", Pikachu, or the logo in the app name, icon or store listing. Showing card images inside the app is common practice but is at the rights holder's tolerance; keep a plan to swap to text-only if asked.
4. **Competition.** Ludex, CollX and Collectr have teams and funding. A narrow niche (Europe, EUR/GBP, one game) is the right way in; don't try to match their feature list.
5. **Expo Go availability** in 2026 has been patchy on iOS. Might force the Apple $99 earlier than Phase 5.
6. **Google Play's 14-day closed test** rule adds two weeks before you can go public.
7. **Per-scan costs.** If Phase 2 uses an AI vision API, free users can cost you money. Cap free scans per day.
8. **Scope for a beginner.** Phases 1 and 4 are easy. Phase 2 is the hard one and may take several iterations. Budget evenings over 2–3 months.

## 6. Phase plan

| Phase | Goal | Testable on phone? |
|---|---|---|
| 1 ✅ | Camera screen, card guide frame, take and review a photo | Yes, Expo Go |
| 2 | Identify the card: set, number, name, likely variant, with manual confirm | Yes, Expo Go (OCR may need a dev build on iOS) |
| 3 | Show current price in EUR/GBP/USD, with the source and date | Yes |
| 4 | Save to collection, list it, show total value | Yes |
| 5 | Ads for free users, Pro subscription removes ads + adds the Pro feature | Needs a development build |
| 6 | Store listing, privacy policy, closed test, launch | |
