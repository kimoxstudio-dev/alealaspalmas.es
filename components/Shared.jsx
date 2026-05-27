"use client";
import { useEffect, useRef, useState, Children } from "react";
import { useI18n } from "./I18n";

// Hook: detecta cuando un elemento entra en viewport.
export function useInView(opts = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      opts
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return [ref, inView];
}

// Componente: dado 3D que rota al hacer hover/scroll.
export function Dice({ face = 1, size = 64, palette = ["#f4ead5", "#1a1410"] }) {
  const [bg, fg] = palette;
  const pips = {
    1: [[0.5, 0.5]],
    2: [[0.25, 0.25], [0.75, 0.75]],
    3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
    4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
    5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
    6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
  }[face] || [];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))" }}>
      <rect x="4" y="4" width="92" height="92" rx="16" fill={bg} stroke={fg} strokeWidth="3" />
      {pips.map(([x, y], i) => (
        <circle key={i} cx={x * 100} cy={y * 100} r="8" fill={fg} />
      ))}
    </svg>
  );
}

// Componente: D20 con caras pseudo-3D y número visible.
export function D20({ face = 1, size = 150, palette = ["#c8a25b", "#1a1410"], critical = false }) {
  const [bg, fg] = palette;
  const isCrit = critical || face === 20;
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{ filter: isCrit
      ? "drop-shadow(0 0 28px rgba(230,194,129,0.85)) drop-shadow(0 8px 18px rgba(0,0,0,0.45))"
      : "drop-shadow(0 8px 18px rgba(0,0,0,0.45))" }}>
      <defs>
        <linearGradient id={`d20-grad-${size}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isCrit ? "#ffd980" : bg}/>
          <stop offset="100%" stopColor={isCrit ? "#a93232" : bg}/>
        </linearGradient>
      </defs>
      <polygon points="60,6 110,33 110,87 60,114 10,87 10,33"
               fill={`url(#d20-grad-${size})`} stroke={isCrit ? "#ffd980" : fg} strokeWidth="2.5" strokeLinejoin="round"/>
      <polygon points="60,6 110,33 60,60" fill="rgba(255,255,255,0.16)"/>
      <polygon points="110,33 110,87 60,60" fill="rgba(0,0,0,0.10)"/>
      <polygon points="110,87 60,114 60,60" fill="rgba(0,0,0,0.22)"/>
      <polygon points="60,114 10,87 60,60" fill="rgba(0,0,0,0.16)"/>
      <polygon points="10,87 10,33 60,60" fill="rgba(255,255,255,0.06)"/>
      <polygon points="10,33 60,6 60,60" fill="rgba(255,255,255,0.20)"/>
      <polygon points="60,28 86,46 76,76 44,76 34,46"
               fill={isCrit ? "rgba(0,0,0,0.18)" : "rgba(0,0,0,0.15)"}
               stroke={isCrit ? "#ffd980" : fg} strokeWidth="1.2"/>
      <text x="60" y="68" textAnchor="middle"
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="700"
            fontSize={face >= 10 ? "28" : "32"}
            fill={isCrit ? "#1a1410" : fg}>
        {face}
      </text>
    </svg>
  );
}

// Hook: agitar dispositivo (móvil) → easter egg.
export function useShake(onTrigger, { threshold = 22 } = {}) {
  useEffect(() => {
    let last = { x: 0, y: 0, z: 0, t: 0 };
    let count = 0;
    let resetTimer;
    const handler = (e) => {
      const acc = e.accelerationIncludingGravity || e.acceleration;
      if (!acc) return;
      const now = Date.now();
      if (now - last.t < 80) return;
      const dx = Math.abs((acc.x || 0) - last.x);
      const dy = Math.abs((acc.y || 0) - last.y);
      const dz = Math.abs((acc.z || 0) - last.z);
      if (dx + dy + dz > threshold) {
        count++;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => (count = 0), 900);
        if (count >= 3) { onTrigger(); count = 0; }
      }
      last = { x: acc.x || 0, y: acc.y || 0, z: acc.z || 0, t: now };
    };
    const attach = () => window.addEventListener("devicemotion", handler);
    if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
      const ask = async () => {
        try {
          const r = await DeviceMotionEvent.requestPermission();
          if (r === "granted") attach();
        } catch {}
        window.removeEventListener("touchend", ask);
      };
      window.addEventListener("touchend", ask, { once: true });
    } else if (typeof DeviceMotionEvent !== "undefined") {
      attach();
    }
    return () => window.removeEventListener("devicemotion", handler);
  }, [onTrigger, threshold]);
}

// Hook: cuenta toques consecutivos sobre un elemento (compatible móvil + desktop).
export function useTapCount(target = "[data-egg-tap]", count = 5, windowMs = 1500, onTrigger) {
  useEffect(() => {
    let n = 0; let timer;
    const handler = (e) => {
      const el = e.target.closest(target);
      if (!el) return;
      n++;
      clearTimeout(timer);
      timer = setTimeout(() => (n = 0), windowMs);
      if (n >= count) { onTrigger(); n = 0; }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [target, count, windowMs, onTrigger]);
}

// Componente: meeple cazable que aparece y atraviesa la pantalla.
export function MeepleHunt({ onCatch, autoSpawnDelay = [22000, 45000] }) {
  const [meeple, setMeeple] = useState(null);
  const [caught, setCaught] = useState(false);

  useEffect(() => {
    if (caught) return;
    let timer;
    const schedule = () => {
      const delay = autoSpawnDelay[0] + Math.random() * (autoSpawnDelay[1] - autoSpawnDelay[0]);
      timer = setTimeout(spawn, delay);
    };
    const spawn = () => {
      const W = window.innerWidth, H = window.innerHeight;
      const side = Math.floor(Math.random() * 4);
      const edge = (s) => {
        const r = Math.random();
        switch (s) {
          case 0: return { x: -60,   y: H * (0.2 + r * 0.6) };
          case 1: return { x: W+60,  y: H * (0.2 + r * 0.6) };
          case 2: return { x: W * (0.2 + r * 0.6), y: -60 };
          default:return { x: W * (0.2 + r * 0.6), y: H+60 };
        }
      };
      const start = edge(side);
      const end = edge((side + 2) % 4);
      const dur = 14000 + Math.random() * 6000;
      setMeeple({ x0: start.x, y0: start.y, x1: end.x, y1: end.y, dur, t0: Date.now() });
      setTimeout(() => {
        setMeeple((m) => (m && Date.now() - m.t0 >= dur ? null : m));
        if (!caught) schedule();
      }, dur);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [caught, autoSpawnDelay]);

  const ref = useRef(null);
  useEffect(() => {
    if (!meeple || caught) return;
    let raf;
    const tick = () => {
      const t = Math.min(1, (Date.now() - meeple.t0) / meeple.dur);
      const x = meeple.x0 + (meeple.x1 - meeple.x0) * t;
      const y = meeple.y0 + (meeple.y1 - meeple.y0) * t;
      const bob = Math.sin(t * 10 * Math.PI) * 6;
      const rot = Math.sin(t * 12 * Math.PI) * 8;
      if (ref.current) ref.current.style.transform = `translate(${x}px, ${y + bob}px) rotate(${rot}deg)`;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [meeple, caught]);

  const handleCatch = () => {
    if (caught) return;
    setCaught(true);
    setMeeple(null);
    onCatch();
  };

  if (!meeple || caught) return null;
  return (
    <button
      ref={ref}
      className="meeple-hunt"
      onClick={handleCatch}
      onTouchStart={handleCatch}
      aria-label="Caza al meeple"
    >
      <svg viewBox="0 0 60 70" width="48" height="56" aria-hidden>
        <defs>
          <radialGradient id="mple-grad" cx="40%" cy="30%">
            <stop offset="0%" stopColor="#ffd980" />
            <stop offset="100%" stopColor="#a93232" />
          </radialGradient>
        </defs>
        <path
          d="M 30 4 C 38 4 42 10 39 16 C 49 18 54 26 54 36 L 54 56 C 54 60 50 64 46 64 L 40 64 L 40 54 L 36 54 L 32 64 L 28 64 L 24 54 L 20 54 L 20 64 L 14 64 C 10 64 6 60 6 56 L 6 36 C 6 26 11 18 21 16 C 18 10 22 4 30 4 Z"
          fill="url(#mple-grad)"
          stroke="#f4ead5"
          strokeWidth="1.5"
        />
      </svg>
      <span className="meeple-sparkle" aria-hidden>✦</span>
    </button>
  );
}

// Modal: recompensa al cazar al meeple.
export function MeepleEgg({ open, onClose }) {
  const { lang } = useI18n();
  const [copied, setCopied] = useState(false);
  if (!open) return null;
  const code = "MEEPLE26";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <div className="meeple-backdrop" onClick={onClose}>
      <div className="meeple-card" onClick={(e) => e.stopPropagation()}>
        <svg viewBox="0 0 60 70" width="120" height="140" className="meeple-card-art">
          <defs>
            <radialGradient id="mple-grad-big" cx="40%" cy="30%">
              <stop offset="0%" stopColor="#ffd980" />
              <stop offset="100%" stopColor="#a93232" />
            </radialGradient>
          </defs>
          <path
            d="M 30 4 C 38 4 42 10 39 16 C 49 18 54 26 54 36 L 54 56 C 54 60 50 64 46 64 L 40 64 L 40 54 L 36 54 L 32 64 L 28 64 L 24 54 L 20 54 L 20 64 L 14 64 C 10 64 6 60 6 56 L 6 36 C 6 26 11 18 21 16 C 18 10 22 4 30 4 Z"
            fill="url(#mple-grad-big)"
            stroke="#f4ead5"
            strokeWidth="1.5"
          />
        </svg>
        <h3>{lang === "es" ? "¡Cazaste al meeple perdido!" : "You caught the lost meeple!"}</h3>
        <p>
          {lang === "es"
            ? "Andaba escapado por la landing. Lo devolvemos a la mesa con un detalle para ti: un mes de cuota gratis al hacerte socio."
            : "It had escaped across the landing. Bring it back to the table — and we'll give you one month of membership for free."}
        </p>
        <div className="meeple-code">
          <span>{code}</span>
          <button onClick={copy}>{copied ? (lang === "es" ? "¡Copiado!" : "Copied!") : (lang === "es" ? "Copiar" : "Copy")}</button>
        </div>
        <button className="meeple-close" onClick={onClose}>
          {lang === "es" ? "Cerrar" : "Close"}
        </button>
      </div>
    </div>
  );
}

// Carrusel horizontal genérico (auto-scroll + drag mouse + scroll táctil nativo).
export function MarqueeRow({ children, speedPxSec = 30, ariaLabel, prevLabel = "Anterior", nextLabel = "Siguiente", pauseOnHover = false }) {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0, isTouch: false, dragging: false });

  const items = Children.toArray(children);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last;
      last = now;
      const el = trackRef.current;
      if (el && !paused) {
        el.scrollLeft += (speedPxSec * dt) / 1000;
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        if (el.scrollLeft < 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, speedPxSec]);

  const wrapSafe = (el) => {
    const half = el.scrollWidth / 2;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft < 0) el.scrollLeft += half;
  };

  const scrollByCardsRef = useRef(null);
  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".alea-marquee-item");
    const step = card ? card.getBoundingClientRect().width + 18 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
    setPaused(true);
    clearTimeout(scrollByCardsRef.current);
    scrollByCardsRef.current = setTimeout(() => {
      wrapSafe(el);
      setPaused(false);
    }, 700);
  };

  const onPointerMoveGlobal = (e) => {
    const s = drag.current;
    const el = trackRef.current;
    if (!s.active || !el || s.isTouch) return;
    const dx = e.clientX - s.startX;
    s.moved = Math.abs(dx);
    if (!s.dragging && s.moved > 6) {
      s.dragging = true;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    }
    if (s.dragging) {
      el.scrollLeft = s.startScroll - dx;
      e.preventDefault?.();
    }
  };

  const onPointerUpGlobal = () => {
    const el = trackRef.current;
    const s = drag.current;
    window.removeEventListener("pointermove", onPointerMoveGlobal);
    window.removeEventListener("pointerup", onPointerUpGlobal);
    window.removeEventListener("pointercancel", onPointerUpGlobal);
    if (el) { el.style.cursor = ""; el.style.userSelect = ""; }
    if (s.dragging) {
      setTimeout(() => { s.dragging = false; s.moved = 0; }, 60);
    } else {
      s.dragging = false;
      s.moved = 0;
    }
    s.active = false;
    setTimeout(() => setPaused(false), 600);
  };

  const onPointerDown = (e) => {
    const el = trackRef.current;
    if (!el) return;
    if (e.pointerType === "touch") {
      drag.current = { active: false, startX: 0, startScroll: 0, moved: 0, isTouch: true, dragging: false };
      setPaused(true);
      return;
    }
    drag.current = {
      active: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      moved: 0,
      isTouch: false,
      dragging: false,
    };
    setPaused(true);
    window.addEventListener("pointermove", onPointerMoveGlobal);
    window.addEventListener("pointerup", onPointerUpGlobal);
    window.addEventListener("pointercancel", onPointerUpGlobal);
  };

  const onTouchEnd = () => setTimeout(() => setPaused(false), 800);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft")  { scrollByCards(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { scrollByCards(1);  e.preventDefault(); }
  };

  return (
    <div className="alea-marquee-wrap" role="region" aria-label={ariaLabel} aria-roledescription="carrusel">
      <button
        type="button"
        className="alea-marquee-nav alea-marquee-nav-prev"
        onClick={() => scrollByCards(-1)}
        aria-label={prevLabel}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M15 4 L 7 12 L 15 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <div
        ref={trackRef}
        className="alea-marquee"
        tabIndex={0}
        onMouseEnter={pauseOnHover ? () => setPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setPaused(false) : undefined}
        onPointerDown={onPointerDown}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={onTouchEnd}
        onKeyDown={onKeyDown}
        onDragStart={(e) => e.preventDefault()}
      >
        <div className="alea-marquee-track">
          {items.map((c, i) => (
            <div
              key={`a-${i}`}
              className="alea-marquee-item"
              onClickCapture={(e) => {
                if (drag.current.dragging) { e.preventDefault(); e.stopPropagation(); }
              }}
            >
              {c}
            </div>
          ))}
          {items.map((c, i) => (
            <div
              key={`b-${i}`}
              className="alea-marquee-item"
              aria-hidden
              onClickCapture={(e) => {
                if (drag.current.dragging) { e.preventDefault(); e.stopPropagation(); }
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        className="alea-marquee-nav alea-marquee-nav-next"
        onClick={() => scrollByCards(1)}
        aria-label={nextLabel}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden><path d="M9 4 L 17 12 L 9 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  );
}

// Cursor personalizado.
export function CustomCursor({ variant = "pawn", color = "#c8a25b" }) {
  const ref = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let x = 0, y = 0, rx = 0, ry = 0;
    let raf;
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (ref.current) { ref.current.style.left = x + "px"; ref.current.style.top = y + "px"; }
    };
    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (ringRef.current) { ringRef.current.style.left = rx + "px"; ringRef.current.style.top = ry + "px"; }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  const Icon = variant === "die" ? (
    <svg width="22" height="22" viewBox="0 0 100 100"><rect x="6" y="6" width="88" height="88" rx="16" fill={color} /><circle cx="30" cy="30" r="8" fill="#1a1410"/><circle cx="70" cy="70" r="8" fill="#1a1410"/><circle cx="50" cy="50" r="8" fill="#1a1410"/></svg>
  ) : variant === "meeple" ? (
    <svg width="22" height="28" viewBox="0 0 100 120"><path d="M50 0 C68 0 76 14 70 28 C88 30 100 42 100 60 L100 120 L0 120 L0 60 C0 42 12 30 30 28 C24 14 32 0 50 0Z" fill={color}/></svg>
  ) : (
    <svg width="22" height="28" viewBox="0 0 100 120"><circle cx="50" cy="24" r="22" fill={color}/><path d="M28 50 Q50 60 72 50 L78 70 Q50 80 22 70Z" fill={color}/><path d="M16 84 L84 84 L92 116 L8 116Z" fill={color}/></svg>
  );
  return (
    <>
      <div ref={ringRef} className="cursor-ring" style={{ borderColor: color }} />
      <div ref={ref} className="cursor-dot">{Icon}</div>
    </>
  );
}

// Texto que se desvela al entrar en viewport.
export function Reveal({ children, delay = 0, y = 24, as: As = "div", ...rest }) {
  const [ref, inView] = useInView();
  return (
    <As
      ref={ref}
      {...rest}
      style={{
        ...(rest.style || {}),
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .8s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </As>
  );
}

// Easter egg modal — natural 20.
export function EasterEgg({ open, onClose }) {
  const { t } = useI18n();
  if (!open) return null;
  return (
    <div className="egg-backdrop" onClick={onClose}>
      <div className="egg-card" onClick={(e) => e.stopPropagation()}>
        <div className="egg-d20">
          <svg viewBox="0 0 100 100" width="160" height="160">
            <defs>
              <radialGradient id="d20g" cx="40%" cy="35%">
                <stop offset="0%" stopColor="#ffd980" />
                <stop offset="100%" stopColor="#7a1f1f" />
              </radialGradient>
            </defs>
            <polygon points="50,4 96,28 96,72 50,96 4,72 4,28" fill="url(#d20g)" stroke="#c8a25b" strokeWidth="2"/>
            <polygon points="50,4 96,28 50,50" fill="rgba(255,255,255,0.08)"/>
            <polygon points="96,28 96,72 50,50" fill="rgba(0,0,0,0.12)"/>
            <polygon points="96,72 50,96 50,50" fill="rgba(0,0,0,0.22)"/>
            <polygon points="50,96 4,72 50,50" fill="rgba(0,0,0,0.18)"/>
            <polygon points="4,72 4,28 50,50" fill="rgba(255,255,255,0.06)"/>
            <polygon points="4,28 50,4 50,50" fill="rgba(255,255,255,0.16)"/>
            <text x="50" y="58" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="22" fontWeight="700" fill="#1a1410">20</text>
          </svg>
        </div>
        <h3>{t("egg.title")}</h3>
        <p>{t("egg.body")}</p>
        <button onClick={onClose}>{t("egg.close")}</button>
      </div>
    </div>
  );
}

// Lluvia de dados (canvas) — efecto easter egg.
export function DiceRain({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const cnv = canvasRef.current;
    const ctx = cnv.getContext("2d");
    cnv.width = window.innerWidth;
    cnv.height = window.innerHeight;
    const dice = Array.from({ length: 80 }, () => ({
      x: Math.random() * cnv.width,
      y: -Math.random() * cnv.height,
      r: 18 + Math.random() * 22,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.1,
      face: 1 + Math.floor(Math.random() * 6),
    }));
    let raf;
    let frames = 0;
    const draw = () => {
      ctx.clearRect(0, 0, cnv.width, cnv.height);
      dice.forEach((d) => {
        d.y += d.vy; d.rot += d.vr;
        if (d.y > cnv.height + 50) d.y = -50;
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.rotate(d.rot);
        ctx.fillStyle = "#f4ead5";
        ctx.strokeStyle = "#1a1410";
        ctx.lineWidth = 2;
        const s = d.r;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(-s, -s, s * 2, s * 2, 6);
        else ctx.rect(-s, -s, s * 2, s * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#1a1410";
        const pipMap = { 1:[[0.5,0.5]], 2:[[0.25,0.25],[0.75,0.75]], 3:[[0.25,0.25],[0.5,0.5],[0.75,0.75]], 4:[[0.25,0.25],[0.75,0.25],[0.25,0.75],[0.75,0.75]], 5:[[0.25,0.25],[0.75,0.25],[0.5,0.5],[0.25,0.75],[0.75,0.75]], 6:[[0.25,0.25],[0.75,0.25],[0.25,0.5],[0.75,0.5],[0.25,0.75],[0.75,0.75]] };
        pipMap[d.face].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(-s + px * 2 * s, -s + py * 2 * s, s * 0.12, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();
      });
      frames++;
      if (frames < 400) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [active]);
  if (!active) return null;
  return <canvas ref={canvasRef} className="dice-rain" />;
}
