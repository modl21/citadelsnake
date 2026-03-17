import { Skull, RotateCcw, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface GameOverOverlayProps {
  score: number;
  isPublishing: boolean;
  onPlayAgain: () => void;
}

export function GameOverOverlay({ score, isPublishing, onPlayAgain }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden rounded-lg border border-[#6b3519]/80 bg-[radial-gradient(circle_at_top,rgba(168,66,22,0.18),transparent_40%),linear-gradient(180deg,rgba(8,5,3,0.72),rgba(5,3,2,0.92))] backdrop-blur-md">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_center,rgba(255,120,40,0.18),transparent_70%)]" />

      <div className="relative z-10 mx-4 flex w-full max-w-[320px] flex-col items-center gap-5 rounded-2xl border border-[#8b4513]/50 bg-black/35 px-6 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="flex size-20 items-center justify-center rounded-full border border-[#7a2419]/80 bg-[radial-gradient(circle_at_35%_30%,rgba(239,68,68,0.22),rgba(60,10,10,0.92))] shadow-[0_0_35px_rgba(239,68,68,0.18)]">
          <Skull className="size-10 text-[#ff6b57]" />
        </div>

        <div className="space-y-2 text-center">
          <h2 className="font-pixel text-xl tracking-[0.2em] text-[#ff7a63] drop-shadow-[0_0_10px_rgba(255,122,99,0.2)]">
            YOU DIED
          </h2>
          <p className="text-[10px] font-pixel uppercase tracking-[0.28em] text-[#d0a57a]/80">
            The frontier swallowed you whole
          </p>
        </div>

        <div className="w-full rounded-xl border border-[#8b4513]/35 bg-[linear-gradient(180deg,rgba(38,18,10,0.72),rgba(12,8,5,0.72))] px-4 py-4 text-center shadow-inner">
          <p className="font-pixel text-[9px] uppercase tracking-[0.24em] text-[#a97745]">
            Final Bounty
          </p>
          <div className="mt-2 flex items-end justify-center gap-2">
            <span className="font-pixel text-4xl tabular-nums text-[#ffd86a] drop-shadow-[0_0_14px_rgba(255,216,106,0.18)]">
              {score.toLocaleString()}
            </span>
            <span className="pb-1 font-pixel text-[10px] uppercase tracking-[0.18em] text-[#c79a41]">
              pts
            </span>
          </div>
        </div>

        {isPublishing && (
          <div className="flex items-center justify-center gap-2 rounded-full border border-[#8b4513]/30 bg-black/20 px-3 py-2 text-[#d4b18a]">
            <Loader2 className="size-4 animate-spin" />
            <span className="font-pixel text-[10px] uppercase tracking-[0.16em]">Etching score into legend...</span>
          </div>
        )}

        <Button
          onClick={onPlayAgain}
          className="h-14 w-full rounded-xl border border-[#7f3d1d] bg-[linear-gradient(180deg,#c96a2f,#8f3f1c)] font-pixel text-[11px] tracking-[0.14em] text-[#fff0d3] shadow-[0_8px_24px_rgba(150,60,20,0.35)] transition-all hover:scale-[1.02] hover:bg-[linear-gradient(180deg,#d77736,#9e4720)] active:scale-[0.99]"
        >
          <RotateCcw className="mr-2 size-4" />
          RIDE AGAIN · 100 SATS
        </Button>
      </div>
    </div>
  );
}
