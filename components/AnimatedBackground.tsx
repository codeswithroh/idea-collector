"use client";

import { useEffect, useRef } from "react";

interface Shape {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  type: "square" | "circle" | "triangle";
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shapesRef = useRef<Shape[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#FFE500", "#FF006E", "#3A86FF"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize shapes
    const initShapes = () => {
      const shapes: Shape[] = [];
      const count = Math.floor(window.innerWidth / 150); // responsive count
      for (let i = 0; i < count; i++) {
        shapes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 20 + Math.random() * 60,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: ["square", "circle", "triangle"][Math.floor(Math.random() * 3)] as Shape["type"],
        });
      }
      shapesRef.current = shapes;
    };
    initShapes();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    let frameId = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "rgba(0, 0, 0, 0.04)";
      ctx.lineWidth = 1;
      const gridSize = 60;

      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw shapes
      shapesRef.current.forEach((shape) => {
        // Mouse parallax effect
        const dx = (mouseRef.current.x - canvas.width / 2) * 0.02;
        const dy = (mouseRef.current.y - canvas.height / 2) * 0.02;

        shape.x += shape.speedX + dx * 0.1;
        shape.y += shape.speedY + dy * 0.1;
        shape.rotation += shape.rotationSpeed;

        // Wrap around
        if (shape.x < -shape.size) shape.x = canvas.width + shape.size;
        if (shape.x > canvas.width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = canvas.height + shape.size;
        if (shape.y > canvas.height + shape.size) shape.y = -shape.size;

        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate((shape.rotation * Math.PI) / 180);
        ctx.fillStyle = shape.color;
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;

        if (shape.type === "square") {
          ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
        } else if (shape.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (shape.type === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -shape.size / 2);
          ctx.lineTo(shape.size / 2, shape.size / 2);
          ctx.lineTo(-shape.size / 2, shape.size / 2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
