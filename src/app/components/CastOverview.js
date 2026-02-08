// app/components/CastOverview.js

// Shadcn UI primitives for layout and typography
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Displays a compact, read-only overview of the current cast.
// Expects:
//   players: Player[] (each with { tribeId: number })
//   tribeNames: { tribe1..tribeN, merge }
const CastOverview = ({ players, tribeNames, numTribes = 2 }) => {
  if (!players || !players.length) return null;

  const palette = [
    "bg-amber-500/20 text-amber-200 border-amber-500/40",
    "bg-violet-500/20 text-violet-200 border-violet-500/40",
    "bg-teal-500/20 text-teal-200 border-teal-500/40",
    "bg-sky-500/20 text-sky-200 border-sky-500/40",
    "bg-rose-500/20 text-rose-200 border-rose-500/40",
    "bg-stone-500/15 text-stone-200 border-stone-500/35",
  ];

  const tribeBlocks = Array.from({ length: numTribes }, (_, i) => {
    const tribeId = i + 1;
    const tribeKey = `tribe${tribeId}`;
    return {
      tribeId,
      tribeKey,
      label:
        numTribes === 1
          ? (tribeNames?.merge || "Merge")
          : (tribeNames?.[tribeKey] || `Tribe ${tribeId}`),
      badgeClass: palette[i % palette.length],
    };
  });

  return (
    // Overall container that keeps the section centered on the page
    <section className="mt-8 max-w-5xl mx-auto px-4">
      {/* Glassy card background for the entire overview */}
      <Card className="bg-black/50 border-white/10 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl text-stone-50">
            Cast Overview
          </CardTitle>
        </CardHeader>

        {/* One block per tribe */}
        <CardContent className="space-y-6 pt-2 pb-4">
          {tribeBlocks.map(({ tribeId, tribeKey, label, badgeClass }, tribeIndex) => {
            const tribePlayers = (players || []).filter((p) => p.tribeId === tribeId);
            if (!tribePlayers.length) return null;

            return (
              <div key={tribeKey} className="space-y-3">
                {/* Tribe heading (badge + decorative separators) */}
                <div className="flex items-center justify-center gap-2">
                  <Separator className="hidden sm:block w-10 bg-white/20" />
                  <Badge
                    variant="outline"
                    className={`px-3 py-0.5 text-[10px] sm:text-xs font-semibold tracking-[0.18em] uppercase ${badgeClass}`}
                  >
                    {label}
                  </Badge>
                  <Separator className="hidden sm:block w-10 bg-white/20" />
                </div>

                {/* Centered rows of players for this tribe */}
                <div className="flex justify-center">
                  <div
                    className="
                      flex flex-wrap justify-center
                      gap-x-6 gap-y-4
                      w-full max-w-[820px]
                    "
                  >
                    {tribePlayers.map((p) => (
                      // Each player gets a fixed-width tile so tribes stay visually consistent
                      <div
                        key={p.id ?? p.name}
                        className="
                          flex flex-col items-center text-center
                          w-24 sm:w-28
                        "
                      >
                        {/* Circular portrait using shadcn Avatar */}
                        <Avatar className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border border-white/40 shadow-md">
                          <AvatarImage
                            src={p.image || '/default-player.png'}
                            alt={p.name}
                            className="object-cover"
                            style={{ imageRendering: 'high-quality' }}
                          />
                          {/* Fallback initial if there’s no image */}
                          <AvatarFallback className="bg-stone-700 text-[10px] sm:text-xs text-stone-100">
                            {p.name?.[0] ?? '?'}
                          </AvatarFallback>
                        </Avatar>

                        {/* Name label under the portrait, ellipsized for very long names */}
                        <p
                          className="
                            mt-1
                            text-[10px] sm:text-[11px]
                            text-stone-100
                            leading-tight
                            truncate
                            max-w-[7rem]
                          "
                        >
                          {p.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Light divider between tribe blocks */}
                {tribeIndex !== tribeBlocks.length - 1 && (
                  <div className="pt-1">
                    <Separator className="mx-auto max-w-xs bg-white/10" />
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
};

export default CastOverview;