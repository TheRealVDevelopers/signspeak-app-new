
'use client';

import { useState, useEffect, useCallback } from 'react';
import { sentenceDB } from '@/frontend/lib/db';
import type { Sentence } from '@/frontend/lib/types';

export function useSentences() {
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSentences = useCallback(async () => {
    setIsLoading(true);
    const storedSentences = await sentenceDB.getAll();
    setSentences(storedSentences);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSentences();
  }, [refreshSentences]);

  const addSentence = async (sentence: Sentence) => {
    await sentenceDB.add(sentence);
    await refreshSentences();
  };

  const deleteSentence = async (label: string) => {
    await sentenceDB.delete(label);
    await refreshSentences();
  };

  return { sentences, isLoading, addSentence, deleteSentence, refreshSentences };
}
