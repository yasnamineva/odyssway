"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

export interface SearchableSelectGroup {
  /** Omit for a flat top-level option shown before any labeled groups (e.g. "Schengen Area, unspecified"). */
  label?: string;
  options: SearchableSelectOption[];
}

/**
 * A typeahead combobox over a grouped option list — same data shape as a
 * native `<select>` + `<optgroup>`, but lets the user type the country name
 * instead of scrolling a long list. Native `<select>` only jumps to options
 * matching a type-ahead buffer; it doesn't show a filtered list, which is
 * what actually makes a 50+ option list usable.
 */
export default function SearchableSelect({
  id,
  value,
  onChange,
  groups,
  placeholder,
  noResultsLabel,
  "data-testid": testId,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  groups: SearchableSelectGroup[];
  placeholder: string;
  noResultsLabel: string;
  "data-testid"?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = `${id}-listbox`;

  const flatOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedLabel = flatOptions.find((o) => o.value === value)?.label ?? "";

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, options: g.options.filter((o) => o.label.toLowerCase().includes(q)) }))
      .filter((g) => g.options.length > 0);
  }, [groups, query]);
  const filteredFlat = useMemo(() => filteredGroups.flatMap((g) => g.options), [filteredGroups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  function commit(optValue: string) {
    onChange(optValue);
    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredFlat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filteredFlat[activeIndex];
      if (opt) commit(opt.value);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  }

  const activeOption = filteredFlat[activeIndex];

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        data-testid={testId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && activeOption ? `${id}-opt-${activeOption.value}` : undefined}
        autoComplete="off"
        className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        placeholder={placeholder}
        value={open ? query : selectedLabel}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onClick={() => {
          // The input stays focused after commit() picks an option (its
          // onMouseDown prevents the blur that would otherwise happen), so a
          // second click doesn't re-fire onFocus — without this, there was
          // no way to reopen the list and change a selection once made.
          if (!open) {
            setOpen(true);
            setQuery("");
          }
        }}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setOpen(false);
          setQuery("");
        }}
      />
      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filteredGroups.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-400">{noResultsLabel}</li>
          )}
          {filteredGroups.map((group, gi) => (
            <li key={group.label ?? `group-${gi}`}>
              {group.label && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
                  {group.label}
                </div>
              )}
              <ul role="group" aria-label={group.label}>
                {group.options.map((opt) => {
                  const flatIndex = filteredFlat.indexOf(opt);
                  const active = flatIndex === activeIndex;
                  return (
                    <li
                      key={opt.value}
                      id={`${id}-opt-${opt.value}`}
                      role="option"
                      aria-selected={opt.value === value}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => commit(opt.value)}
                      className={`cursor-pointer px-3 py-1.5 text-sm ${
                        active ? "bg-blue-50 text-blue-900" : "text-slate-700"
                      } ${opt.value === value ? "font-medium" : ""}`}
                    >
                      {opt.label}
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
