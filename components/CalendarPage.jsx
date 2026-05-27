"use client";
import { useCallback, useEffect, useState } from "react";
import { I18nProvider, useI18n, LangToggle } from "./I18n";
import { CustomCursor } from "./Shared";
import { EventModal, useEventHash } from "./EventModal";
import { CalendarView } from "./Calendar";
import { ALEA_DATA } from "@/lib/data";

function CalPageNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="mod-nav cal-page-nav">
      <a href="/" className="mod-logo" data-egg-tap title="Alea Las Palmas">
        <img src={ALEA_DATA.logoUrl} alt="Alea" width="40" height="40" />
        <span>
          <strong>ALEA</strong>
          <em>Las Palmas</em>
        </span>
      </a>
      <nav className={`mod-nav-links cal-page-nav-links ${open ? "open" : ""}`} aria-hidden={!open}>
        <LangToggle className="alea-lang-toggle-in-menu" />
        <a href="/#about" onClick={close}>{t("nav.about")}</a>
        <a href="/#events" onClick={close}>{t("nav.events")}</a>
        <a href="/#culture" onClick={close}>{t("nav.culture")}</a>
        <a href="/#partners" onClick={close}>{t("nav.partners")}</a>
        <a href="/#contact" onClick={close}>{t("nav.contact")}</a>
      </nav>
      <a className="mod-cta" href={ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">{t("cta.join")} →</a>
      <button className={`mod-burger ${open ? "open" : ""}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span /><span /><span />
      </button>
    </header>
  );
}

function CalPageFooter() {
  const { t } = useI18n();
  return (
    <footer className="cal-page-foot">
      <a href="/" className="cal-page-back">← {t("nav.about")}</a>
      <span>{t("footer.rights")}</span>
    </footer>
  );
}

function CalendarPageInner() {
  const findEvent = useCallback((id) => {
    if (!id) return null;
    return (
      ALEA_DATA.upcoming.find((e) => e.id === id) ||
      ALEA_DATA.past.find((e) => e.id === id) ||
      null
    );
  }, []);
  const { openEvent, openEv, closeEv } = useEventHash(findEvent);

  return (
    <>
      <CustomCursor variant="die" color="#e6c281" />
      <LangToggle />
      <div className="modern-root cal-page-root">
        <CalPageNav />
        <main className="cal-page-main">
          <CalendarView onOpenEvent={openEv} />
        </main>
        <CalPageFooter />
        <EventModal event={openEvent} onClose={closeEv} />
      </div>
    </>
  );
}

export default function CalendarPage() {
  return (
    <I18nProvider>
      <CalendarPageInner />
    </I18nProvider>
  );
}
