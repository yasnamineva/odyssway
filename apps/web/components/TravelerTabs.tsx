"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Calculator from "./Calculator";

const BASE_STORAGE_KEY = "odyssway.calculator.v1";

interface Traveler {
  id: number;
  name: string;
}

let nextTravelerId = 2; // id 1 is the default/first traveler, reserved below

/**
 * Wraps Calculator to support more than one traveler — each gets a fully
 * independent day count (own trips, own localStorage slot), useful when
 * travelling with someone whose passport or residence-permit basis differs
 * from yours. Only one Calculator is ever mounted at a time (switching tabs
 * unmounts the inactive one) so the DOM for the common single-traveler case
 * is identical to before this existed, and unsaved-but-unmounted state is
 * simply lost on tab switch unless "remember on this device" is on —
 * the same tradeoff the single calculator already makes for a page reload.
 */
export default function TravelerTabs() {
  const t = useTranslations("calc.travelers");
  const [travelers, setTravelers] = useState<Traveler[]>([
    { id: 1, name: t("defaultName", { n: 1 }) },
  ]);
  const [activeId, setActiveId] = useState(1);

  const storageKeyFor = (id: number) =>
    id === 1 ? BASE_STORAGE_KEY : `${BASE_STORAGE_KEY}.${id}`;

  function addTraveler() {
    const id = nextTravelerId++;
    setTravelers((ts) => [...ts, { id, name: t("defaultName", { n: ts.length + 1 }) }]);
    setActiveId(id);
  }

  function removeTraveler(id: number) {
    setTravelers((ts) => {
      const next = ts.filter((tr) => tr.id !== id);
      if (activeId === id && next.length > 0) setActiveId(next[0]!.id);
      return next;
    });
    try {
      localStorage.removeItem(storageKeyFor(id));
    } catch {
      // best-effort cleanup
    }
  }

  function renameTraveler(id: number, name: string) {
    setTravelers((ts) => ts.map((tr) => (tr.id === id ? { ...tr, name } : tr)));
  }

  return (
    <div className="space-y-4">
      {travelers.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {travelers.map((tr) => (
            <div key={tr.id} className="flex items-center">
              <button
                type="button"
                onClick={() => setActiveId(tr.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeId === tr.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tr.name}
              </button>
              {activeId === tr.id && (
                <button
                  type="button"
                  aria-label={t("removeTraveler")}
                  onClick={() => removeTraveler(tr.id)}
                  className="ml-0.5 rounded-full px-1.5 py-1 text-slate-300 hover:text-red-500"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {travelers.length > 1 && (
        <div>
          <label className="block text-xs font-medium text-slate-500" htmlFor="traveler-name">
            {t("renameLabel")}
          </label>
          <input
            id="traveler-name"
            type="text"
            value={travelers.find((tr) => tr.id === activeId)?.name ?? ""}
            onChange={(e) => renameTraveler(activeId, e.target.value)}
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <p className="mt-1 text-xs text-slate-500">{t("note")}</p>
        </div>
      )}

      <Calculator key={activeId} storageKey={storageKeyFor(activeId)} />

      <div>
        <button
          type="button"
          onClick={addTraveler}
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        >
          {t("addTraveler")}
        </button>
      </div>
    </div>
  );
}
