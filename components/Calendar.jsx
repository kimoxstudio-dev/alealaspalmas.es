"use client";
import { useEffect, useState } from "react";
import { useI18n } from "./I18n";
import { ALEA_DATA } from "@/lib/data";

const MONTHS_ES = {
  ENE: 0, FEB: 1, MAR: 2, ABR: 3, MAY: 4, JUN: 5,
  JUL: 6, AGO: 7, SEP: 8, OCT: 9, NOV: 10, DIC: 11,
};
const MONTH_NAMES = {
  es: ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
};
const WEEKDAYS = {
  es: ["L","M","X","J","V","S","D"],
  en: ["M","T","W","T","F","S","S"],
};

function parseDate(str) {
  if (!str) return null;
  const s = str.toUpperCase().replace(/\./g, "");
  const range = s.match(/^(\d{1,2})\s*[–-]\s*(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/);
  if (range) {
    const [, d1, d2, mon, year] = range;
    const m = MONTHS_ES[mon];
    if (m !== undefined) return { kind: "range", year: +year, month: m, dayStart: +d1, dayEnd: +d2 };
  }
  const single = s.match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/);
  if (single) {
    const [, d, mon, year] = single;
    const m = MONTHS_ES[mon];
    if (m !== undefined) return { kind: "single", year: +year, month: m, day: +d };
  }
  if (/CADA\s+VIERNES|TODOS\s+LOS\s+VIERNES|CASI\s+TODOS\s+LOS\s+VIERNES|EVERY\s+FRIDAY/.test(s))
    return { kind: "weekly", weekday: 4 };
  if (/CADA\s+S[ÁA]BADO|EVERY\s+SATURDAY/.test(s)) return { kind: "weekly", weekday: 5 };
  if (/QUINCENAL|BI-?WEEKLY/.test(s)) return { kind: "biweekly", weekday: 4 };
  const yearOnly = s.match(/^(?:TODO|ALL)\s+(\d{4})$/);
  if (yearOnly) return { kind: "year", year: +yearOnly[1] };
  return null;
}

function occurrencesIn(ev, year, month) {
  const parsed = ev.__parsed || (ev.__parsed = parseDate(ev.dateES));
  if (!parsed) return [];
  if (parsed.kind === "single") {
    return parsed.year === year && parsed.month === month ? [parsed.day] : [];
  }
  if (parsed.kind === "range") {
    if (parsed.year !== year || parsed.month !== month) return [];
    const arr = [];
    for (let d = parsed.dayStart; d <= parsed.dayEnd; d++) arr.push(d);
    return arr;
  }
  if (parsed.kind === "weekly" || parsed.kind === "biweekly") {
    const days = [];
    const lastDay = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let d = 1; d <= lastDay; d++) {
      const iso = (new Date(year, month, d).getDay() + 6) % 7;
      if (iso === parsed.weekday) {
        if (parsed.kind === "biweekly") {
          if (count % 2 === 0) days.push(d);
          count++;
        } else days.push(d);
      }
    }
    return days;
  }
  if (parsed.kind === "year") {
    return parsed.year === year ? "year" : [];
  }
  return [];
}

function CalEventRow({ ev, day, onOpen }) {
  const { lang, t } = useI18n();
  const tone = ev.tone || "warm";
  const isPast = ev.__kind === "past";
  return (
    <li>
      <button className={`cal-evrow cal-tone-${tone}`} onClick={() => onOpen(ev)}>
        <span className="cal-evrow-day">
          {day !== undefined ? day : "•"}
        </span>
        <span className="cal-evrow-body">
          <span className="cal-evrow-title">{lang === "es" ? ev.titleES : (ev.titleEN || ev.titleES)}</span>
          <span className="cal-evrow-meta">
            <span className={`cal-evrow-tag ${isPast ? "past" : ""}`}>{isPast ? t("cal.past") : t("cal.upcoming")}</span>
            <span>{lang === "es" ? ev.dateES : (ev.dateEN || ev.dateES)}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function CalendarView({ onOpenEvent }) {
  const { t, lang } = useI18n();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { setSelectedDay(null); }, [year, month]);

  const all = [
    ...ALEA_DATA.upcoming.map((e) => ({ ...e, __kind: "upcoming" })),
    ...ALEA_DATA.past.map((e) => ({ ...e, __kind: "past", tone: e.tone || "warm" })),
  ];

  const yearLong = all.filter((e) => {
    const p = parseDate(e.dateES);
    return p && p.kind === "year" && p.year === year;
  });

  const byDay = {};
  all.forEach((e) => {
    const days = occurrencesIn(e, year, month);
    if (days === "year") return;
    days.forEach((d) => {
      (byDay[d] = byDay[d] || []).push(e);
    });
  });

  const firstOfMonth = new Date(year, month, 1);
  const firstIso = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - firstIso + 1;
    if (dayNum < 1) {
      cells.push({ day: prevMonthDays + dayNum, otherMonth: true });
    } else if (dayNum > daysInMonth) {
      cells.push({ day: dayNum - daysInMonth, otherMonth: true });
    } else {
      cells.push({ day: dayNum, otherMonth: false });
    }
  }
  const lastRowStart = 35;
  const lastRowAllOther = cells.slice(lastRowStart).every((c) => c.otherMonth);
  const visibleCells = lastRowAllOther ? cells.slice(0, 35) : cells;

  const isToday = (cell) =>
    !cell.otherMonth && year === today.getFullYear() && month === today.getMonth() && cell.day === today.getDate();

  const go = (deltaM) => {
    let m = month + deltaM;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setYear(y); setMonth(m);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const selectedEvents = selectedDay ? (byDay[selectedDay] || []) : [];

  const monthList = Object.entries(byDay)
    .map(([d, evs]) => ({ day: +d, evs }))
    .sort((a, b) => a.day - b.day);

  const monthIsEmpty = monthList.length === 0 && yearLong.length === 0;

  return (
    <div className="cal-wrap">
      <header className="cal-head">
        <div>
          <span className="cal-eyebrow">{t("cal.title")}</span>
          <h2 className="cal-month-title">
            <span>{MONTH_NAMES[lang][month]}</span>
            <span className="cal-year">{year}</span>
          </h2>
          <p className="cal-sub">{t("cal.subtitle")}</p>
        </div>
        <div className="cal-nav">
          <button onClick={() => go(-1)} aria-label={t("cal.prev")}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M15 4 L 7 12 L 15 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="cal-nav-today" onClick={goToday}>{t("cal.today")}</button>
          <button onClick={() => go(1)} aria-label={t("cal.next")}>
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 4 L 17 12 L 9 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </header>

      {yearLong.length > 0 && (
        <div className="cal-yearlong" role="list">
          {yearLong.map((e) => (
            <button key={e.id} className={`cal-yearlong-chip cal-tone-${e.tone || "warm"}`} onClick={() => onOpenEvent(e)} role="listitem">
              <span className="cal-yearlong-dot" />
              <span>{lang === "es" ? e.titleES : (e.titleEN || e.titleES)}</span>
              <em>{lang === "es" ? e.dateES : (e.dateEN || e.dateES)}</em>
            </button>
          ))}
        </div>
      )}

      <div className="cal-body">
        <div className="cal-grid-wrap">
          <div className="cal-weekdays" aria-hidden>
            {WEEKDAYS[lang].map((w, i) => <span key={i}>{w}</span>)}
          </div>
          <div className="cal-grid">
            {visibleCells.map((cell, i) => {
              const evs = cell.otherMonth ? [] : (byDay[cell.day] || []);
              const tones = [...new Set(evs.map((e) => e.tone || "warm"))].slice(0, 4);
              const selected = !cell.otherMonth && selectedDay === cell.day;
              return (
                <button
                  key={i}
                  className={`cal-cell ${cell.otherMonth ? "other" : ""} ${isToday(cell) ? "today" : ""} ${selected ? "selected" : ""} ${evs.length > 0 ? "has-events" : ""}`}
                  onClick={() => !cell.otherMonth && setSelectedDay(cell.day)}
                  disabled={cell.otherMonth}
                  aria-label={cell.otherMonth ? "" : `Día ${cell.day}, ${evs.length} evento${evs.length === 1 ? "" : "s"}`}
                >
                  <span className="cal-cell-num">{cell.day}</span>
                  {evs.length > 0 && (
                    <span className="cal-cell-dots">
                      {tones.map((tn, j) => (
                        <span key={j} className={`cal-dot cal-tone-${tn}`} />
                      ))}
                      {evs.length > tones.length && (
                        <span className="cal-cell-more">+{evs.length - tones.length}</span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="cal-legend" aria-label={t("cal.legend")}>
            <span><span className="cal-dot cal-tone-warm" /> Wargame</span>
            <span><span className="cal-dot cal-tone-amber" /> {lang === "es" ? "Recurrente" : "Recurring"}</span>
            <span><span className="cal-dot cal-tone-ruby" /> Rol</span>
            <span><span className="cal-dot cal-tone-olive" /> {lang === "es" ? "Cultural" : "Cultural"}</span>
          </div>
        </div>

        <aside className="cal-side">
          {selectedDay ? (
            <>
              <h3 className="cal-side-title">
                <strong>{selectedDay}</strong>
                <span>{MONTH_NAMES[lang][month]} {year}</span>
              </h3>
              {selectedEvents.length === 0 ? (
                <p className="cal-side-empty">{t("cal.empty")}</p>
              ) : (
                <ul className="cal-event-list">
                  {selectedEvents.map((e) => <CalEventRow key={e.id + "-" + selectedDay} ev={e} onOpen={onOpenEvent} />)}
                </ul>
              )}
            </>
          ) : (
            <>
              <h3 className="cal-side-title">
                <strong>{MONTH_NAMES[lang][month]}</strong>
                <span>{year}</span>
              </h3>
              {monthIsEmpty ? (
                <p className="cal-side-empty">{t("cal.emptyMonth")}</p>
              ) : (
                <ul className="cal-event-list">
                  {monthList.flatMap(({ day, evs }) =>
                    evs.map((e) => (
                      <CalEventRow key={e.id + "-" + day} ev={e} day={day} onOpen={onOpenEvent} />
                    ))
                  ).slice(0, 12)}
                </ul>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
