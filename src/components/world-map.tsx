"use client";

import { useState, useTransition } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { toggleCountry } from "@/app/(protected)/dashboard/actions";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  visitedCodes: string[];
}

export function WorldMap({ visitedCodes }: WorldMapProps) {
  const [visited, setVisited] = useState<Set<string>>(new Set(visitedCodes));
  const [isPending, startTransition] = useTransition();

  function handleClick(countryCode: string) {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(countryCode)) {
        next.delete(countryCode);
      } else {
        next.add(countryCode);
      }
      return next;
    });
    startTransition(() => toggleCountry(countryCode));
  }

  return (
    <div className="w-full rounded-xl border bg-card overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 147 }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo) => {
              const code = geo.id;
              const isVisited = visited.has(code);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleClick(code)}
                  style={{
                    default: {
                      fill: isVisited ? "#22c55e" : "#d1d5db",
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    hover: {
                      fill: isVisited ? "#16a34a" : "#9ca3af",
                      stroke: "#ffffff",
                      strokeWidth: 0.5,
                      outline: "none",
                      cursor: "pointer",
                    },
                    pressed: {
                      fill: isVisited ? "#15803d" : "#6b7280",
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <div className="px-4 py-3 border-t text-sm text-muted-foreground flex items-center justify-between">
        <span>Click a country to mark it as visited</span>
        <span className="font-medium text-foreground">
          {visited.size} {visited.size === 1 ? "country" : "countries"} visited
        </span>
      </div>
      {isPending && (
        <div className="absolute inset-0 pointer-events-none opacity-0" />
      )}
    </div>
  );
}
