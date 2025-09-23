'use client';

import { useState, useEffect, useCallback } from 'react';
import { gestureDB } from '@/lib/db';
import type { Gesture } from '@/lib/types';

export function useGestures() {
  const [gestures, setGestures] = useState<Gesture[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshGestures = useCallback(async () => {
    setIsLoading(true);
    const storedGestures = await gestureDB.getAll();
    setGestures(storedGestures);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshGestures();
  }, [refreshGestures]);

  const addGesture = async (gesture: Gesture) => {
    // Ensure description is always a string
    const gestureWithDescription = {
      ...gesture,
      description: gesture.description || '',
    };
    await gestureDB.add(gestureWithDescription);
    await refreshGestures();
  };

  const deleteGesture = async (label: string) => {
    await gestureDB.delete(label);
    await refreshGestures();
  };

  return { gestures, isLoading, addGesture, deleteGesture, refreshGestures };
}
