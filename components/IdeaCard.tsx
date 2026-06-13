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

  return (
    <div
      ref={cardRef}
      tabIndex={0}
      className="w-full h-full flex items-center justify-center select-none outline-none"
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
      <div className="w-full h-full border-[2px] border-ink rounded-card bg-surface-raised overflow-hidden relative flex flex-col shadow-pixel">
        {/* Swipe Overlays */}
        <div
          className={cn(
            "absolute inset-0 z-20 flex items-center justify-center pointer-events-none",
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
            "absolute inset-0 z-20 flex items-center justify-center pointer-events-none",
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

        {/* Header */}
        <div className="border-b-[2px] border-ink p-4 sm:p-5 flex items-start justify-between gap-4 bg-surface shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="pixel-badge-copper">{idea.event}</span>
            </div>
            <h2 className="pixel-heading text-lg sm:text-xl lg:text-2xl leading-tight break-words">
              {idea.title}
            </h2>
          </div>
          <a
            href={idea.url}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn-ghost p-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          <p className="text-sm sm:text-base leading-relaxed text-ink-light">
            {idea.description}
          </p>

          {idea.project_prizes && idea.project_prizes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-mono text-xs uppercase font-bold flex items-center gap-2 text-ink">
                <Trophy className="w-4 h-4 text-copper" />
                Prizes Won
              </h3>
              <div className="flex flex-wrap gap-2">
                {idea.project_prizes.map((prize, i) => (
                  <span key={i} className="pixel-badge-copper">
                    {prize.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {idea.categories && idea.categories.length > 0 && !idea.project_prizes?.length && (
            <div className="flex flex-wrap gap-2">
              {idea.categories.map((cat, i) => (
                <span key={i} className="pixel-tag">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Action hint */}
          <div className="pixel-card-inset p-3 space-y-2">
            <p className="font-mono text-xs uppercase font-bold text-ink">Controls</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-ink-light">
              <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Skip</span>
              <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Build</span>
              <span className="flex items-center gap-1"><ChevronUp className="w-3 h-3" /> Prev</span>
              <span className="flex items-center gap-1"><ChevronDown className="w-3 h-3" /> Next</span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t-[2px] border-ink p-4 sm:p-5 bg-surface shrink-0">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (!canNavigate()) return;
                onReject(idea);
              }}
              className="pixel-btn-danger flex-1 flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Skip</span>
            </button>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => {
                  if (!canNavigate()) return;
                  onPrev();
                }}
                className="pixel-btn-ghost p-1"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  if (!canNavigate()) return;
                  onNext();
                }}
                className="pixel-btn-ghost p-1"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => {
                if (!canNavigate()) return;
                onAccept(idea);
              }}
              className="pixel-btn-success flex-1 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">Build</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
