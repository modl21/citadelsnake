import { useNostr } from '@nostrify/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { GAME_SCORE_KIND, GAME_ID } from '@/lib/gameConstants';
import { getCurrentWeekStart } from '@/lib/weekUtils';

interface PublishScoreParams {
  score: number;
  lightning: string;
  signer: {
    signEvent(event: Omit<NostrEvent, 'id' | 'pubkey' | 'sig'>): Promise<NostrEvent>;
    getPublicKey(): Promise<string>;
  };
}

export function usePublishScore() {
  const { nostr } = useNostr();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ score, lightning, signer }: PublishScoreParams) => {
      const playerPubkey = await signer.getPublicKey();
      const sessionId = crypto.randomUUID();

      // Gamestr kind 30762 schema (addressable event)
      // d tag format: "game-id:player-pubkey:session-id"
      const dTag = `${GAME_ID}:${playerPubkey}:${sessionId}`;

      const event = await signer.signEvent({
        kind: GAME_SCORE_KIND,
        content: '',
        tags: [
          ['d', dTag],
          ['game', GAME_ID],
          ['score', String(score)],
          ['lightning', lightning],
          ['alt', 'Citadel Snake game score'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });

      await nostr.event(event, { signal: AbortSignal.timeout(5000) });
      return event;
    },
    onSuccess: () => {
      const weekStart = getCurrentWeekStart();
      queryClient.invalidateQueries({ queryKey: ['leaderboard', 'current', weekStart] });
    },
    onError: (error) => {
      console.error('Failed to publish score:', error);
    },
  });
}
