import { router, useLocalSearchParams } from 'expo-router';
import { PreviewScreen } from '../screens/PreviewScreen';

/** Shows the photo just taken. "Use photo" moves on to identification. */
export default function Preview() {
  const { uri, width, height, segment } = useLocalSearchParams<{
    uri: string;
    width: string;
    height: string;
    segment: string;
  }>();

  return (
    <PreviewScreen
      photo={{ uri, width: Number(width), height: Number(height) }}
      onRetake={() => router.back()}
      onAccept={() => router.replace({ pathname: '/result', params: { uri, segment } })}
    />
  );
}
