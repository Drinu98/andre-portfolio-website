import React from "react";
import { figureNumber, stations, type StationId } from "@/lib/stations";

export const SectionHead = ({
  station,
  title,
  children,
}: {
  station: StationId;
  title: string;
  children?: React.ReactNode;
}) => {
  const index = stations.findIndex((s) => s.id === station);
  const { nav, figure } = stations[index];

  return (
    <header className="section-head" data-reveal>
      <p className="mono section-head__meta">
        <span>
          Sheet <b>{figureNumber(index)}</b>
        </span>
        <span>{nav}</span>
        <span>Fig. {figure}</span>
      </p>
      <h2 id={`${station}-title`}>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
};
