import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { CARD_ASPECT_RATIO, colors, spacing } from '../theme';

/**
 * Draws a card-shaped frame over the camera preview, with a dimmed area
 * around it, so the user knows where to hold the card.
 *
 * Phase 2 will use this same box to crop the photo before identifying the
 * card, so keeping the guide in the real card ratio matters.
 */
export function CardGuide() {
  const { width, height } = useWindowDimensions();

  // Guide box: 72% of the screen width, height follows the card ratio.
  const boxWidth = Math.round(width * 0.72);
  const boxHeight = Math.round(boxWidth / CARD_ASPECT_RATIO);

  // Centre the box slightly above the middle so it clears the shutter button.
  const top = Math.max(spacing.xl, Math.round(height * 0.42 - boxHeight / 2));
  const left = Math.round((width - boxWidth) / 2);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Four dimmed rectangles around the box make the "cut-out" effect. */}
      <View style={[styles.scrim, { top: 0, left: 0, right: 0, height: top }]} />
      <View style={[styles.scrim, { top, left: 0, width: left, height: boxHeight }]} />
      <View style={[styles.scrim, { top, right: 0, width: left, height: boxHeight }]} />
      <View style={[styles.scrim, { top: top + boxHeight, left: 0, right: 0, bottom: 0 }]} />

      <View style={[styles.box, { top, left, width: boxWidth, height: boxHeight }]}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      <Text style={[styles.hint, { top: top + boxHeight + spacing.md }]}>
        Line the card up inside the frame
      </Text>
    </View>
  );
}

const CORNER = 28;
const STROKE = 4;

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    backgroundColor: colors.scrim,
  },
  box: {
    position: 'absolute',
    borderRadius: 12,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: colors.guide,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: STROKE, borderLeftWidth: STROKE, borderTopLeftRadius: 12 },
  topRight: { top: 0, right: 0, borderTopWidth: STROKE, borderRightWidth: STROKE, borderTopRightRadius: 12 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: STROKE, borderLeftWidth: STROKE, borderBottomLeftRadius: 12 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: STROKE, borderRightWidth: STROKE, borderBottomRightRadius: 12 },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
});
