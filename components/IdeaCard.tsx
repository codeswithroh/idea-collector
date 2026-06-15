"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Hash,
  Globe,
  Trophy,
  Code2,
  ArrowUpRight,
  Layers,
  Star,
} from "lucide-react";

interface Idea {
  _id: string;
  id: number;
  source: string;
  title: string;
  description: string;
  url: string;
  event: string;
  project_prizes?: Array<{ name: string; img_url?: string }>;
  categories?: string[];
}

interface IdeaCardProps {
  idea: Idea;
  onAccept: (idea: Idea) => void;
  onReject: (idea: Idea) => void;
  onNext: () => void;
  onPrev: () => void;
}

function isFocusableInteractive(el: HTMLElement): boolean {
  const tag = el.tagName;
  if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "A" && el.hasAttribute("href")) return true;
  const tabindex = el.getAttribute("tabindex");
  if (tabindex !== null && parseInt(tabindex) >= 0) return true;
  return false;
}

/* ── procedural gradient helper ── */
function getCardPalette(id: number, event: string) {
  const seed = id + event.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const h1 = (seed * 137) % 360;
  const h2 = (h1 + 35) % 360;
  const h3 = (h1 + 70) % 360;
  const h4 = (h1 + 110) % 360;
  return {
    gradient: `linear-gradient(165deg, hsl(${h1}, 45%, 16%) 0%, hsl(${h2}, 40%, 12%) 35%, hsl(${h3}, 38%, 10%) 70%, hsl(${h4}, 35%, 8%) 100%)`,
    accent: `hsl(${h1}, 55%, 40%)`,
    glow: `hsla(${h1}, 60%, 30%, 0.5)`,
  };
}

export default function IdeaCard({ idea, onAccept, onReject, onNext, onPrev }: IdeaCardProps) {
  /* ── swipe ── */
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMouseDown = useRef(false);
  const lastNavTime = useRef(0);

  const SWIPE_THRESHOLD = 100;
  const VERTICAL_THRESHOLD = 80;
  const NAV_COOLDOWN = 800;

  const canNavigate = () => {
    const now = Date.now();
    if (now - lastNavTime.current < NAV_COOLDOWN) return false;
    lastNavTime.current = now;
    return true;
  };

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setStartX(clientX);
    setStartY(clientY);
    setOffsetX(0);
    setOffsetY(0);
    setSwiping(false);
    setSwipeDirection(null);
    isMouseDown.current = true;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isMouseDown.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) setSwiping(true);

      if (Math.abs(dx) > Math.abs(dy)) {
        if ("touches" in e) e.preventDefault();
        setOffsetX(dx);
        setOffsetY(0);
        setSwipeDirection(dx > 0 ? "right" : "left");
      } else {
        setOffsetX(0);
        setOffsetY(dy);
        setSwipeDirection(null);
      }
    },
    [startX, startY]
  );

  const handleTouchEnd = useCallback(() => {
    isMouseDown.current = false;
    if (!swiping) {
      setOffsetX(0);
      setOffsetY(0);
      setSwiping(false);
      setSwipeDirection(null);
      return;
    }

    if (Math.abs(offsetX) > SWIPE_THRESHOLD) {
      if (!canNavigate()) {
        setOffsetX(0);
        setSwiping(false);
        return;
      }
      if (offsetX > 0) {
        setAccepted(true);
        setOffsetX(window.innerWidth);
        setTimeout(() => onAccept(idea), 300);
      } else {
        setRejected(true);
        setOffsetX(-window.innerWidth);
        setTimeout(() => onReject(idea), 300);
      }
      return;
    }

    if (Math.abs(offsetY) > VERTICAL_THRESHOLD) {
      if (!canNavigate()) {
        setOffsetY(0);
        setSwiping(false);
        return;
      }
      if (offsetY < 0) {
        setOffsetY(-window.innerHeight);
        setTimeout(() => onNext(), 300);
      } else {
        setOffsetY(window.innerHeight);
        setTimeout(() => onPrev(), 300);
      }
      return;
    }

    setOffsetX(0);
    setOffsetY(0);
    setSwiping(false);
    setSwipeDirection(null);
  }, [offsetX, offsetY, swiping, onAccept, onReject, onNext, onPrev, idea]);

  /* ── keyboard ── */
  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target !== card && isFocusableInteractive(target)) return;
      const handled = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "d", "D", "a", "A", "w", "W", "s", "S"];
      if (!handled.includes(e.key)) return;
      e.preventDefault();
      if (!canNavigate()) return;
      switch (e.key) {
        case "ArrowRight": case "d": case "D": onAccept(idea); break;
        case "ArrowLeft": case "a": case "A": onReject(idea); break;
        case "ArrowUp": case "w": case "W": onPrev(); break;
        case "ArrowDown": case "s": case "S": onNext(); break;
      }
    };
    card.addEventListener("keydown", handleKeyDown);
    return () => card.removeEventListener("keydown", handleKeyDown);
  }, [onAccept, onReject, onNext, onPrev, idea]);

  /* ── 3D tilt (simplified, elegant) ── */
  const tiltRef = useRef<HTMLDivElement>(null);
  const tiltCurrent = useRef({ x: 0, y: 0 });
  const tiltTarget = useRef({ x: 0, y: 0 });
  const tiltRaf = useRef<number | null>(null);
  const tiltRunning = useRef(false);
  const tiltLastTs = useRef(0);

  const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const round = (v: number, p = 2) => parseFloat(v.toFixed(p));

  const setTilt = useCallback((x: number, y: number) => {
    const el = tiltRef.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    const px = clamp((100 / w) * x);
    const py = clamp((100 / h) * y);
    const cx = px - 50;
    const cy = py - 50;

    el.style.setProperty("--px", `${px}%`);
    el.style.setProperty("--py", `${py}%`);
    el.style.setProperty("--rx", `${round(-cx / 8)}deg`);
    el.style.setProperty("--ry", `${round(cy / 6)}deg`);
    el.style.setProperty("--glow-x", `${px}%`);
    el.style.setProperty("--glow-y", `${py}%`);
  }, []);

  const tiltStep = useCallback((ts: number) => {
    if (!tiltRunning.current) return;
    if (tiltLastTs.current === 0) tiltLastTs.current = ts;
    const dt = (ts - tiltLastTs.current) / 1000;
    tiltLastTs.current = ts;
    const k = 1 - Math.exp(-dt / 0.12);

    tiltCurrent.current.x += (tiltTarget.current.x - tiltCurrent.current.x) * k;
    tiltCurrent.current.y += (tiltTarget.current.y - tiltCurrent.current.y) * k;
    setTilt(tiltCurrent.current.x, tiltCurrent.current.y);

    const far = Math.abs(tiltTarget.current.x - tiltCurrent.current.x) > 0.1 || Math.abs(tiltTarget.current.y - tiltCurrent.current.y) > 0.1;
    if (far || document.hasFocus()) {
      tiltRaf.current = requestAnimationFrame(tiltStep);
    } else {
      tiltRunning.current = false;
      tiltLastTs.current = 0;
    }
  }, [setTilt]);

  const tiltStart = useCallback(() => {
    if (tiltRunning.current) return;
    tiltRunning.current = true;
    tiltLastTs.current = 0;
    tiltRaf.current = requestAnimationFrame(tiltStep);
  }, [tiltStep]);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tiltTarget.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      el.classList.add("active");
      tiltStart();
    };
    const onLeave = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      tiltTarget.current = { x: w / 2, y: h / 2 };
      tiltStart();
      setTimeout(() => el.classList.remove("active"), 400);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const w = el.clientWidth || 1;
    const h = el.clientHeight || 1;
    setTilt(w / 2, h / 2);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current);
    };
  }, [setTilt, tiltStart]);

  /* ── swipe style ── */
  const getCardStyle = () => {
    const rotX = offsetY * 0.02;
    const rotY = offsetX * 0.02;
    const scale = 1 - Math.abs(offsetX) / 3000 - Math.abs(offsetY) / 3000;
    if (accepted) return { transform: `translateX(${window.innerWidth}px) rotate(30deg)`, opacity: 0, transition: "transform 0.3s ease-out, opacity 0.3s ease-out" };
    if (rejected) return { transform: `translateX(-${window.innerWidth}px) rotate(-30deg)`, opacity: 0, transition: "transform 0.3s ease-out, opacity 0.3s ease-out" };
    return {
      transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
      transition: swiping ? "none" : "transform 0.3s ease-out",
      opacity: 1,
    };
  };

  const overlayOpacity = Math.min(Math.abs(offsetX) / SWIPE_THRESHOLD, 1);

  /* ── data ── */
  const isYc = idea.source === "yc";
  const sourceLabel = isYc ? "YC" : "ETH";
  const sourceName = isYc ? "Y Combinator" : "ETHGlobal";
  const hasPrizes = idea.project_prizes && idea.project_prizes.length > 0;
  const hasCategories = idea.categories && idea.categories.length > 0;
  const palette = getCardPalette(idea.id, idea.event);

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      className="flex items-center justify-center select-none outline-none relative"
      style={{ width: 380, ...getCardStyle() }}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => { isMouseDown.current = false; setOffsetX(0); setOffsetY(0); setSwiping(false); setSwipeDirection(null); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Side indicators */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-60">
        <div className="flex flex-col items-center gap-1 text-ink-muted">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">Skip</span>
        </div>
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 pointer-events-none opacity-60">
        <div className="flex flex-col items-center gap-1 text-ink-muted">
          <ChevronRight className="w-5 h-5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">Build</span>
        </div>
      </div>

      {/* Swipe overlays */}
      <div className={cn("absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-card", swipeDirection === "right" && swiping ? "flex" : "hidden")} style={{ opacity: overlayOpacity }}>
        <div className="bg-copper border-[3px] border-white px-6 py-3 rounded-card rotate-[-12deg] shadow-pixel">
          <span className="font-mono font-bold text-xl text-white uppercase tracking-wider">BUILD</span>
        </div>
      </div>
      <div className={cn("absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-card", swipeDirection === "left" && swiping ? "flex" : "hidden")} style={{ opacity: overlayOpacity }}>
        <div className="bg-red-700 border-[3px] border-white px-6 py-3 rounded-card rotate-[12deg] shadow-pixel">
          <span className="font-mono font-bold text-xl text-white uppercase tracking-wider">SKIP</span>
        </div>
      </div>

      {/* 3D tilt wrapper */}
      <div className="idea-card-3d" style={{ perspective: "500px" }}>
        <div ref={tiltRef} className="idea-card-tilt">
          {/* glow */}
          <div className="idea-card-glow" style={{ background: `radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), ${palette.glow} 0%, transparent 60%)` }} />

          {/* Card */}
          <div className="w-[380px] border-[2px] border-ink rounded-card overflow-hidden shadow-pixel relative bg-surface-raised">
            {/* ===== HERO ===== */}
            <div className="relative h-[200px] overflow-hidden" style={{ background: palette.gradient }}>
              {/* Subtle dot grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
                  backgroundSize: "14px 14px",
                }}
              />
              {/* Diagonal accent line */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(135deg, transparent 40%, ${palette.accent} 40%, ${palette.accent} 41%, transparent 41%)`,
                }}
              />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-badge font-mono text-[10px] font-bold text-white/90 uppercase tracking-wider">
                    {idea.event}
                  </span>
                  <span className="bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-badge font-mono text-[9px] font-bold text-white/70 uppercase">
                    {sourceLabel}
                  </span>
                  {hasPrizes && (
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-badge font-mono text-[9px] font-bold text-amber-300/90 uppercase flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" />
                      {idea.project_prizes!.length}
                    </span>
                  )}
                </div>
                <a
                  href={idea.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 bg-white/10 backdrop-blur-md border border-white/20 rounded-badge flex items-center justify-center hover:bg-white/20 transition-colors shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                </a>
              </div>

              {/* Bottom fade */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface-raised to-transparent" />
            </div>

            {/* ===== BODY ===== */}
            <div className="px-4 pt-2 pb-3 space-y-3">
              {/* Title */}
              <h2 className="font-mono font-bold text-base text-ink leading-snug break-words">
                {idea.title}
              </h2>

              {/* Description — inline, no box */}
              <p className="text-sm leading-relaxed text-ink-light line-clamp-4">
                {idea.description}
              </p>

              {/* Tags — compact row */}
              {hasCategories && (
                <div className="flex flex-wrap gap-1">
                  {idea.categories!.slice(0, 5).map((cat, i) => (
                    <span
                      key={i}
                      className="bg-surface-inset border border-ink/15 px-2 py-0.5 rounded-badge text-[10px] font-mono text-ink-light"
                    >
                      {cat}
                    </span>
                  ))}
                  {idea.categories!.length > 5 && (
                    <span className="text-[10px] font-mono text-ink-muted self-center">+{idea.categories!.length - 5}</span>
                  )}
                </div>
              )}

              {/* Prizes — compact row if present */}
              {hasPrizes && (
                <div className="flex flex-wrap gap-1.5">
                  {idea.project_prizes!.slice(0, 3).map((prize, i) => (
                    <span
                      key={i}
                      className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-badge text-[10px] font-mono font-bold text-amber-700 flex items-center gap-1"
                    >
                      <Trophy className="w-2.5 h-2.5" />
                      {prize.name}
                    </span>
                  ))}
                  {idea.project_prizes!.length > 3 && (
                    <span className="text-[10px] font-mono text-ink-muted self-center">+{idea.project_prizes!.length - 3} more</span>
                  )}
                </div>
              )}

              {/* Info row — compact, horizontal */}
              <div className="flex items-center gap-2 pt-1 border-t border-ink/10">
                <div className="flex items-center gap-1 text-[10px] font-mono text-ink-muted">
                  <Hash className="w-3 h-3" />
                  <span>#{idea.id}</span>
                </div>
                <div className="w-px h-3 bg-ink/15" />
                <div className="flex items-center gap-1 text-[10px] font-mono text-ink-muted">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{sourceName}</span>
                </div>
                <div className="w-px h-3 bg-ink/15" />
                <div className="flex items-center gap-1 text-[10px] font-mono text-copper">
                  <Layers className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{idea.event}</span>
                </div>
              </div>
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="border-t-[2px] border-ink p-3 bg-surface">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { if (!canNavigate()) return; onReject(idea); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-700 text-white border-[2px] border-ink rounded-btn font-mono font-bold text-[10px] uppercase tracking-wider shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-red-800"
                >
                  <X className="w-4 h-4" />
                  <span>Skip</span>
                </button>

                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => { if (!canNavigate()) return; onPrev(); }}
                    className="w-7 h-7 flex items-center justify-center bg-surface-raised border-[2px] border-ink rounded-btn text-ink hover:bg-surface active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-pixel-sm transition-all"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { if (!canNavigate()) return; onNext(); }}
                    className="w-7 h-7 flex items-center justify-center bg-surface-raised border-[2px] border-ink rounded-btn text-ink hover:bg-surface active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-pixel-sm transition-all"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => { if (!canNavigate()) return; onAccept(idea); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-sage text-white border-[2px] border-ink rounded-btn font-mono font-bold text-[10px] uppercase tracking-wider shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-sage-dark"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Build</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
