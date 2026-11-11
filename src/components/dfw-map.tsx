import { cn } from "@/lib/utils";

type City = {
  name: string;
  x: number;
  y: number;
  major?: boolean;
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
};

/** Approximate relative positions (projected from latitude/longitude). */
const CITIES: City[] = [
  { name: "Fort Worth", x: 75, y: 340, major: true, dx: 0, dy: -26, anchor: "middle" },
  { name: "Dallas", x: 412, y: 327, major: true, dx: 17, dy: 6, anchor: "start" },
  { name: "Arlington", x: 216, y: 353, dx: -10, dy: 4, anchor: "end" },
  { name: "Irving", x: 316, y: 304, dx: 9, dy: -7, anchor: "start" },
  { name: "Grand Prairie", x: 286, y: 346, dx: 0, dy: 21, anchor: "middle" },
  { name: "Plano", x: 474, y: 175, dx: 10, dy: 4, anchor: "start" },
  { name: "Frisco", x: 396, y: 93, dx: 10, dy: 4, anchor: "start" },
  { name: "McKinney", x: 512, y: 64, dx: 10, dy: 4, anchor: "start" },
  { name: "Denton", x: 200, y: 53, dx: 10, dy: 4, anchor: "start" },
  { name: "Garland", x: 512, y: 242, dx: 10, dy: 4, anchor: "start" },
  { name: "Richardson", x: 455, y: 220, dx: -10, dy: 4, anchor: "end" },
  { name: "Carrollton", x: 354, y: 203, dx: -10, dy: 4, anchor: "end" },
  { name: "Lewisville", x: 288, y: 159, dx: -10, dy: 4, anchor: "end" },
  { name: "Mesquite", x: 537, y: 333, dx: 0, dy: 21, anchor: "middle" },
  { name: "Allen", x: 492, y: 123, dx: 10, dy: 4, anchor: "start" },
  { name: "Southlake", x: 200, y: 224, dx: -10, dy: 4, anchor: "end" },
  { name: "Mansfield", x: 195, y: 460, dx: 10, dy: 4, anchor: "start" },
];

const ROADS = [
  "M20 338 L75 340 L150 343 L216 345 L286 343 L350 335 L412 327 L470 330 L537 333 L590 336", // I-30
  "M20 398 L130 400 L216 402 L300 404 L412 404 L500 400 L590 396", // I-20
  "M75 340 L95 280 L120 200 L160 120 L200 53 L212 10", // I-35W
  "M412 327 L385 265 L354 203 L320 180 L288 159 L245 110 L200 53", // I-35E north
  "M412 327 L405 404 L398 490", // I-35E south
  "M412 327 L440 270 L455 220 L474 175 L492 123 L512 64 L522 10", // US-75
  "M270 255 L330 240 L412 225 L480 240 L520 285 L537 333", // I-635
];

export function DfwMap({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 500"
      role="img"
      aria-labelledby="dfw-map-title dfw-map-desc"
      className={cn("h-auto w-full", className)}
    >
      <title id="dfw-map-title">Dallas–Fort Worth service area</title>
      <desc id="dfw-map-desc">
        Approximate map of the Dallas–Fort Worth area showing Dallas, Fort Worth, and surrounding communities including
        Arlington, Irving, Grand Prairie, Plano, Frisco, McKinney, Denton, Garland, Richardson, and Mesquite.
      </desc>
      <defs>
        <pattern id="dfw-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#526B7B" strokeOpacity="0.09" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="600" height="500" fill="#F6F5F1" />
      <rect width="600" height="500" fill="url(#dfw-grid)" />
      <path
        d="M38 300 C 38 120, 200 22, 330 30 C 470 38, 590 62, 586 230 C 582 400, 470 482, 300 482 C 140 482, 38 440, 38 300 Z"
        fill="#172B3A"
        fillOpacity="0.035"
        stroke="#172B3A"
        strokeOpacity="0.14"
        strokeDasharray="4 7"
      />

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {ROADS.map((d) => (
          <path key={`casing-${d}`} d={d} stroke="#FFFFFF" strokeWidth="7" />
        ))}
        <ellipse cx="75" cy="340" rx="44" ry="40" stroke="#FFFFFF" strokeWidth="7" />
        {ROADS.map((d) => (
          <path key={`road-${d}`} d={d} stroke="#C5CFD6" strokeWidth="3" />
        ))}
        <ellipse cx="75" cy="340" rx="44" ry="40" stroke="#C5CFD6" strokeWidth="3" />
      </g>

      <g transform="translate(259 250)">
        <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#526B7B" />
        <path d="M-4 2 L0 -4.5 L4 2 M0 -4.5 V4.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <text
          y="25"
          textAnchor="middle"
          paintOrder="stroke"
          stroke="#F6F5F1"
          strokeWidth="4"
          strokeLinejoin="round"
          className="fill-steel text-[11px] font-medium"
        >
          DFW Airport
        </text>
      </g>

      {CITIES.map((city) => (
        <g key={city.name}>
          {city.major ? (
            <>
              <circle cx={city.x} cy={city.y} r="17" fill="#C58A4A" fillOpacity="0.25" />
              <circle cx={city.x} cy={city.y} r="8" fill="#172B3A" stroke="#FFFFFF" strokeWidth="2.5" />
            </>
          ) : (
            <circle cx={city.x} cy={city.y} r="4.5" fill="#526B7B" stroke="#FFFFFF" strokeWidth="2" />
          )}
          <text
            x={city.x + city.dx}
            y={city.y + city.dy}
            textAnchor={city.anchor}
            paintOrder="stroke"
            stroke="#F6F5F1"
            strokeWidth="5"
            strokeLinejoin="round"
            className={
              city.major ? "fill-navy font-display text-[18px] font-extrabold" : "fill-charcoal text-[12.5px] font-semibold"
            }
          >
            {city.name}
          </text>
        </g>
      ))}

      <g transform="translate(560 452)">
        <circle r="17" fill="#FFFFFF" stroke="#E8EAEB" strokeWidth="1.5" />
        <path d="M0 -10 L5.5 5 L0 1.5 L-5.5 5 Z" fill="#172B3A" />
        <text y="-23" textAnchor="middle" className="fill-steel text-[11px] font-bold">
          N
        </text>
      </g>
    </svg>
  );
}
