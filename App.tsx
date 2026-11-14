import { useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraScreen, type CapturedPhoto } from './src/screens/CameraScreen';
import { PreviewScreen } from './src/screens/PreviewScreen';

/**
 * The root of the app.
 *
 * For Phase 1 there are only two screens, so we switch between them with a
 * single piece of state instead of a navigation library. When the app grows
 * (collection tab, settings, card detail) we'll add Expo Router.
 */
export default function App() {
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);

  function handleAccept() {
    // Phase 2 will send the photo off to be identified. For now, just confirm.
    Alert.alert('Photo saved', 'In Phase 2 this is where we identify the card.', [
      { text: 'OK', onPress: () => setPhoto(null) },
    ]);
  }

  return (
    <>
      <StatusBar style="light" />
      {photo ? (
        <PreviewScreen photo={photo} onRetake={() => setPhoto(null)} onAccept={handleAccept} />
      ) : (
        <CameraScreen onPhotoTaken={setPhoto} />
      )}
    </>
  );
}
