import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PrimaryButton } from '../components/PrimaryButton';
import { findCategory } from '../categories';
import {
  describeCard,
  Detection,
  IdentifiedCard,
  IdentifyError,
  identifyCard,
  IdentifyResponse,
} from '../services/identify';
import { colors, spacing } from '../theme';

type Props = {
  photoUri: string;
  segment: string;
  onScanAnother: () => void;
};

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string; kind: IdentifyError['kind'] }
  | { status: 'done'; result: IdentifyResponse; chosen: IdentifiedCard | null };

/**
 * Phase 2: send the photo off, then show what came back.
 *
 * Three outcomes:
 *   - identified: show the card details, let the user confirm or pick an alternative
 *   - a card was seen but not recognised: explain and offer a retake
 *   - error: explain in plain words and offer a retry
 */
export function ResultScreen({ photoUri, segment, onScanAnother }: Props) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const category = findCategory(segment);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    identifyCard(photoUri, segment)
      .then((result) => {
        if (cancelled) return;
        setState({ status: 'done', result, chosen: result.best?.card ?? null });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const kind = error instanceof IdentifyError ? error.kind : 'server';
        const message = error instanceof Error ? error.message : 'Something went wrong.';
        setState({ status: 'error', message, kind });
      });
    return () => {
      cancelled = true;
    };
  }, [photoUri, segment, attempt]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Image source={{ uri: photoUri }} style={styles.thumb} contentFit="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>
              {category.emoji} {category.label}
            </Text>
            <Text style={styles.title}>
              {state.status === 'loading' && 'Identifying…'}
              {state.status === 'error' && 'Could not identify'}
              {state.status === 'done' && (state.chosen ? 'We think this is' : 'Not recognised')}
            </Text>
          </View>
        </View>

        {state.status === 'loading' && (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.body}>Checking the card against the catalogue. A few seconds.</Text>
          </View>
        )}

        {state.status === 'error' && (
          <View style={styles.card}>
            <Text style={styles.body}>{state.message}</Text>
            {state.kind === 'not-configured' && (
              <Text style={styles.hint}>
                This is expected until the Supabase project is connected. The camera and preview
                still work.
              </Text>
            )}
          </View>
        )}

        {state.status === 'done' && (
          <ResultBody
            result={state.result}
            chosen={state.chosen}
            onChoose={(card) => setState({ ...state, chosen: card })}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {state.status === 'error' && state.kind !== 'not-configured' && (
          <PrimaryButton label="Try again" variant="secondary" onPress={() => setAttempt((n) => n + 1)} />
        )}
        <PrimaryButton
          label={state.status === 'done' && state.chosen ? 'Looks right' : 'Scan another'}
          onPress={onScanAnother}
        />
      </View>
    </View>
  );
}

function ResultBody({
  result,
  chosen,
  onChoose,
}: {
  result: IdentifyResponse;
  chosen: IdentifiedCard | null;
  onChoose: (card: IdentifiedCard) => void;
}) {
  const best = result.best;

  if (!best || best.matchLevel === 'none') {
    return (
      <View style={styles.card}>
        <Text style={styles.body}>
          {result.detectedCount === 0
            ? 'No card was found in the photo.'
            : 'A card was found, but it is not in the catalogue yet or the photo was too unclear.'}
        </Text>
        <Text style={styles.hint}>
          Tips: fill the frame with the card, avoid glare, hold the phone still, and check the
          category chip matches the card.
        </Text>
        {result.messages.map((m) => (
          <Text key={m} style={styles.hint}>
            {m}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <>
      {chosen && <CardDetails card={chosen} detection={best} />}

      {best.alternatives.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Not quite? It could also be</Text>
          {[best.card, ...best.alternatives].map((alt, i) => {
            const selected = alt === chosen;
            return (
              <Pressable
                key={`${alt.id ?? 'alt'}-${i}`}
                onPress={() => onChoose(alt)}
                style={[styles.altRow, selected && styles.altRowSelected]}
              >
                <Text style={[styles.altText, selected && styles.altTextSelected]}>
                  {describeCard(alt)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {result.messages.length > 0 && (
        <View style={styles.card}>
          {result.messages.map((m) => (
            <Text key={m} style={styles.hint}>
              {m}
            </Text>
          ))}
        </View>
      )}
    </>
  );
}

function CardDetails({ card, detection }: { card: IdentifiedCard; detection: Detection }) {
  const rows: [string, string | undefined][] = [
    ['Name', card.name],
    ['Year', card.year],
    ['Brand', card.manufacturer],
    ['Release', card.releaseName],
    ['Set', card.setName],
    ['Number', card.number ? `#${card.number}${card.numberedTo ? ` /${card.numberedTo}` : ''}` : undefined],
  ];
  for (const f of card.fields ?? []) rows.push([prettyKey(f.key), f.value]);

  return (
    <View style={styles.card}>
      <Text style={styles.cardName}>{describeCard(card)}</Text>
      <View style={styles.badges}>
        <Badge text={`${detection.confidence} confidence`} tone={detection.confidence} />
        {detection.matchLevel === 'set' && <Badge text="Set found, exact card unsure" tone="Low" />}
        {detection.graded && (
          <Badge text={`${detection.graded.company} ${detection.graded.grade ?? ''}`.trim()} tone="High" />
        )}
      </View>

      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <View key={k} style={styles.row}>
            <Text style={styles.rowKey}>{k}</Text>
            <Text style={styles.rowValue}>{v}</Text>
          </View>
        ))}

      {card.parallels && card.parallels.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Possible parallel</Text>
          {card.parallels.map((p) => (
            <Text key={p.id ?? p.name} style={styles.body}>
              • {p.name}
              {p.numberedTo ? ` (/${p.numberedTo})` : ''}
              {p.confidence ? ` · ${p.confidence}` : ''}
            </Text>
          ))}
          <Text style={styles.hint}>Parallels are hard to tell from a photo. Treat this as a hint.</Text>
        </>
      )}
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: 'High' | 'Medium' | 'Low' }) {
  const bg = tone === 'High' ? '#1f7a4d' : tone === 'Medium' ? '#8a6d00' : '#7a2f2f';
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

function prettyKey(key: string): string {
  // "CARD_LANGUAGE" -> "Card language"
  const words = key.toLowerCase().replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingTop: 56, gap: spacing.md, paddingBottom: 140 },
  header: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumb: { width: 72, height: 100, borderRadius: 8, backgroundColor: colors.surface },
  kicker: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  centered: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.md, gap: spacing.sm },
  cardName: { color: colors.text, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  rowKey: { color: colors.textMuted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: spacing.sm },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  hint: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  altRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 10 },
  altRowSelected: { backgroundColor: 'rgba(255,204,0,0.15)' },
  altText: { color: colors.text, fontSize: 14 },
  altTextSelected: { color: colors.accent, fontWeight: '700' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl + spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
});
