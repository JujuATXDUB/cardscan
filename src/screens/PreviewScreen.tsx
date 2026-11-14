import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';
import type { CapturedPhoto } from './CameraScreen';

type Props = {
  photo: CapturedPhoto;
  onRetake: () => void;
  onAccept: () => void;
};

/**
 * Shows the photo the user just took so they can check it is sharp and
 * the whole card is visible before we try to identify it (Phase 2).
 */
export function PreviewScreen({ photo, onRetake, onAccept }: Props) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.image} contentFit="contain" />

      <View style={styles.footer}>
        <Text style={styles.meta}>
          {photo.width} × {photo.height} px
        </Text>
        <View style={styles.buttons}>
          <PrimaryButton label="Retake" variant="secondary" onPress={onRetake} />
          <PrimaryButton label="Use photo" onPress={onAccept} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  image: { flex: 1, marginTop: 48 },
  footer: { padding: spacing.lg, paddingBottom: spacing.xl + spacing.md, gap: spacing.md },
  meta: { color: colors.textMuted, textAlign: 'center', fontSize: 13 },
  buttons: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md },
});
