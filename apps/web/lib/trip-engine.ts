/**
 * Everything Trip Check needs that carries the full rule corpus (~2.8 MB of
 * JSON, schema-validated on load). Trip Check imports this dynamically after
 * its first render, so the page paints and becomes usable before the data is
 * parsed. Answers are still computed entirely in the browser (AGENTS.md §10).
 */
export { customsItems } from "./destinations";
export { resolveItem, resolveTripCheck } from "./trip-check";
