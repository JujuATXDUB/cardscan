import { router, useLocalSearchParams } from 'expo-router';
import { ResultScreen } from '../screens/ResultScreen';

/** Identifies the photo and shows what the card is. */
export default function Result() {
  const { uri, segment } = useLocalSearchParams<{ uri: string; segment: string }>();

  return (
    <ResultScreen
      photoUri={uri}
      segment={segment}
      onScanAnother={() => router.dismissTo('/')}
    />
  );
}
