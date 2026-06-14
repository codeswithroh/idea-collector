"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/Navigation";
import {
  Lightbulb,
  Trash2,
  ExternalLink,
  Plus,
  Circle,
  Clock,
  Rocket,
  Sparkles,
} from "lucide-react";

interface AcceptedIdea {
  _id: string;
  ideaId: number;
  source?: string;
  idea: {
    id: number;
    source?: string;
    title: string;
    description: string;
    url: string;
    event: string;
    project_prizes?: Array<{ name: string }>;
  };
  status: "not_started" | "building" | "built";
  notes: string;
  createdAt: string;
}

const statusConfig = {
  not_started: {
    label: "Not Started",
    icon: Circle,
    color: "bg-surface-raised",
    textColor: "text-ink",
    activeBorder: "border-ink",
    inactiveBorder: "border-ink",
    inactiveColor: "bg-surface-inset",
  },
  building: {
    label: "Building",
    icon: Clock,
    color: "bg-copper",
    textColor: "text-white",
    activeBorder: "border-ink",
    inactiveBorder: "border-ink",
    inactiveColor: "bg-surface-raised",
  },
  built: {
    label: "Shipped",
    icon: Rocket,
    color: "bg-sage",
    textColor: "text-white",
    activeBorder: "border-ink",
    inactiveBorder: "border-ink",
    inactiveColor: "bg-surface-raised",
  },
};

export default function BuildPage() {
  const [accepted, setAccepted] = useState<AcceptedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "not_started" | "building" | "built">("all");

  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const statusCooldownRef = useRef<Record<number, number>>({});
  const removeCooldownRef = useRef<Record<number, number>>({});

  const fetchAccepted = async () => {
    try {
      const response = await fetch("/api/accept");
      const data = await response.json();
      if (data.accepted) {
        setAccepted(data.accepted);
      }
    } catch (e) {
      console.error("Failed to fetch:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccepted();
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, []);

  const updateStatus = async (ideaId: number, ideaSource: string | undefined, newStatus: string) => {
    // Prevent clicks if ideaId is missing (corrupted data)
    if (ideaId === undefined || ideaId === null) {
      console.error("Cannot update status: ideaId is missing");
      return;
    }
    const now = Date.now();
    if (statusCooldownRef.current[ideaId] && now - statusCooldownRef.current[ideaId] < 1000) {
      return;
    }
    statusCooldownRef.current[ideaId] = now;

    // Store old status for potential revert
    const oldStatus = accepted.find((item) => item.ideaId === ideaId)?.status;

    // Optimistic update
    setAccepted((prev) =>
      prev.map((item) =>
        item.ideaId === ideaId ? { ...item, status: newStatus as any } : item
      )
    );

    try {
      const response = await fetch("/api/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          source: ideaSource || "ethglobal",
          action: "accept",
          status: newStatus,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        console.error("Failed to update status:", errorData.error || response.statusText);
        // Revert on failure
        if (oldStatus) {
          setAccepted((prev) =>
            prev.map((item) =>
              item.ideaId === ideaId ? { ...item, status: oldStatus as any } : item
            )
          );
        }
        return;
      }
    } catch (e) {
      console.error("Failed to update status:", e);
      // Revert on failure
      if (oldStatus) {
        setAccepted((prev) =>
          prev.map((item) =>
            item.ideaId === ideaId ? { ...item, status: oldStatus as any } : item
          )
        );
      }
    }
  };

  const updateNotes = async (ideaId: number, ideaSource: string | undefined, notes: string) => {
    setAccepted((prev) =>
      prev.map((item) =>
        item.ideaId === ideaId ? { ...item, notes } : item
      )
    );

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    notesTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideaId,
            source: ideaSource || "ethglobal",
            action: "accept",
            notes,
          }),
        });
        if (!response.ok) {
          console.error("Failed to update notes:", response.statusText);
        }
      } catch (e) {
        console.error("Failed to update notes:", e);
      }
    }, 500);
  };

  const removeIdea = async (ideaId: number, ideaSource: string | undefined) => {
    const now = Date.now();
    if (removeCooldownRef.current[ideaId] && now - removeCooldownRef.current[ideaId] < 1000) {
      return;
    }
    removeCooldownRef.current[ideaId] = now;

    try {
      const response = await fetch("/api/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ideaId,
          source: ideaSource || "ethglobal",
          action: "reject",
        }),
      });
      if (!response.ok) {
        console.error("Failed to remove:", response.statusText);
        return;
      }

      const existing = JSON.parse(localStorage.getItem("accepted_ideas") || "[]");
      localStorage.setItem(
        "accepted_ideas",
        JSON.stringify(
          existing.filter((item: any) => {
            if (typeof item === "number") return item !== ideaId;
            return !(item.id === ideaId && item.source === (ideaSource || "ethglobal"));
          })
        )
      );

      setAccepted((prev) => prev.filter((item) => item.ideaId !== ideaId));
    } catch (e) {
      console.error("Failed to remove:", e);
    }
  };

  const filtered =
    filter === "all"
      ? accepted
      : accepted.filter((item) => item.status === filter);

  const stats = {
    total: accepted.length,
    not_started: accepted.filter((i) => i.status === "not_started").length,
    building: accepted.filter((i) => i.status === "building").length,
    built: accepted.filter((i) => i.status === "built").length,
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <div className="relative z-10">
        <main className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="pixel-card p-6 mb-8 bg-surface-raised">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-copper border-[2px] border-ink rounded-badge flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="pixel-heading text-2xl text-ink">My Build List</h1>
                    <p className="font-mono text-xs text-ink-muted">
                      {stats.total} ideas saved
                    </p>
                  </div>
                </div>
                <a href="/feed" className="pixel-btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Find More Ideas
                </a>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {(
                  [
                    ["total", "Total", "bg-surface-raised"],
                    ["not_started", "Not Started", "bg-surface-raised"],
                    ["building", "Building", "bg-copper text-white"],
                    ["built", "Shipped", "bg-sage text-white"],
                  ] as const
                ).map(([key, label, color]) => (
                  <div
                    key={key}
                    className={`pixel-border p-3 ${color} ${key === "built" || key === "building" ? "" : ""}`}
                  >
                    <p className="font-mono text-xs uppercase text-ink-muted">{label}</p>
                    <p className="pixel-heading text-2xl mt-1 text-ink">
                      {stats[key as keyof typeof stats]}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(
                [
                  ["all", "All"],
                  ["not_started", "Not Started"],
                  ["building", "Building"],
                  ["built", "Shipped"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`font-mono text-xs px-4 py-2 rounded-btn border-[2px] transition-all duration-100 ${
                    filter === key
                      ? "bg-ink text-white border-ink shadow-pixel-sm"
                      : "bg-surface-raised text-ink border-transparent hover:border-ink hover:shadow-pixel-sm"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Ideas Grid */}
            {loading ? (
              <div className="text-center py-12">
                <p className="font-mono text-sm uppercase text-ink-light">Loading...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="pixel-card p-12 text-center bg-surface-raised">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-ink-muted" />
                <h3 className="pixel-heading text-xl mb-2 text-ink">
                  {accepted.length === 0
                    ? "No Ideas Saved Yet"
                    : "No Ideas in This Status"}
                </h3>
                <p className="text-sm text-ink-muted mb-4">
                  {accepted.length === 0
                    ? "Start swiping to save ideas you want to build."
                    : "Try a different filter or go back to the feed."}
                </p>
                <a href="/feed" className="pixel-btn-primary">
                  Go to Feed
                </a>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((item) => {
                  const status = statusConfig[item.status as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || Circle;

                  return (
                    <div
                      key={item._id || item.ideaId}
                      className="pixel-card flex flex-col hover:shadow-pixel-lg transition-all duration-150 bg-surface-raised"
                    >
                      {/* Card Header */}
                      <div className="pixel-border border-t-0 border-x-0 p-4 bg-surface flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="pixel-heading text-sm break-words text-ink">
                            {item.idea.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeIdea(item.ideaId, item.source || item.idea?.source)}
                          className="pixel-btn-ghost p-1 flex-shrink-0"
                          title="Remove from list"
                        >
                          <Trash2 className="w-4 h-4 text-red-700" />
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 space-y-3">
                        <p className="text-sm leading-relaxed line-clamp-3 text-ink-light">
                          {item.idea.description}
                        </p>

                        {item.idea.project_prizes &&
                          item.idea.project_prizes.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {item.idea.project_prizes.map((prize, i) => (
                                <span
                                  key={i}
                                  className="pixel-badge-copper text-[10px] py-0.5"
                                >
                                  {prize.name}
                                </span>
                              ))}
                            </div>
                          )}

                        {/* Status Selector */}
                        <div className="flex gap-2">
                          {(
                            [
                              ["not_started", "Start"],
                              ["building", "Build"],
                              ["built", "Ship"],
                            ] as const
                          ).map(([statusKey, label]) => {
                            const isActive = item.status === statusKey;
                            const config =
                              statusConfig[statusKey as keyof typeof statusConfig];
                            const Icon = config.icon;

                            return (
                              <button
                                key={statusKey}
                                onClick={() => updateStatus(item.ideaId, item.source || item.idea?.source, statusKey)}
                                className={`font-mono text-xs flex-1 flex items-center justify-center gap-1 py-2 rounded-btn border-[2px] transition-all duration-100 ${
                                  isActive
                                    ? `${config.color} ${config.textColor} shadow-pixel-sm ${config.activeBorder}`
                                    : `${config.inactiveColor || "bg-surface-raised"} text-ink ${config.inactiveBorder} hover:bg-surface`
                                }`}
                              >
                                <Icon className="w-3 h-3" />
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Notes */}
                        <textarea
                          value={item.notes || ""}
                          onChange={(e) => updateNotes(item.ideaId, item.source || item.idea?.source, e.target.value)}
                          placeholder="Add notes, todos, ideas..."
                          className="pixel-input w-full text-xs min-h-[60px] resize-none"
                        />

                        {/* Link */}
                        <a
                          href={item.idea.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pixel-btn-secondary w-full flex items-center justify-center gap-2 text-xs py-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Project
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
