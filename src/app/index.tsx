import { router } from 'expo-router';
import { CameraScreen } from '../screens/CameraScreen';
import { useLastCategory } from '../hooks/useLastCategory';

/** Home screen: the camera. */
export default function Index() {
  const [category, setCategory] = useLastCategory();

  return (
    <CameraScreen
      category={category}
      onCategoryChange={setCategory}
      onPhotoTaken={(photo) =>
        router.push({
          pathname: '/preview',
          params: {
            uri: photo.uri,
            width: String(photo.width),
            height: String(photo.height),
            segment: category.segment,
          },
        })
      }
    />
  );
}
