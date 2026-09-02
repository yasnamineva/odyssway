/** Minimal stroke-icon set (24x24, currentColor) — no icon library dependency. */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function CompassIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CalendarClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <circle cx="15.5" cy="15" r="3.25" />
      <path d="M15.5 13.5V15l1 .75" />
    </svg>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5l7 2.7v5.3c0 4.4-2.9 7.8-7 9-4.1-1.2-7-4.6-7-9V6.2z" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

export function ScaleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3v18M8 21h8" />
      <path d="M5 7h6M13 7h6" />
      <path d="M5 7l-2.5 5a2.5 2.5 0 005 0zM19 7l-2.5 5a2.5 2.5 0 005 0z" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

export function MapPinRouteIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="6" cy="7" r="2.25" />
      <circle cx="18" cy="17" r="2.25" />
      <path d="M8 8.2c3 1.4 3.5 3 3.5 4.3 0 2 1.7 2.7 4.7 2.9" strokeDasharray="2.5 2.5" />
    </svg>
  );
}
