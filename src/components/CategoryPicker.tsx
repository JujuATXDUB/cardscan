import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { CATEGORIES, Category } from '../categories';
import { colors, spacing } from '../theme';

type Props = {
  value: Category;
  onChange: (c: Category) => void;
};

/** A horizontal row of chips for choosing what kind of card is being scanned. */
export function CategoryPicker({ value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {CATEGORIES.map((c) => {
        const selected = c.segment === value.segment;
        return (
          <Pressable
            key={c.segment}
            onPress={() => onChange(c)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {c.emoji} {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 14 },
  chipTextSelected: { color: '#111' },
});
