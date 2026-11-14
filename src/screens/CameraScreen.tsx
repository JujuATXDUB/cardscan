import { useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { CardGuide } from '../components/CardGuide';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing } from '../theme';

/** What the camera screen hands back when the user confirms a photo. */
export type CapturedPhoto = {
  uri: string; // a file path on the phone, e.g. file:///.../photo.jpg
  width: number;
  height: number;
};

type Props = {
  onPhotoTaken: (photo: CapturedPhoto) => void;
};

/**
 * Phase 1: show the camera, let the user take a photo of a card.
 *
 * Flow:
 *   1. Ask for camera permission (first launch only).
 *   2. Show the live preview with a card-shaped guide.
 *   3. Tap the shutter -> take the picture -> hand it to the parent.
 */
export function CameraScreen({ onPhotoTaken }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  // --- Permission states -------------------------------------------------

  if (!permission) {
    // Still finding out whether we have permission. Show nothing for a moment.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // We can only ask once with a system dialog. If the user said "no" before,
    // the only way back is through the phone's Settings app.
    const canAskAgain = permission.canAskAgain;
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Camera access needed</Text>
        <Text style={styles.body}>
          CardScan needs the camera to photograph your cards. Nothing is uploaded in this
          version; photos stay on your phone.
        </Text>
        <PrimaryButton
          label={canAskAgain ? 'Allow camera' : 'Open Settings'}
          onPress={canAskAgain ? requestPermission : Linking.openSettings}
        />
      </View>
    );
  }

  // --- Taking the picture ------------------------------------------------

  async function takePicture() {
    if (!cameraRef.current || !isReady || isCapturing) return;
    setIsCapturing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.85, // 0..1. Slightly compressed keeps files small but sharp enough to read text.
        skipProcessing: false, // let the OS fix orientation so the photo is upright
      });
      onPhotoTaken({ uri: picture.uri, width: picture.width, height: picture.height });
    } catch (error) {
      console.warn('Taking the picture failed', error);
    } finally {
      setIsCapturing(false);
    }
  }

  // --- The camera UI -----------------------------------------------------

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
        mode="picture"
        onCameraReady={() => setIsReady(true)}
      />

      <CardGuide />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>CardScan</Text>
        <Pressable
          onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
          style={styles.flashButton}
          accessibilityLabel="Toggle flash"
        >
          <Text style={styles.flashText}>{flash === 'on' ? '⚡ Flash on' : '⚡ Flash off'}</Text>
        </Pressable>
      </View>

      {/* Bottom bar with the shutter button */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={takePicture}
          disabled={!isReady || isCapturing}
          accessibilityLabel="Take photo"
          style={({ pressed }) => [styles.shutterOuter, pressed && { opacity: 0.7 }]}
        >
          <View style={styles.shutterInner}>
            {isCapturing ? <ActivityIndicator color="#111" /> : null}
          </View>
        </Pressable>
        <Text style={styles.shutterHint}>{isReady ? 'Tap to scan' : 'Starting camera…'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  body: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  topBar: {
    position: 'absolute',
    top: 56,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  flashButton: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  flashText: { color: colors.text, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
  },
  shutterOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterHint: { color: colors.text, fontSize: 13, opacity: 0.8 },
});
