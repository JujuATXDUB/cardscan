# CardScan — plan, costs and risks

_Updated 14 Nov 2026 after switching from Pokémon to sports cards. Anything marked **verify** came from web search summaries, not the source's own page, so re-check it before relying on it._

## Decisions so far

| Question | Decision |
|---|---|
| Card type | **Sports cards first** (baseball, basketball, football, soccer, hockey). The app is built so any card type can be added later: a card is just "category + details + price", and the identification and price code are swappable modules. Pokémon and other games come after sports works. |
| Your one difference | Still open. Suggested: honest **eBay-sold-based prices with the actual recent sales shown**, not a mystery "estimated value". Decide before Phase 3. |
| Identification (Phase 2) | AI vision model (Claude) reads the card and returns structured details: sport, player, year, brand, set, card number, parallel/variant, graded or raw. The user confirms with one tap. CardSight AI (a sports-card specialist service) is tried alongside it; whichever is more accurate on your real cards wins. |
| Price source (Phase 3) | Start with **The Card API** (eBay sales data, free tier for development, covers sports and Pokémon). Written commercial permission must be confirmed with them before launch. CardSight's built-in prices are the backup for sports; PriceCharting (paid, commercial licence by contact) is the backup for everything else. |
| Phone | iPhone, tested through Expo Go. |
| Extra Pro feature | Cloud backup and sync of the collection, plus price-drop alerts. |

## 1. Tech stack

**React Native + Expo (SDK 58) in TypeScript.** One codebase for iPhone and Android, testable on a real phone without a Mac or Android Studio.

| Phase | Tool | Why |
|---|---|---|
| 1 Camera | `expo-camera`, `expo-image` | Built in, works in Expo Go |
| 2 Identify | Small backend function (Supabase Edge Functions) that sends the photo to Claude with a strict output schema; CardSight AI as the sports specialist | API keys must never live inside the app, so a tiny server piece is unavoidable |
| 3 Price | The Card API, behind a swappable price module | Covers sports and TCGs from one source |
| 4 Collection | `expo-sqlite` on the phone first; Supabase for accounts and sync later | Local-first is simpler, free, and works offline |
| 5 Money | AdMob (`react-native-google-mobile-ads`) + RevenueCat | Industry standard; RevenueCat is free until you earn real money |

**How you test on your iPhone**

- Phases 1–4: **Expo Go** (free, App Store). Scan the QR code from your laptop and the app appears on your phone.
- Phase 5 adds ads, which Expo Go cannot run, so from then on we build a **development build** with EAS Build. On iPhone that needs the Apple Developer account.
- **verify:** During 2026 Expo Go for new SDKs has sometimes been stuck in Apple's review for months. If the App Store version will not open an SDK 58 project, fallbacks are: `npx eas-cli@latest go` (needs the Apple account) or an early development build. Check https://expo.dev/go.

## 2. Costs

| Item | Cost | When you need it |
|---|---|---|
| Apple Developer Program | US$99 / year | Publishing, and any iPhone testing outside Expo Go |
| Google Play Console | US$25 once | Publishing on Android. New personal accounts must run a closed test with 12 testers for 14 days first |
| Expo EAS Build | Free tier (small monthly quota), then from ~US$19/month **verify** | Phase 5, or earlier if Expo Go is unavailable |
| Supabase | Free tier | Phase 2 (backend function), Phase 4b (sync) |
| Claude API (identification) | Pay per scan. Claude Opus 5.5 is US$4 per million input tokens; a card photo plus instructions is roughly 2,000 tokens, so about **US$0.01 per scan**. Claude Haiku 5.5 would be about 40× cheaper if it proves accurate enough | Phase 2 |
| CardSight AI | Free: 750 calls/month. Pro US$14.95/month for 5,000 calls **verify** | Phase 2/3 if it wins the accuracy test |
| The Card API | Free tier (5,000 sales/day, 3-day lookback). Paid from US$9/month; commercial licence terms to confirm in writing **verify** | Phase 3 |
| PriceCharting / SportsCardsPro | Paid subscription; API is "internal use only" unless you agree a commercial licence with them **verify** | Backup only |
| AdMob, RevenueCat | Free to start | Phase 5 |
| Domain + privacy-policy page | ~US$10–15 / year | Both stores require a privacy policy URL |

Realistic total to launch: about **US$125 in store fees**, plus roughly US$10–25/month in services once real users scan cards.

## 3. Phase 2 — how to identify a sports card

Sports cards are mostly identified by **printed text**: player name, year, brand (Topps, Panini, Upper Deck, Bowman), set name, card number, and the serial numbering on limited parallels (e.g. "23/99"). The front shows the player and brand; the **back** shows the card number, year and set. So:

1. The app asks for a photo of the **front**, and optionally the **back** (the back dramatically improves accuracy).
2. The photo(s) go to a small backend function, which asks Claude to return a fixed JSON shape: `{ category, sport, player, year, manufacturer, setName, cardNumber, parallel, serialNumber, isGraded, grader, grade, confidence }`.
3. The app shows the result; the user confirms or fixes it. Parallels (Refractor, Prizm Silver, etc.) are hard from a photo for every app, so the user will often confirm that field.
4. In parallel, the same photo is sent to CardSight AI and the two answers are compared during testing. The more accurate one becomes the default; the other stays as a fallback.

## 4. Phase 3 — price data for sports cards

The sports-card market is priced off **eBay sold listings**. There is no equivalent of a central "market price" like TCGs have.

| Source | What it gives | Cost | Allowed in a commercial app? |
|---|---|---|---|
| **The Card API** | Raw eBay sales + 16M-card catalogue, sports and Pokémon | Free tier; US$9–199/month | Commercial licence stated "in writing" under Enterprise; lower tiers unclear. **Ask them by email before launch** |
| **CardSight AI** | Identification + market price in one call | Free 750/month, then US$14.95+ | Built for apps, yes |
| **PriceCharting / SportsCardsPro** | Sports, TCG and video-game prices | Paid subscription | "Internal use only" unless you agree a commercial licence with them |
| **eBay Marketplace Insights API** | Official sold listings | Free | Limited release, approval rarely granted to small apps. Apply anyway; it costs nothing |
| **Card Ladder, 130point, Beckett** | Prices and sales | Subscription / none | No public API; not usable |
| Scraping eBay | Anything | "Free" | **No.** Breaks terms, fragile, store takedown risk |

## 5. Risks and problems with the idea

1. **Price data licensing.** Every good source either needs written permission or approval. Budget a few emails and possibly a monthly fee before launch.
2. **Parallels and variants.** Telling a base card from a Refractor from a photo is unreliable for every app on the market. Expect to ask the user.
3. **"Everything" is a trap for a first version.** Each card type has its own quirks (Pokémon has set symbols, Magic has printings, sports has parallels). Ship sports well, then add types one at a time using the same module structure.
4. **Trademarks.** Do not use "Topps", "Panini", league names or team logos in the app name, icon or store listing. Showing card images inside the app is common practice but is at the rights holders' tolerance.
5. **Competition.** Ludex, CollX and Collectr are funded teams. A narrow, honest niche beats a broad feature list.
6. **Expo Go availability** on iPhone has been patchy in 2026. Might force the Apple US$99 earlier than Phase 5.
7. **Google Play's 14-day closed test** rule adds two weeks before you can go public on Android.
8. **Per-scan costs.** Free users scanning cards costs you money. Cap free scans per day and cache results.
9. **Scope for a beginner.** Phases 1 and 4 are easy. Phase 2 is the hard one and may take several iterations. Budget evenings over 2–3 months.

## 6. Phase plan

| Phase | Goal | Testable on phone? |
|---|---|---|
| 1 ✅ | Camera screen, card guide frame, take and review a photo | Yes, Expo Go |
| 2 | Identify the card (front + optional back), show details, user confirms | Yes, Expo Go |
| 3 | Show recent sales and a price, with the source and date | Yes |
| 4 | Save to collection, list it, show total value | Yes |
| 5 | Ads for free users, Pro subscription removes ads + adds the Pro feature | Needs a development build |
| 6 | Store listing, privacy policy, closed test, launch | |

## What you need to sign up for before Phase 2 (all free)

1. An Anthropic API account at https://platform.claude.com (for Claude identification). Add a small amount of credit, US$5 is plenty for testing.
2. A CardSight AI account at https://cardsight.ai (free tier).
3. A Supabase account at https://supabase.com (free tier), for the backend function that keeps those keys off the phone.

Never paste any API key into chat. Each one goes into Supabase's secrets settings.
