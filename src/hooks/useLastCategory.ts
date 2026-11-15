import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, DEFAULT_CATEGORY, findCategory } from '../categories';

const KEY = 'cardscan.lastCategory';

/**
 * Remembers the last category the user picked, so the app opens on
 * "Football" tomorrow if that is what they scanned today.
 */
export function useLastCategory(): [Category, (c: Category) => void] {
  const [category, setCategoryState] = useState<Category>(DEFAULT_CATEGORY);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((saved) => {
        if (saved) setCategoryState(findCategory(saved));
      })
      .catch(() => {});
  }, []);

  function setCategory(c: Category) {
    setCategoryState(c);
    AsyncStorage.setItem(KEY, c.segment).catch(() => {});
  }

  return [category, setCategory];
}
