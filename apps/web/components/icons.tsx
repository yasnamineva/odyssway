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

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  );
}

export function FingerprintIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M6.5 7.5A7 7 0 0118.8 10" />
      <path d="M5 12a7 7 0 01.6-2.8M19 13.5c0 2.3-.4 4.3-1.2 6" />
      <path d="M8.5 19.5c-.7-1.6-1-3.5-1-5.5a4.5 4.5 0 019 0c0 1.3-.1 2.6-.4 3.8" />
      <path d="M12 14c0 2.6.5 4.6 1.4 6.2M11.2 20.5c-.8-1.7-1.2-3.8-1.2-6.5a2 2 0 014 0" />
    </svg>
  );
}

export function FaceScanIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16" />
      <circle cx="12" cy="10.5" r="2.75" />
      <path d="M7.5 17c.9-1.8 2.5-2.75 4.5-2.75s3.6.95 4.5 2.75" />
    </svg>
  );
}

export function PassportIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <circle cx="12" cy="10" r="3" />
      <path d="M9 10h6M12 7c.9.8 1.3 1.8 1.3 3s-.4 2.2-1.3 3M9 17h6" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 4l9 15.5H3z" />
      <path d="M12 10v4M12 16.8v.2" />
    </svg>
  );
}

export function LetterIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function GateIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20V6.5A1.5 1.5 0 015.5 5h3A1.5 1.5 0 0110 6.5V20M14 20V6.5A1.5 1.5 0 0115.5 5h3A1.5 1.5 0 0120 6.5V20M2.5 20h19" />
      <path d="M10 12h4" strokeDasharray="1.5 1.5" />
      <path d="M7 9v1.5M17 9v1.5" />
    </svg>
  );
}

export function InfoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </svg>
  );
}

export function DocumentSearchIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M13.5 3.5H7A1.5 1.5 0 005.5 5v14A1.5 1.5 0 007 20.5h4" />
      <path d="M13.5 3.5L18.5 8.5V11M13.5 3.5v5h5" />
      <circle cx="16" cy="16" r="2.75" />
      <path d="M18 18l2.5 2.5" />
    </svg>
  );
}

export function UndoIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 010 11H11" />
    </svg>
  );
}
