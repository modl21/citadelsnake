import { useNostr } from '@nostrify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { GAME_SCORE_KIND, GAME_TAG } from '@/lib/gameConstants';
import { getCurrentWeekStart } from '@/lib/weekUtils';
import type { LeaderboardEntry } from '@/lib/gameTypes';

interface PublishScoreParams {
  score: number;
  lightning: string;
  signer: {
    signEvent(event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>): Promise<NostrEvent>;
  };
}

export function usePublishScore() {
  const { nostr } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ score, lightning, signer }: PublishScoreParams) => {
      const sessionId = crypto.randomUUID();

      const event = await signer.signEvent({
        kind: GAME_SCORE_KIND,
        content: '',
        tags: [
          ['d', sessionId],
          ['score', String(score)],
          ['lightning', lightning],
          ['t', GAME_TAG],
          ['alt', 'Citadel Snake game score'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onSuccess: (event, { score, lightning }) => {
      const weekStart = getCurrentWeekStart();
      const leaderboardKey = ['leaderboard', 'current', weekStart];

      // Optimistically inject the new score into the leaderboard cache.
      const newEntry: LeaderboardEntry = {
        lightning,
        score,
        timestamp: event.created_at,
        eventId: event.id,
      };

      queryClient.setQueryData<LeaderboardEntry[]>(leaderboardKey, (old) => {
        const current = old ?? [];

        // Merge new entry and re-derive top 10 unique by lightning address
        const merged = [...current, newEntry].sort((a, b) => b.score - a.score);
        const seen = new Set<string>();
        const top10: LeaderboardEntry[] = [];
        for (const entry of merged) {
          if (!seen.has(entry.lightning)) {
            seen.add(entry.lightning);
            top10.push(entry);
            if (top10.length >= 10) break;
          }
        }
        return top10;
      });

      // Optimistically bump the all-time play count
      queryClient.setQueryData<number>(['leaderboard', 'all-time-play-count'], (old) => (old ?? 0) + 1);

      // After a short delay, refetch from the relay for authoritative data.
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: leaderboardKey });
        queryClient.invalidateQueries({ queryKey: ['leaderboard', 'all-time-play-count'] });
      }, 3000);
    },
    onError: (error) => {
      console.error('Failed to publish score:', error);
    },
  });
}
