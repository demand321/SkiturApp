import { useEffect, useState } from 'react';
import { subscribeToShoppingList } from '../services/shopping';
import { ShoppingItem } from '../types';

export function useShopping(tripId: string) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToShoppingList(tripId, (data) => {
      setItems(data);
      setLoading(false);
    });
    return unsubscribe;
  }, [tripId]);

  return { items, loading };
}
