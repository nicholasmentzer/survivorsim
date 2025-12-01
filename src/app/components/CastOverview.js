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
// Expects the same playerConfig shape you use elsewhere:
//   { men: Player[], women: Player[] }
// and tribeNames: { tribe1, tribe2 }.
const CastOverview = ({ playerConfig, tribeNames }) => {
  // If we don't have players yet, don't render the section at all.
  if (!playerConfig) return null;

  // Simple configuration for each tribe we want to show.
  // This defines which key in playerConfig to read and
  // what label / color styling to use for that group.
  const tribes = [
    {
      key: "men",
      label: tribeNames?.tribe1 || "Tribe 1",
      badgeClass: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    },
    {
      key: "women",
      label: tribeNames?.tribe2 || "Tribe 2",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    },
  ];

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

        {/* One "block" per tribe (men/women) */}
        <CardContent className="space-y-6 pt-2 pb-4">
          {tribes.map(({ key, label, badgeClass }, tribeIndex) => {
            const tribePlayers = playerConfig[key] || [];
            if (!tribePlayers.length) return null;

            return (
              <div key={key} className="space-y-3">
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
                        <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border border-white/40 shadow-md">
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

                {/* Light divider between the first and second tribe blocks */}
                {tribeIndex === 0 && (
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