"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n, LangToggle } from "./I18n";
import { ALEA_DATA } from "@/lib/data";
import {
  MarqueeRow, Reveal, D20, CustomCursor,
  EasterEgg, DiceRain, MeepleHunt, MeepleEgg,
  useShake, useTapCount,
} from "./Shared";
import { EventModal, useEventHash } from "./EventModal";

function ModernHexGrid() {
  const cols = 14, rows = 10;
  const size = 60;
  const hexs = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * size * 1.5;
      const y = r * size * 1.732 + (c % 2 ? size * 0.866 : 0);
      // Determinístico para evitar hydration mismatch.
      const seed = (r * cols + c);
      const delay = (seed * 13) % 80 / 10;
      const dur = 6 + ((seed * 7) % 60) / 10;
      hexs.push({ x, y, delay, dur });
    }
  }
  const hexPath = `M 30 0 L 60 17.3 L 60 51.9 L 30 69.3 L 0 51.9 L 0 17.3 Z`;
  return (
    <svg className="mod-hex-bg" viewBox={`0 0 ${cols * size * 1.5} ${rows * size * 1.732}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="mod-hex-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d4f8b" stopOpacity="0.0"/>
          <stop offset="50%" stopColor="#c8a25b" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#7a1f1f" stopOpacity="0.0"/>
        </linearGradient>
      </defs>
      {hexs.map((h, i) => (
        <g key={i} transform={`translate(${h.x}, ${h.y})`}>
          <path d={hexPath} fill="none" stroke="rgba(200,162,91,0.15)" strokeWidth="1"/>
          <path d={hexPath} fill="url(#mod-hex-g)" opacity="0">
            <animate attributeName="opacity" values="0;0.35;0" dur={`${h.dur}s`} begin={`${h.delay}s`} repeatCount="indefinite"/>
          </path>
        </g>
      ))}
    </svg>
  );
}

function ModernNav() {
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
    <header className="mod-nav">
      <a href="#top" className="mod-logo" data-egg-tap title="Alea Las Palmas">
        <img src={ALEA_DATA.logoUrl} alt="Alea" width="40" height="40" />
        <span>
          <strong>ALEA</strong>
          <em>Las Palmas</em>
        </span>
      </a>
      <nav className={`mod-nav-links ${open ? "open" : ""}`} aria-hidden={!open}>
        <LangToggle className="alea-lang-toggle-in-menu" />
        <a href="#about" onClick={close}>{t("nav.about")}</a>
        <a href="#events" onClick={close}>{t("nav.events")}</a>
        <a href="#culture" onClick={close}>{t("nav.culture")}</a>
        <a href="#partners" onClick={close}>{t("nav.partners")}</a>
        <a href="#contact" onClick={close}>{t("nav.contact")}</a>
      </nav>
      <a className="mod-cta" href={ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">{t("cta.join")} →</a>
      <button className={`mod-burger ${open ? "open" : ""}`} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span /><span /><span />
      </button>
    </header>
  );
}

function ModernHero({ onPick }) {
  const { t, lang } = useI18n();
  const [face, setFace] = useState(20);
  const [rolling, setRolling] = useState(false);
  const [pick, setPick] = useState(null);
  const [nat20, setNat20] = useState(false);

  const roll = () => {
    if (rolling) return;
    setRolling(true); setPick(null); setNat20(false);
    const start = Date.now();
    const dur = 1400;
    const tick = () => {
      const dt = Date.now() - start;
      setFace(1 + Math.floor(Math.random() * 20));
      if (dt < dur) requestAnimationFrame(tick);
      else {
        const result = 1 + Math.floor(Math.random() * 20);
        setFace(result);
        if (result === 20) {
          setNat20(true);
          setPick(null);
          window.dispatchEvent(new CustomEvent("alea:nat20"));
        } else {
          const evs = ALEA_DATA.upcoming;
          const idx = (result - 1) % evs.length;
          setPick(evs[idx]);
        }
        setRolling(false);
      }
    };
    tick();
  };

  return (
    <section className="mod-hero" id="top">
      <img className="mod-hero-bg-img" src={ALEA_DATA.heroBg} alt="" aria-hidden />
      <div className="mod-hero-grid">
        <div className="mod-hero-left">
          <span className="mod-eyebrow">
            <span className="mod-dot" /> {t("hero.tagline")} · {t("hero.location")}
          </span>
          <h1 className="mod-hero-title">
            <span className="mod-glow">{t("hero.title.a")}</span>, {t("hero.title.b")},<br/>
            <span className="mod-outline">{t("hero.title.c")}</span>
          </h1>
          <p className="mod-hero-sub">{t("hero.subtitle")}</p>
          <div className="mod-hero-badges">
            <span className="mod-badge mod-badge-live">
              <span className="mod-dot" />
              {t("hero.badge.open")}
            </span>
            <span className="mod-badge">{t("hero.badge.fee")}</span>
          </div>
          <div className="mod-hero-cta">
            <a className="mod-btn mod-btn-primary" href={ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">{t("cta.join")}</a>
            <a className="mod-btn mod-btn-ghost" href="#events">{t("cta.discover")}</a>
          </div>
          <div className="mod-hero-stats">
            {ALEA_DATA.stats.map((s, i) => (
              <div key={i} className="mod-stat">
                <strong>{s.n}</strong>
                <span>{lang === "es" ? s.labelES : s.labelEN}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mod-hero-right">
          <div className={`mod-roller ${nat20 ? "nat20" : ""}`}>
            <span className="mod-roller-glow" />
            <button className={`mod-roll-btn ${rolling ? "rolling" : ""} ${nat20 ? "crit" : ""}`} onClick={roll} aria-label="Roll d20">
              <D20 face={face} size={170} palette={["#c8a25b", "#0a0a12"]} critical={nat20} />
            </button>
            <span className="mod-roll-cta">{t("roll.cta")} <span className="mod-d20-label">d20</span></span>
            <span className="mod-roll-help">{t("roll.help")}</span>
            <div
              className={`mod-pick ${(pick || nat20) ? "show" : ""} ${nat20 ? "crit" : ""} ${pick && !nat20 ? "clickable" : ""}`}
              role={pick && !nat20 ? "button" : undefined}
              tabIndex={pick && !nat20 ? 0 : undefined}
              onClick={() => { if (pick && !nat20 && onPick) onPick(pick); }}
              onKeyDown={(e) => {
                if (pick && !nat20 && onPick && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onPick(pick);
                }
              }}
              aria-label={pick && !nat20 ? `${lang === "es" ? "Ver" : "See"} ${lang === "es" ? pick.titleES : pick.titleEN}` : undefined}
            >
              {nat20 ? (
                <>
                  <span className="mod-pick-tag mod-pick-tag-crit">★ {t("egg.title")} ★</span>
                  <strong>{lang === "es" ? "20 natural" : "Natural 20"}</strong>
                  <span>{lang === "es" ? "Has activado el bonus secreto." : "You triggered the secret bonus."}</span>
                </>
              ) : pick && (
                <>
                  <span className="mod-pick-tag">{t("roll.you")}</span>
                  <strong>{lang === "es" ? pick.titleES : pick.titleEN}</strong>
                  <span>{lang === "es" ? pick.dateES : pick.dateEN}</span>
                  <span className="mod-pick-cue" aria-hidden>{lang === "es" ? "Ver evento" : "See event"} →</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernTicker() {
  const { lang } = useI18n();
  const itemsES = ["★ Cada viernes · BOLT-DAYS", "◆ Sábados · Pathfinder 2e", "● Jornadas Gastro-Lúdicas · viernes 20:30", "▲ Local abierto 24/7 para socios", "★ Torneos mensuales · NAF, W40K, Blood Bowl", "◆ Mesa abierta · llega y juega"];
  const itemsEN = ["★ Every Friday · BOLT-DAYS", "◆ Saturdays · Pathfinder 2e", "● Gastro-Gaming Nights · Fri 20:30", "▲ Venue open 24/7 for members", "★ Monthly tournaments · NAF, W40K, Blood Bowl", "◆ Open table · drop in any time"];
  const items = lang === "es" ? itemsES : itemsEN;
  return (
    <div className="mod-ticker">
      <div className="mod-ticker-track">
        {[...items, ...items].map((it, i) => <span key={i}>{it}</span>)}
      </div>
    </div>
  );
}

function ModernAbout() {
  const { t } = useI18n();
  return (
    <section className="mod-about" id="about">
      <div className="mod-about-grid">
        <Reveal className="mod-about-text">
          <span className="mod-kicker">{t("about.kicker")}</span>
          <h2 className="mod-h2">{t("about.title")}</h2>
          <p className="mod-lead">{t("about.body")}</p>
          <p className="mod-lead">{t("about.body2")}</p>
          <ul className="mod-list">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <svg viewBox="0 0 24 24" width="18" height="18"><polygon points="12,3 21,8 21,16 12,21 3,16 3,8" fill="none" stroke="#c8a25b" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" fill="#c8a25b"/></svg>
                <span>{t(`about.bullet.${n}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={140} className="mod-about-img">
          <img src={ALEA_DATA.wizardImg} alt="Mago de Alea" />
          <div className="mod-about-img-tag">
            <strong>C. São Paulo, 55</strong>
            <span>Schamann · LPGC · {t("hero.badge.open")}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function EventCard({ ev, onOpen }) {
  const { t, lang } = useI18n();
  const date = lang === "es" ? ev.dateES : (ev.dateEN || ev.dateES);
  const title = lang === "es" ? ev.titleES : (ev.titleEN || ev.titleES);
  const blurb = lang === "es" ? ev.blurbES : (ev.blurbEN || ev.blurbES);
  const tag = lang === "es" ? ev.tagES : (ev.tagEN || ev.tagES);
  const players = lang === "es" ? ev.playersES : (ev.playersEN || ev.playersES);
  const time = lang === "es" ? ev.time : (ev.timeEN || ev.time);
  return (
    <article className={`mod-event mod-event-${ev.tone || "warm"}`}>
      <button className="mod-event-btn" onClick={() => onOpen(ev)} aria-label={title} draggable="false" onDragStart={(e) => e.preventDefault()}>
        <span className="mod-event-img">
          <img src={ev.img} alt={title} loading="lazy" draggable="false" onDragStart={(e) => e.preventDefault()} />
          <span className="mod-event-date-pill">{date}</span>
        </span>
        <span className="mod-event-body">
          {tag && <span className="mod-event-tag">{tag}</span>}
          <span className="mod-event-h3">{title}</span>
          <span className="mod-event-blurb">{blurb}</span>
          <span className="mod-event-foot">
            <span className="mod-event-meta">
              {time && <span>⏱ {time}</span>}
              {players && <span>👥 {players}</span>}
            </span>
            <span className="mod-event-link">{t("events.cta")} →</span>
          </span>
        </span>
      </button>
    </article>
  );
}

function ModernEvents({ onOpen }) {
  const { t, lang } = useI18n();
  return (
    <section className="mod-events" id="events">
      <div className="mod-section-head">
        <div>
          <span className="mod-kicker">{t("events.kicker")}</span>
          <h2 className="mod-h2">{t("events.title")}</h2>
        </div>
        <a href="/calendario" className="mod-arrow-link mod-cal-link">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M3.5 9.5 H 20.5" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M8 3 V 7 M16 3 V 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <rect x="7" y="12" width="3" height="3" fill="currentColor"/>
          </svg>
          {t("events.all")} →
        </a>
      </div>
      <MarqueeRow
        ariaLabel={t("events.title")}
        speedPxSec={26}
        prevLabel={lang === "es" ? "Evento anterior" : "Previous event"}
        nextLabel={lang === "es" ? "Siguiente evento" : "Next event"}
      >
        {ALEA_DATA.upcoming.map((ev) => (
          <EventCard key={ev.id} ev={ev} onOpen={onOpen} />
        ))}
      </MarqueeRow>
    </section>
  );
}

function PastCard({ ev, onOpen }) {
  const { lang } = useI18n();
  const title = lang === "es" ? ev.titleES : ev.titleEN;
  const date = lang === "es" ? ev.dateES : ev.dateEN;
  const blurb = lang === "es" ? ev.blurbES : ev.blurbEN;
  return (
    <article className="mod-past-card">
      <button className="mod-past-btn" onClick={() => onOpen(ev)} aria-label={title} draggable="false" onDragStart={(e) => e.preventDefault()}>
        <img src={ev.img} alt={title} loading="lazy" draggable="false" onDragStart={(e) => e.preventDefault()} />
        <span className="mod-past-overlay">
          <span className="mod-past-date">{date}</span>
          <span className="mod-past-h4">{title}</span>
          <span className="mod-past-p">{blurb}</span>
        </span>
      </button>
    </article>
  );
}

function ModernPast({ onOpen }) {
  const { t, lang } = useI18n();
  return (
    <section className="mod-past">
      <div className="mod-section-head">
        <div>
          <span className="mod-kicker">{t("past.kicker")}</span>
          <h2 className="mod-h2">{t("past.title")}</h2>
          <p className="mod-lead">{t("past.subtitle")}</p>
        </div>
      </div>
      <MarqueeRow
        ariaLabel={t("past.title")}
        speedPxSec={22}
        prevLabel={lang === "es" ? "Evento anterior" : "Previous event"}
        nextLabel={lang === "es" ? "Siguiente evento" : "Next event"}
      >
        {ALEA_DATA.past.map((p) => {
          const modalEv = {
            ...p,
            titleEN: p.titleEN || p.titleES,
            dateEN: p.dateEN || p.dateES,
            blurbEN: p.blurbEN || p.blurbES,
            fullEN: p.fullEN || p.fullES,
            bulletsEN: p.bulletsEN || p.bulletsES,
            tagES: "Evento realizado",
            tagEN: "Past event",
            tone: "warm",
            isPast: true,
          };
          return <PastCard key={p.id} ev={modalEv} onOpen={onOpen} />;
        })}
      </MarqueeRow>
    </section>
  );
}

function ModernCulture() {
  const { t, lang } = useI18n();
  return (
    <section className="mod-culture" id="culture">
      <div className="mod-section-head center">
        <span className="mod-kicker">{t("culture.kicker")}</span>
        <h2 className="mod-h2">{t("culture.title")}</h2>
      </div>
      <div className="mod-culture-grid">
        {ALEA_DATA.values.map((v, i) => (
          <Reveal key={v.key} delay={i * 100} className="mod-value">
            <svg viewBox="0 0 60 60" width="80" height="80" className="mod-value-hex">
              <polygon points="30,2 56,17 56,43 30,58 4,43 4,17" fill="none" stroke="#c8a25b" strokeWidth="1.5"/>
              <polygon points="30,8 50,20 50,40 30,52 10,40 10,20" fill="rgba(200,162,91,0.12)"/>
              <text x="30" y="40" textAnchor="middle" fontSize="22" fill="#c8a25b">{v.icon}</text>
            </svg>
            <h3>{lang === "es" ? v.titleES : v.titleEN}</h3>
            <p>{lang === "es" ? v.bodyES : v.bodyEN}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ModernGameCard({ g, idx }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, p: 0 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 18, y: px * 22, p: 1 });
  };
  const palettes = [
    ["#7a1f1f", "#d97757"], ["#1d4f8b", "#5fb3d4"], ["#3d5a3d", "#9bc275"],
    ["#5a2d6f", "#c89bd4"], ["#c8a25b", "#e6c281"], ["#a93232", "#f1c40f"],
    ["#2d4a5a", "#5fb3d4"], ["#6b3a18", "#c8a25b"],
  ];
  const [c1, c2] = palettes[idx % palettes.length];
  return (
    <div
      ref={ref}
      className="mod-game"
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0, p: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
    >
      <div className="mod-game-cover" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
        <div className="mod-game-shine" style={{ opacity: tilt.p, transform: `translate(${tilt.y * 4}px, ${-tilt.x * 4}px)` }} />
        <span className="mod-game-title-big">{g.title.split(":")[0]}</span>
        <span className="mod-game-cat">{g.category}</span>
      </div>
      <div className="mod-game-body">
        <h4>{g.title}</h4>
        <div className="mod-game-meta">
          <span>{g.players}</span><span>·</span><span>{g.time}</span><span>·</span><span>{g.weight}/5</span>
        </div>
      </div>
    </div>
  );
}

function ModernGames() {
  const { t, lang } = useI18n();
  return (
    <section className="mod-games" id="games">
      <div className="mod-section-head">
        <div>
          <span className="mod-kicker">{t("games.kicker")}</span>
          <h2 className="mod-h2">{t("games.title")}</h2>
          <p className="mod-lead">{t("games.subtitle")}</p>
        </div>
      </div>
      <MarqueeRow
        ariaLabel={t("games.title")}
        speedPxSec={20}
        prevLabel={lang === "es" ? "Juego anterior" : "Previous game"}
        nextLabel={lang === "es" ? "Siguiente juego" : "Next game"}
      >
        {ALEA_DATA.featuredGames.map((g, i) => (
          <ModernGameCard g={g} key={g.title} idx={i} />
        ))}
      </MarqueeRow>
    </section>
  );
}

function ModernPartners() {
  const { t, lang } = useI18n();
  return (
    <section className="mod-partners" id="partners">
      <div className="mod-section-head">
        <div>
          <span className="mod-kicker">{t("partners.kicker")}</span>
          <h2 className="mod-h2">{t("partners.title")}</h2>
        </div>
      </div>
      <MarqueeRow
        ariaLabel={t("partners.title")}
        speedPxSec={0}
        prevLabel={lang === "es" ? "Colaborador anterior" : "Previous partner"}
        nextLabel={lang === "es" ? "Siguiente colaborador" : "Next partner"}
      >
        {ALEA_DATA.collaborators.map((c) => {
          const desc = (lang === "es" ? c.descES : c.descEN) || c.descES || "";
          const isMap = (c.url || "").includes("maps.app.goo.gl") || (c.url || "").includes("google.com/maps");
          const cta = isMap
            ? (lang === "es" ? "Cómo llegar" : "Get directions")
            : (lang === "es" ? "Visitar" : "Visit");
          return (
            <a
              key={c.name}
              className="mod-partner-card"
              href={c.url || ALEA_DATA.publicSite}
              target="_blank"
              rel="noopener noreferrer"
              title={c.name}
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            >
              <span className="mod-partner-logo">
                <img src={c.img} alt={c.name} loading="lazy" draggable="false" onDragStart={(e) => e.preventDefault()} />
              </span>
              <span className="mod-partner-body">
                <span className="mod-partner-name">{c.name}</span>
                {desc && <span className="mod-partner-desc">{desc}</span>}
              </span>
              <span className="mod-partner-cta">
                {isMap ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M12 2 C 7.6 2 4 5.6 4 10 C 4 17 12 22 12 22 C 12 22 20 17 20 10 C 20 5.6 16.4 2 12 2 Z M 12 12.5 A 2.5 2.5 0 1 1 12 7.5 A 2.5 2.5 0 0 1 12 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden><path d="M7 17 L 17 7 M 9 7 L 17 7 L 17 15" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
                {cta}
              </span>
            </a>
          );
        })}
      </MarqueeRow>
    </section>
  );
}

function ModernCTA() {
  const { t } = useI18n();
  return (
    <section className="mod-cta-section" id="join">
      <div className="mod-cta-card">
        <div className="mod-cta-text">
          <span className="mod-kicker">{t("register.title")}</span>
          <h2 className="mod-h2">20 € <span className="mod-cta-period">/ mes</span></h2>
          <p className="mod-cta-body">{t("register.body")}</p>
          <ul className="mod-benefits">
            {[1,2,3,4].map((n) => (
              <li key={n}>
                <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12 L 10 17 L 19 7" stroke="#c8a25b" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>{t(`register.benefit.${n}`)}</span>
              </li>
            ))}
          </ul>
          <div className="mod-cta-buttons">
            <a className="mod-btn mod-btn-primary mod-btn-lg" href={ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">{t("cta.join")} →</a>
            <a className="mod-btn mod-btn-ghost" href={ALEA_DATA.webapp} target="_blank" rel="noopener noreferrer">{t("cta.members")}</a>
          </div>
        </div>
        <div className="mod-cta-art">
          <img src={ALEA_DATA.charactersImg} alt="Personajes Alea" />
        </div>
      </div>
    </section>
  );
}

function ModernFooter() {
  const { t } = useI18n();
  return (
    <footer className="mod-footer" id="contact">
      <div className="mod-foot-grid">
        <div>
          <div className="mod-logo">
            <img src={ALEA_DATA.logoUrl} alt="Alea" width="40" height="40" />
            <span><strong>ALEA</strong><em>Las Palmas</em></span>
          </div>
          <p className="mod-foot-tag">{t("hero.tagline")} · {t("hero.location")}</p>
          <p className="mod-foot-tag">{t("hero.badge.open")}</p>
          <p className="mod-egg-hint">{t("easter.hint")}</p>
        </div>
        <div>
          <h5>{t("footer.find")}</h5>
          <p><a href={ALEA_DATA.mapsUrl} target="_blank" rel="noopener noreferrer">{ALEA_DATA.address}</a></p>
        </div>
        <div>
          <h5>{t("footer.write")}</h5>
          <p><a href={`mailto:${ALEA_DATA.email}`}>{ALEA_DATA.email}</a></p>
        </div>
        <div>
          <h5>{t("footer.follow")}</h5>
          <p><a href={ALEA_DATA.instagram} target="_blank" rel="noopener noreferrer">Instagram</a></p>
          <p><a href={ALEA_DATA.facebook} target="_blank" rel="noopener noreferrer">Facebook</a></p>
          <p><a href={ALEA_DATA.publicSite} target="_blank" rel="noopener noreferrer">alealaspalmas.es</a></p>
        </div>
      </div>
      <div className="mod-foot-bottom"><span>{t("footer.rights")}</span></div>
    </footer>
  );
}

function ModernVariant() {
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
    <div className="modern-root">
      <ModernHexGrid />
      <ModernNav />
      <ModernHero onPick={openEv} />
      <ModernTicker />
      <ModernAbout />
      <ModernEvents onOpen={openEv} />
      <ModernPast onOpen={openEv} />
      <ModernCulture />
      <ModernGames />
      <ModernPartners />
      <ModernCTA />
      <ModernFooter />
      <EventModal event={openEvent} onClose={closeEv} />
    </div>
  );
}

export default function Landing() {
  const [eggOpen, setEggOpen] = useState(false);
  const [rain, setRain] = useState(false);
  const [meepleOpen, setMeepleOpen] = useState(false);

  const triggerNat20 = useCallback(() => {
    setEggOpen(true);
    setRain(true);
    setTimeout(() => setRain(false), 7500);
  }, []);

  const triggerMeeple = useCallback(() => setMeepleOpen(true), []);

  useShake(triggerNat20);
  useTapCount("[data-egg-tap]", 5, 1800, triggerNat20);

  useEffect(() => {
    const handler = () => triggerNat20();
    window.addEventListener("alea:nat20", handler);
    return () => window.removeEventListener("alea:nat20", handler);
  }, [triggerNat20]);

  return (
    <>
      <CustomCursor variant="die" color="#e6c281" />
      <LangToggle />
      <main className="alea-stage">
        <ModernVariant />
      </main>
      <EasterEgg open={eggOpen} onClose={() => setEggOpen(false)} />
      <DiceRain active={rain} />
      <MeepleHunt onCatch={triggerMeeple} />
      <MeepleEgg open={meepleOpen} onClose={() => setMeepleOpen(false)} />
    </>
  );
}
