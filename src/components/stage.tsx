import React from "react";
import { cn } from "@/lib/utils";
import { stations, type StationId } from "@/lib/stations";

/**
 * A framed panel the sculpture docks in while its section is on screen. The
 * panel itself is empty: the scene layer draws over whatever `data-stage`
 * element belongs to the current station.
 */
export const Stage = ({
  station,
  hint,
  className,
}: {
  station: StationId;
  hint?: string;
  className?: string;
}) => {
  const index = stations.findIndex((s) => s.id === station);
  const { figure, caption } = stations[index];

  return (
    <figure
      className={cn(
        "stage relative flex flex-col overflow-hidden rounded-2xl bg-(--stage-bg) shadow-[var(--shadow-aceternity)]",
        className,
      )}
    >
      <div
        data-stage={station}
        className="stage-view relative min-h-0 flex-1 bg-[image:radial-gradient(var(--pattern-fg)_1px,_transparent_1px)] bg-[size:14px_14px]"
      >
        {hint && (
          <span className="stage-hint pointer-events-none absolute top-2 right-3 hidden text-[10px] tracking-wide text-neutral-400 uppercase md:block dark:text-neutral-500">
            {hint}
          </span>
        )}
      </div>
      <figcaption className="flex items-baseline gap-2 border-t border-neutral-200/70 px-3 py-2 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
        <span className="shrink-0 rounded-sm px-1 font-medium whitespace-nowrap text-neutral-700 shadow-[var(--shadow-aceternity)] dark:text-neutral-200">
          Fig. {index + 1}
        </span>
        <span className="shrink-0 font-medium text-neutral-800 dark:text-neutral-200">
          {figure}
        </span>
        <span className="truncate">{caption}</span>
      </figcaption>
    </figure>
  );
};
