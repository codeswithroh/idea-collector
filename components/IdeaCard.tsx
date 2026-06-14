"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Trophy,
  ChevronUp,
  ChevronDown,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Hash,
  Globe,
  Layers,
  Zap,
  Award,
  Lightbulb,
  Code2,
  Calendar,
  ArrowUpRight,
  Target,
  CheckCircle2,
  Circle,
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

export default function IdeaCard({
  idea,
  onAccept,
  onReject,
  onNext,
  onPrev,
}: IdeaCardProps) {
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

  const handleTouchStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      setStartX(clientX);
      setStartY(clientY);
      setOffsetX(0);
      setOffsetY(0);
      setSwiping(false);
      setSwipeDirection(null);
      isMouseDown.current = true;
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!isMouseDown.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        setSwiping(true);
      }

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

  useEffect(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target !== card && isFocusableInteractive(target)) return;

      const handledKeys = [
        "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown",
        "d", "D", "a", "A", "w", "W", "s", "S",
      ];
      if (!handledKeys.includes(e.key)) return;

      e.preventDefault();
      if (!canNavigate()) return;

      switch (e.key) {
        case "ArrowRight":
        case "d":
        case "D":
          onAccept(idea);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          onReject(idea);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          onPrev();
          break;
        case "ArrowDown":
        case "s":
        case "S":
          onNext();
          break;
      }
    };

    card.addEventListener("keydown", handleKeyDown);
    return () => card.removeEventListener("keydown", handleKeyDown);
  }, [onAccept, onReject, onNext, onPrev, idea]);

  const getCardStyle = () => {
    const rotateX = offsetY * 0.02;
    const rotateY = offsetX * 0.02;
    const scale = 1 - Math.abs(offsetX) / 3000 - Math.abs(offsetY) / 3000;

    if (accepted) {
      return {
        transform: `translateX(${window.innerWidth}px) rotate(30deg)`,
        opacity: 0,
        transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
      };
    }
    if (rejected) {
      return {
        transform: `translateX(-${window.innerWidth}px) rotate(-30deg)`,
        opacity: 0,
        transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
      };
    }

    return {
      transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
      transition: swiping ? "none" : "transform 0.3s ease-out",
      opacity: 1,
    };
  };

  const overlayOpacity = Math.min(Math.abs(offsetX) / SWIPE_THRESHOLD, 1);

  const isYc = idea.source === "yc";
  const accentColor = isYc ? "bg-ink" : "bg-copper";
  const accentText = isYc ? "text-white" : "text-white";
  const sourceLabel = isYc ? "YC IDEA" : "ETHGLOBAL";
  const sourceName = isYc ? "Y Combinator" : "ETHGlobal";

  const hasPrizes = idea.project_prizes && idea.project_prizes.length > 0;
  const hasCategories = idea.categories && idea.categories.length > 0;

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      className="w-full h-full flex items-center justify-center select-none outline-none relative"
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={() => {
        isMouseDown.current = false;
        setOffsetX(0);
        setOffsetY(0);
        setSwiping(false);
        setSwipeDirection(null);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={getCardStyle()}
    >
      {/* ===== SIDE SWIPE INDICATORS ===== */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="flex flex-col items-center gap-2 px-2 py-4 rounded-badge bg-red-700/10 border border-red-700/20 text-red-700">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest rotate-[-90deg] origin-center whitespace-nowrap">Skip</span>
        </div>
      </div>
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
        <div className="flex flex-col items-center gap-2 px-2 py-4 rounded-badge bg-copper/10 border border-copper/20 text-copper">
          <ChevronRight className="w-5 h-5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-widest rotate-90 origin-center whitespace-nowrap">Build</span>
        </div>
      </div>

      {/* ===== CARD ===== */}
      <div className="mx-auto max-w-xl w-full border-[2px] border-ink rounded-card bg-surface-raised overflow-hidden shadow-pixel flex flex-col max-h-[85vh]">
        {/* Swipe Overlays */}
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-card",
            swipeDirection === "right" && swiping ? "flex" : "hidden"
          )}
          style={{ opacity: overlayOpacity }}
        >
          <div className="bg-copper border-[3px] border-white px-8 py-4 rounded-card rotate-[-12deg] shadow-pixel">
            <span className="font-mono font-bold text-2xl text-white uppercase tracking-wider">
              BUILD THIS
            </span>
          </div>
        </div>
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center pointer-events-none rounded-card",
            swipeDirection === "left" && swiping ? "flex" : "hidden"
          )}
          style={{ opacity: overlayOpacity }}
        >
          <div className="bg-red-700 border-[3px] border-white px-8 py-4 rounded-card rotate-[12deg] shadow-pixel">
            <span className="font-mono font-bold text-2xl text-white uppercase tracking-wider">
              SKIP
            </span>
          </div>
        </div>

        {/* ===== COVER HEADER ===== */}
        <div className={`${accentColor} p-4 sm:p-5 relative overflow-hidden`}>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-badge font-mono text-xs font-bold text-white uppercase tracking-wider">
                  {idea.event}
                </span>
                <span className="bg-white/20 backdrop-blur-sm border border-white/30 px-2 py-0.5 rounded-badge font-mono text-[10px] font-bold text-white uppercase">
                  {sourceLabel}
                </span>
              </div>
              <a
                href={idea.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/20 backdrop-blur-sm border border-white/30 rounded-badge flex items-center justify-center hover:bg-white/30 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowUpRight className="w-4 h-4 text-white" />
              </a>
            </div>
            <h2 className="font-mono font-bold text-lg sm:text-xl lg:text-2xl text-white leading-tight break-words">
              {idea.title}
            </h2>
          </div>
        </div>

        {/* ===== CONTENT BODY ===== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Description */}
          <div className="bg-cream border-[2px] border-ink rounded-card p-4">
            <p className="text-sm sm:text-base leading-relaxed text-ink">
              {idea.description}
            </p>
          </div>

          {/* Prizes */}
          {hasPrizes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-copper" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Prizes Won
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.project_prizes!.map((prize, i) => (
                  <span
                    key={i}
                    className="bg-copper/10 border-[2px] border-copper/30 px-3 py-1.5 rounded-badge font-mono text-xs font-bold text-copper"
                  >
                    {prize.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {hasCategories && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-ink-light" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-ink">
                  Categories
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {idea.categories!.map((cat, i) => (
                  <span
                    key={i}
                    className="bg-surface-inset border-[2px] border-ink/20 px-3 py-1.5 rounded-badge font-mono text-xs text-ink-light"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick Info Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-surface border-[2px] border-ink/20 rounded-card p-2 text-center">
              <Hash className="w-4 h-4 mx-auto mb-1 text-ink-muted" />
              <p className="font-mono text-[10px] text-ink-muted uppercase">ID</p>
              <p className="font-mono text-xs font-bold text-ink">#{idea.id}</p>
            </div>
            <div className="bg-surface border-[2px] border-ink/20 rounded-card p-2 text-center">
              <Globe className="w-4 h-4 mx-auto mb-1 text-ink-muted" />
              <p className="font-mono text-[10px] text-ink-muted uppercase">Source</p>
              <p className="font-mono text-xs font-bold text-ink">{sourceName}</p>
            </div>
            <div className="bg-surface border-[2px] border-ink/20 rounded-card p-2 text-center">
              <Target className="w-4 h-4 mx-auto mb-1 text-ink-muted" />
              <p className="font-mono text-[10px] text-ink-muted uppercase">Event</p>
              <p className="font-mono text-xs font-bold text-ink truncate">{idea.event}</p>
            </div>
          </div>
        </div>

        {/* ===== BOTTOM ACTIONS ===== */}
        <div className="border-t-[2px] border-ink p-3 sm:p-4 bg-surface shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!canNavigate()) return;
                onReject(idea);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-700 text-white border-[2px] border-ink rounded-btn font-mono font-bold text-xs uppercase tracking-wider shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-red-800"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Skip</span>
            </button>

            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  if (!canNavigate()) return;
                  onPrev();
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface-raised border-[2px] border-ink rounded-btn text-ink hover:bg-surface active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-pixel-sm transition-all"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (!canNavigate()) return;
                  onNext();
                }}
                className="w-8 h-8 flex items-center justify-center bg-surface-raised border-[2px] border-ink rounded-btn text-ink hover:bg-surface active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-pixel-sm transition-all"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                if (!canNavigate()) return;
                onAccept(idea);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sage text-white border-[2px] border-ink rounded-btn font-mono font-bold text-xs uppercase tracking-wider shadow-pixel-sm active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all hover:bg-sage-dark"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Build</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
