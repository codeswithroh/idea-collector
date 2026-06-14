"use client";

import { useState, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import IdeaCard from "@/components/IdeaCard";
import { Loader2, AlertCircle, Lightbulb, Sparkles } from "lucide-react";

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

interface SeenEntry {
  id: number;
  source: string;
}

export default function FeedPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const getLocalStorage = () => {
    if (typeof window === "undefined") return { accepted: [] as SeenEntry[], rejected: [] as SeenEntry[] };
    const rawAccepted = JSON.parse(localStorage.getItem("accepted_ideas") || "[]");
    const rawRejected = JSON.parse(localStorage.getItem("rejected_ideas") || "[]");

    const accepted = rawAccepted.map((item: any) =>
      typeof item === "number" ? { id: item, source: "ethglobal" } : item
    );
    const rejected = rawRejected.map((item: any) =>
      typeof item === "number" ? { id: item, source: "ethglobal" } : item
    );

    return { accepted, rejected };
  };

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/ideas?page=1&limit=50");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const { accepted, rejected } = getLocalStorage();
      const seenSet = new Set(
        [...accepted, ...rejected].map((e: SeenEntry) => `${e.source}:${e.id}`)
      );
      const filtered = data.ideas.filter((idea: Idea) => !seenSet.has(`${idea.source}:${idea.id}`));

      setIdeas(filtered);
      setAcceptedCount(accepted.length);
      setRejectedCount(rejected.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ideas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const saveToLocalStorage = (key: string, entry: SeenEntry) => {
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const isDuplicate = existing.some(
      (item: any) =>
        (typeof item === "number" && item === entry.id) ||
        (item.id === entry.id && item.source === entry.source)
    );
    if (!isDuplicate) {
      localStorage.setItem(key, JSON.stringify([...existing, entry]));
    }
  };

  const handleAccept = useCallback(
    async (idea: Idea) => {
      try {
        const response = await fetch("/api/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId: idea.id,
            source: idea.source,
            action: "accept",
            idea: {
              id: idea.id,
              source: idea.source,
              title: idea.title,
              description: idea.description,
              url: idea.url,
              event: idea.event,
              project_prizes: idea.project_prizes,
            },
          }),
        });
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        saveToLocalStorage("accepted_ideas", { id: idea.id, source: idea.source });
        setAcceptedCount((c) => c + 1);
        setCurrentIndex((prev) => prev + 1);
      } catch (e) {
        console.error("Failed to save to MongoDB:", e);
      }
    },
    []
  );

  const handleReject = useCallback((idea: Idea) => {
    saveToLocalStorage("rejected_ideas", { id: idea.id, source: idea.source });
    setRejectedCount((c) => c + 1);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, ideas.length - 1));
  }, [ideas.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleReset = () => {
    localStorage.removeItem("accepted_ideas");
    localStorage.removeItem("rejected_ideas");
    setCurrentIndex(0);
    setAcceptedCount(0);
    setRejectedCount(0);
    fetchIdeas();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Navigation />
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-copper" />
          <p className="font-mono text-sm uppercase text-ink-light">Loading Ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Navigation />
        <div className="pixel-card p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-700" />
          <h2 className="pixel-heading text-xl mb-2">Something Broke</h2>
          <p className="text-sm mb-4 text-ink-light">{error}</p>
          <button onClick={fetchIdeas} className="pixel-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentIdea = ideas[currentIndex];
  const isFinished = !currentIdea && ideas.length > 0;
  const isEmpty = ideas.length === 0;

  // Get up to 3 next ideas for the stack back
  const backIdeas = ideas.slice(currentIndex + 1, currentIndex + 4);

  return (
    <div className="min-h-screen bg-cream overflow-hidden">
      <Navigation />

      <div className="relative z-10">
        {/* Stats Bar */}
        <div className="fixed top-14 left-0 right-0 z-40 bg-surface-raised border-b-[2px] border-ink">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-ink">
                <span className="font-bold">{currentIndex + 1}</span> /{" "}
                {ideas.length}
              </span>
              <span className="font-mono text-xs text-sage">
                {acceptedCount} accepted
              </span>
              <span className="font-mono text-xs text-red-700">
                {rejectedCount} skipped
              </span>
            </div>
            <div className="w-24 sm:w-32 h-2 border-[2px] border-ink bg-surface-inset rounded-badge overflow-hidden">
              <div
                className="h-full bg-copper transition-all duration-300"
                style={{ width: `${ideas.length > 0 ? ((currentIndex + 1) / ideas.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Feed - Card Stack */}
        <main className="pt-24 h-screen flex items-center justify-center px-4 sm:px-6">
          {isFinished || isEmpty ? (
            <div className="pixel-card p-8 max-w-md text-center bg-surface-raised">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-copper" />
              <h2 className="pixel-heading text-2xl mb-4">
                {isFinished ? "All Ideas Viewed!" : "No New Ideas"}
              </h2>
              <p className="text-sm mb-2 text-ink-light">
                You&apos;ve gone through {ideas.length} ideas.
              </p>
              <p className="text-sm mb-6">
                <span className="font-bold text-sage">{acceptedCount}</span>{" "}
                ideas saved to your Build List.
              </p>
              <div className="flex flex-col gap-3">
                <a href="/build" className="pixel-btn-primary block">
                  View Build List
                </a>
                <button onClick={handleReset} className="pixel-btn-secondary">
                  Start Over (Clear History)
                </button>
              </div>
            </div>
          ) : currentIdea ? (
            <div
              className="relative w-full max-w-2xl h-[75vh] sm:h-[80vh]"
              style={{ perspective: "900px", transformStyle: "preserve-3d" }}
            >
              {/* 3D Stack backs with depth rotation */}
              {backIdeas.map((backIdea, idx) => {
                const depth = backIdeas.length - idx;
                const scale = 1 - depth * 0.04;
                const translateY = depth * 12;
                const opacity = 1 - depth * 0.3;
                const rotateX = depth * 2;
                const rotateY = (depth % 2 === 0 ? 1 : -1) * depth * 3;
                const rotateZ = (depth % 2 === 0 ? -1 : 1) * depth * 1.5;

                return (
                  <div
                    key={`${backIdea.source}:${backIdea.id}`}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `scale(${scale}) translateY(-${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
                      opacity: Math.max(opacity, 0.25),
                      zIndex: -depth,
                      pointerEvents: "none",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div className="w-full h-full border-[2px] border-ink/40 rounded-card bg-surface-inset overflow-hidden shadow-pixel">
                      <div className="h-12 bg-surface border-b-[2px] border-ink/40" />
                      <div className="p-4">
                        <div className="h-3 bg-surface-inset rounded-badge w-3/4 mb-2" />
                        <div className="h-3 bg-surface-inset rounded-badge w-1/2" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Active Card */}
              <div className="absolute inset-0 z-10">
                <IdeaCard
                  idea={currentIdea}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onNext={handleNext}
                  onPrev={handlePrev}
                />
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
