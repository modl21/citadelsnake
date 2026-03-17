import { Skull, RotateCcw, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface GameOverOverlayProps {
  score: number;
  isPublishing: boolean;
  onPlayAgain: () => void;
}

export function GameOverOverlay({ score, isPublishing, onPlayAgain }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto rounded-lg border border-[#6b3519]/80 bg-[radial-gradient(circle_at_top,rgba(168,66,22,0.18),transparent_40%),linear-gradient(180deg,rgba(8,5,3,0.72),rgba(5,3,2,0.92))] p-2 backdrop-blur-md sm:p-4">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.35))]" />
      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_center,rgba(255,120,40,0.18),transparent_70%)] sm:h-28" />

      <div className="relative z-10 my-auto flex max-h-full w-full max-w-[320px] flex-col items-center gap-3 overflow-y-auto rounded-xl border border-[#8b4513]/50 bg-black/35 px-4 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:gap-5 sm:rounded-2xl sm:px-6 sm:py-7">
        <div className="flex size-14 items-center justify-center rounded-full border border-[#7a2419]/80 bg-[radial-gradient(circle_at_35%_30%,rgba(239,68,68,0.22),rgba(60,10,10,0.92))] shadow-[0_0_35px_rgba(239,68,68,0.18)] sm:size-20">
          <Skull className="size-7 text-[#ff6b57] sm:size-10" />
        </div>

        <div className="space-y-1.5 text-center sm:space-y-2">
          <h2 className="font-pixel text-base tracking-[0.14em] text-[#ff7a63] drop-shadow-[0_0_10px_rgba(255,122,99,0.2)] sm:text-xl sm:tracking-[0.2em]">
            YOU DIED
          </h2>
          <p className="text-[8px] font-pixel uppercase tracking-[0.16em] text-[#d0a57a]/80 sm:text-[10px] sm:tracking-[0.28em]">
            The frontier swallowed you whole
          </p>
        </div>

        <div className="w-full rounded-xl border border-[#8b4513]/35 bg-[linear-gradient(180deg,rgba(38,18,10,0.72),rgba(12,8,5,0.72))] px-3 py-3 text-center shadow-inner sm:px-4 sm:py-4">
          <p className="font-pixel text-[8px] uppercase tracking-[0.18em] text-[#a97745] sm:text-[9px] sm:tracking-[0.24em]">
            Final Bounty
          </p>
          <div className="mt-1.5 flex items-end justify-center gap-1.5 sm:mt-2 sm:gap-2">
            <span className="font-pixel text-3xl tabular-nums text-[#ffd86a] drop-shadow-[0_0_14px_rgba(255,216,106,0.18)] sm:text-4xl">
              {score.toLocaleString()}
            </span>
            <span className="pb-0.5 font-pixel text-[8px] uppercase tracking-[0.12em] text-[#c79a41] sm:pb-1 sm:text-[10px] sm:tracking-[0.18em]">
              pts
            </span>
          </div>
        </div>

        {isPublishing && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#8b4513]/30 bg-black/20 px-3 py-2 text-[#d4b18a]">
            <Loader2 className="size-3.5 animate-spin sm:size-4" />
            <span className="text-center font-pixel text-[8px] uppercase tracking-[0.08em] sm:text-[10px] sm:tracking-[0.16em]">
              Etching score into legend...
            </span>
          </div>
        )}

        <Button
          onClick={onPlayAgain}
          className="h-12 w-full rounded-xl border border-[#7f3d1d] bg-[linear-gradient(180deg,#c96a2f,#8f3f1c)] px-3 font-pixel text-[9px] tracking-[0.08em] text-[#fff0d3] shadow-[0_8px_24px_rgba(150,60,20,0.35)] transition-all hover:scale-[1.02] hover:bg-[linear-gradient(180deg,#d77736,#9e4720)] active:scale-[0.99] sm:h-14 sm:text-[11px] sm:tracking-[0.14em]"
        >
          <RotateCcw className="mr-2 size-3.5 sm:size-4" />
          RIDE AGAIN · 100 SATS
        </Button>
      </div>
    </div>
  );
}
