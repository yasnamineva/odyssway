/** Plausible's custom-event function, present only when the script is loaded
 * (NEXT_PUBLIC_PLAUSIBLE_DOMAIN set — see app/layout.tsx). */
interface Window {
  plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
}
