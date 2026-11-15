// CardScan backend: identify a card photo with CardSight AI.
//
// Runs on Supabase Edge Functions (Deno). The app sends { imageBase64, segment }
// and gets back a trimmed-down, provider-neutral result. The CardSight API key
// lives in a Supabase secret called CARDSIGHT_API_KEY and never reaches the app.

import { decodeBase64 } from 'jsr:@std/encoding@1/base64';
import { CardSightAI } from 'npm:cardsightai@4.4.0';
import type { CardDetection, DetectedCard } from 'npm:cardsightai@4.4.0';

const ALLOWED_SEGMENTS = new Set([
  'baseball', 'football', 'basketball', 'hockey', 'soccer', 'mma',
  'pokemon', 'magic', 'onepiece', 'marvel', 'disney',
]);
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // 6 MB after decoding

const CONFIDENCE_RANK = { High: 3, Medium: 2, Low: 1 } as const;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Keep only the fields the app shows. */
function trimCard(card: DetectedCard) {
  return {
    id: card.id,
    name: card.name,
    year: card.year,
    manufacturer: card.manufacturer,
    releaseName: card.releaseName,
    setName: card.setName,
    number: card.number,
    numberedTo: card.numberedTo,
    parallels: card.parallelSuggestions?.map((p) => ({
      id: p.id,
      name: p.name,
      numberedTo: p.numberedTo,
      confidence: p.confidence,
    })),
    fields: card.fields?.map((f) => ({ key: f.key, value: String(f.value) })),
  };
}

function matchLevel(card: DetectedCard): 'exact' | 'set' | 'none' {
  if (card.id) return 'exact';
  if (card.setId) return 'set';
  return 'none';
}

/** The card the user is most likely holding up: closest to the camera, then most confident. */
function pickBest(detections: CardDetection[]): CardDetection | null {
  if (detections.length === 0) return null;
  return [...detections].sort((a, b) => {
    const z = (b.zIndex ?? -99) - (a.zIndex ?? -99);
    if (z !== 0) return z;
    return CONFIDENCE_RANK[b.confidence] - CONFIDENCE_RANK[a.confidence];
  })[0];
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ ok: false, error: 'Use POST' }, 405);

  const apiKey = Deno.env.get('CARDSIGHT_API_KEY');
  if (!apiKey) return json({ ok: false, error: 'Server is missing CARDSIGHT_API_KEY' }, 500);

  let payload: { imageBase64?: unknown; segment?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: 'Body must be JSON' }, 400);
  }

  const segment = typeof payload.segment === 'string' ? payload.segment : 'baseball';
  if (!ALLOWED_SEGMENTS.has(segment)) return json({ ok: false, error: `Unknown category: ${segment}` }, 400);
  if (typeof payload.imageBase64 !== 'string' || payload.imageBase64.length === 0) {
    return json({ ok: false, error: 'imageBase64 is required' }, 400);
  }

  let bytes: Uint8Array;
  try {
    bytes = decodeBase64(payload.imageBase64);
  } catch {
    return json({ ok: false, error: 'imageBase64 is not valid base64' }, 400);
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) return json({ ok: false, error: 'Image too large' }, 413);

  const client = new CardSightAI({ apiKey, timeout: 45_000 });
  const image = new Blob([new Uint8Array(bytes)], { type: 'image/jpeg' });

  try {
    const { data, error, response } = await client.identify.cardBySegment(segment, image);
    if (error || !data) {
      console.error('CardSight error', response?.status, error);
      return json({ ok: false, error: `CardSight returned ${response?.status ?? 'an error'}` }, 502);
    }

    const detections: CardDetection[] = data.detections ?? [];
    const best = pickBest(detections);

    return json({
      ok: true,
      detectedCount: data.detectedCount ?? detections.length,
      identifiedCount: data.identifiedCount ?? detections.filter((d: CardDetection) => matchLevel(d.card) !== 'none').length,
      best: best && {
        confidence: best.confidence,
        matchLevel: matchLevel(best.card),
        card: trimCard(best.card),
        alternatives: (best.card.suggestions ?? []).map(trimCard),
        graded: best.grading && {
          company: best.grading.company.name,
          grade: best.grading.grade?.value,
          certNumber: best.grading.certNumber,
        },
      },
      messages: (data.messages ?? []).map((m: { message: string }) => m.message),
      requestId: data.requestId,
    });
  } catch (err) {
    console.error('identify-card failed', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return json({ ok: false, error: message }, 502);
  }
});
