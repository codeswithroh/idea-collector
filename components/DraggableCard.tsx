"use client";

import { useState, useRef, useCallback } from "react";

interface DraggableCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function DraggableCard({ children, className }: DraggableCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeHint, setSwipeHint] = useState<"left" | "right" | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const isMouseDown = useRef(false);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    isMouseDown.current = true;
    startX.current = clientX;
    startY.current = clientY;
    setIsDragging(true);
    setSwipeHint(null);
  }, []);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isMouseDown.current) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    const clampedX = Math.max(-120, Math.min(120, dx));
    const clampedY = Math.max(-60, Math.min(60, dy));

    setOffsetX(clampedX);
    setOffsetY(clampedY);

    if (Math.abs(dx) > 40) {
      setSwipeHint(dx > 0 ? "right" : "left");
    } else {
      setSwipeHint(null);
    }
  }, []);

  const handleEnd = useCallback(() => {
    isMouseDown.current = false;
    setIsDragging(false);
    setSwipeHint(null);
    setOffsetX(0);
    setOffsetY(0);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const rotate = offsetX * 0.08;
  const scale = isDragging ? 1.03 : 1;

  return (
    <div
      className={`relative ${className || ""}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={handleEnd}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotate}deg) scale(${scale})`,
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* Swipe hints */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          swipeHint === "right" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-sage border-[3px] border-white px-6 py-3 rotate-[-8deg] shadow-pixel rounded-card">
          <span className="font-mono font-bold text-xl text-white uppercase">
            BUILD THIS
          </span>
        </div>
      </div>
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${
          swipeHint === "left" ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="bg-red-700 border-[3px] border-white px-6 py-3 rotate-[8deg] shadow-pixel rounded-card">
          <span className="font-mono font-bold text-xl text-white uppercase">
            SKIP
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
