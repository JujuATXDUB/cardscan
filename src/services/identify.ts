import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { SUPABASE_ANON_KEY, SUPABASE_URL, isBackendConfigured } from '../config';

/**
 * What the server sends back. This mirrors CardSight's "detection" shape but
 * only the parts the app shows, so the rest of the app never depends on the
 * provider directly. Swapping providers later means changing the server and
 * this file, nothing else.
 */
export type IdentifiedCard = {
  id?: string; // CardSight card id, present only for an exact match
  name?: string; // player or character name
  year?: string;
  manufacturer?: string; // Topps, Panini, ...
  releaseName?: string; // e.g. "Chrome"
  setName?: string; // e.g. "Base Set"
  number?: string;
  numberedTo?: number; // e.g. 99 for a /99 card
  parallels?: { id?: string; name: string; numberedTo?: number; confidence?: string }[];
  fields?: { key: string; value: string }[]; // Rarity, HP, Artist...
};

export type Detection = {
  confidence: 'High' | 'Medium' | 'Low';
  matchLevel: 'exact' | 'set' | 'none';
  card: IdentifiedCard;
  alternatives: IdentifiedCard[]; // other candidates, best first
  graded?: { company: string; grade?: string; certNumber?: string };
};

export type IdentifyResponse = {
  ok: true;
  detectedCount: number;
  identifiedCount: number;
  best: Detection | null;
  messages: string[];
  requestId?: string;
};

export class IdentifyError extends Error {
  constructor(
    message: string,
    public readonly kind: 'not-configured' | 'network' | 'server' | 'bad-image',
  ) {
    super(message);
  }
}

/**
 * Shrinks the photo so the upload is fast (a 12-megapixel photo is ~4 MB; at
 * 1280 px wide it is ~250 KB and still perfectly readable) and returns it as
 * base64 text, which is easy to send as JSON.
 */
async function prepareImage(uri: string): Promise<string> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 1280 });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  if (!saved.base64) throw new IdentifyError('Could not read the photo', 'bad-image');
  return saved.base64;
}

/**
 * Sends the photo to our backend function, which asks CardSight what the card is.
 */
export async function identifyCard(photoUri: string, segment: string): Promise<IdentifyResponse> {
  if (!isBackendConfigured()) {
    throw new IdentifyError('The backend is not set up yet (see docs/PHASE2-SETUP.md).', 'not-configured');
  }

  const imageBase64 = await prepareImage(photoUri);

  let response: Response;
  try {
    response = await fetch(`${SUPABASE_URL}/functions/v1/identify-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ imageBase64, segment }),
    });
  } catch {
    throw new IdentifyError('No internet connection, or the server is unreachable.', 'network');
  }

  const body = (await response.json().catch(() => null)) as
    | IdentifyResponse
    | { ok: false; error: string }
    | null;

  if (!response.ok || !body || body.ok !== true) {
    const detail = body && 'error' in body ? body.error : `HTTP ${response.status}`;
    throw new IdentifyError(`The identification service failed: ${detail}`, 'server');
  }
  return body;
}

/** "2023 Topps Chrome Base Set Aaron Judge #99" */
export function describeCard(card: IdentifiedCard): string {
  const parts = [card.year, card.manufacturer, card.releaseName, card.setName, card.name].filter(Boolean);
  const text = parts.join(' ');
  return card.number ? `${text} #${card.number}` : text || 'Unknown card';
}
