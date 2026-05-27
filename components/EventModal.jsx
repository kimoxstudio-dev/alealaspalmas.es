"use client";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "./I18n";
import { ALEA_DATA } from "@/lib/data";

export function EventModal({ event, onClose }) {
  const { t, lang } = useI18n();

  useEffect(() => {
    if (!event) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [event, onClose]);

  if (!event) return null;

  const ev = event;
  const title = lang === "es" ? ev.titleES : (ev.titleEN || ev.titleES);
  const tag = lang === "es" ? ev.tagES : (ev.tagEN || ev.tagES);
  const dateLong = lang === "es" ? (ev.dateLongES || ev.dateES) : (ev.dateLongEN || ev.dateEN || ev.dateES);
  const time = lang === "es" ? ev.time : (ev.timeEN || ev.time);
  const players = lang === "es" ? ev.playersES : (ev.playersEN || ev.playersES);
  const price = lang === "es" ? ev.priceES : (ev.priceEN || ev.priceES);
  const organizer = lang === "es" ? ev.organizerES : (ev.organizerEN || ev.organizerES);
  const blurb = lang === "es" ? ev.blurbES : (ev.blurbEN || ev.blurbES);
  const full = (lang === "es" ? ev.fullES : (ev.fullEN || ev.fullES)) || [blurb];
  const bullets = (lang === "es" ? ev.bulletsES : (ev.bulletsEN || ev.bulletsES)) || [];
  const tone = ev.tone || "warm";

  const share = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}#event=${ev.id}`;
    const textShare = `${title} — Alea Las Palmas`;
    if (navigator.share) {
      try { await navigator.share({ title, text: textShare, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(url);
      window.alert(lang === "es" ? "Enlace copiado al portapapeles" : "Link copied to clipboard");
    } catch {}
  };

  return (
    <div className={`mod-modal-backdrop mod-modal-${tone}`} onClick={onClose}>
      <div className="mod-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <button className="mod-modal-close" onClick={onClose} aria-label={t("modal.close")}>
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6 L 18 18 M18 6 L 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div className="mod-modal-hero">
          <img src={ev.img} alt={title} />
          <div className="mod-modal-hero-overlay">
            <span className="mod-modal-tag">{tag}</span>
            <h2 id="modal-title">{title}</h2>
            <p className="mod-modal-blurb">{blurb}</p>
          </div>
        </div>
        <div className="mod-modal-body">
          <div className="mod-modal-grid">
            <div className="mod-modal-meta">
              <div className="mod-modal-meta-row">
                <span className="mod-modal-meta-label">{t("modal.when")}</span>
                <span className="mod-modal-meta-value">{dateLong}<br/><em>{time}</em></span>
              </div>
              <div className="mod-modal-meta-row">
                <span className="mod-modal-meta-label">{t("modal.where")}</span>
                <span className="mod-modal-meta-value">
                  <a href={ALEA_DATA.mapsUrl} target="_blank" rel="noopener noreferrer">{ALEA_DATA.address}</a>
                </span>
              </div>
              <div className="mod-modal-meta-row">
                <span className="mod-modal-meta-label">{t("modal.who")}</span>
                <span className="mod-modal-meta-value">{players}</span>
              </div>
              {price && (
                <div className="mod-modal-meta-row">
                  <span className="mod-modal-meta-label">{t("modal.price")}</span>
                  <span className="mod-modal-meta-value">{price}</span>
                </div>
              )}
              {organizer && (
                <div className="mod-modal-meta-row">
                  <span className="mod-modal-meta-label">{t("modal.organizer")}</span>
                  <span className="mod-modal-meta-value">{organizer}</span>
                </div>
              )}
            </div>
            <div className="mod-modal-content">
              <h3>{t("modal.what")}</h3>
              {full.map((p, i) => <p key={i}>{p}</p>)}
              {bullets.length > 0 && (
                <>
                  <h4>{t("modal.bullets")}</h4>
                  <ul className="mod-modal-bullets">
                    {bullets.map((b, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,3 21,8 21,16 12,21 3,16 3,8" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          {!ev.isPast && (
            <div className="mod-modal-actions">
              <a className="mod-btn mod-btn-primary mod-btn-lg" href={ev.link || ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">
                {t("modal.signup")} →
              </a>
              <a className="mod-btn mod-btn-ghost" href={ALEA_DATA.mapsUrl} target="_blank" rel="noopener noreferrer">
                {t("modal.directions")}
              </a>
              <button className="mod-btn mod-btn-ghost" onClick={share}>
                {t("modal.share")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function useEventHash(findEvent) {
  const [openEvent, setOpenEvent] = useState(null);

  const openEv = useCallback((ev) => {
    if (!ev) return;
    setOpenEvent(ev);
    if (window.location.hash !== `#event=${ev.id}`) {
      history.pushState({ event: ev.id }, "", `#event=${ev.id}`);
    }
  }, []);

  const closeEv = useCallback(() => {
    setOpenEvent(null);
    if (window.location.hash.startsWith("#event=")) {
      history.pushState({}, "", window.location.pathname + window.location.search);
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      const m = window.location.hash.match(/^#event=(.+)$/);
      if (m) {
        const ev = findEvent(decodeURIComponent(m[1]));
        if (ev) setOpenEvent((cur) => (cur && cur.id === ev.id ? cur : ev));
        else setOpenEvent(null);
      } else {
        setOpenEvent(null);
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, [findEvent]);

  return { openEvent, openEv, closeEv };
}
