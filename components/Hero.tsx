"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Lightbulb, Zap, Layers, MousePointer2, Hand, Sparkles } from "lucide-react";
import DraggableCard from "./DraggableCard";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="min-h-screen flex items-center bg-cream relative overflow-hidden">
      {/* Subtle warm grain texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="pixel-badge-copper inline-flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              20,000+ Ideas Available
            </div>

            <h1 className="pixel-heading text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-ink">
              Swipe.
              <br />
              <span className="bg-copper px-3 py-1 text-white">Build.</span>
              <br />
              Ship.
            </h1>

            <p className="text-lg sm:text-xl max-w-lg leading-relaxed text-ink-light">
              Discover thousands of real startup ideas from YC and Web3 hackathons. 
              Swipe through like cards, save the ones you want to build, and start
              shipping today.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => router.push("/feed")}
                className="pixel-btn-primary flex items-center gap-3 text-lg"
              >
                Start Swiping
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => router.push("/build")}
                className="pixel-btn-secondary flex items-center gap-3 text-lg"
              >
                My Build List
                <Lightbulb className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-6 text-sm font-mono text-ink-light">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-copper rounded-full" />
                <span>YC + Web3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-sage rounded-full" />
                <span>Real Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-copper-light rounded-full" />
                <span>Free</span>
              </div>
            </div>
          </div>

          {/* Interactive Draggable Card */}
          <div className="relative">
            <div className="absolute -top-3 -right-3 z-30 pixel-badge-copper text-xs flex items-center gap-1">
              <Hand className="w-3 h-3" />
              Drag me!
            </div>

            <DraggableCard className="rotate-1">
              <div className="pixel-card p-6 sm:p-8 space-y-6 bg-surface-raised">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-ink-light">Featured Idea</span>
                  <div className="pixel-badge-copper">DeFi</div>
                </div>
                <h3 className="pixel-heading text-2xl text-ink">
                  NatStream — Oracle-Driven Dynamic Fee AMM
                </h3>
                <p className="text-sm leading-relaxed text-ink-light">
                  A Uniswap V4 hook that implements asymmetric fee and bonus
                  mechanism to mitigate LVR for volatile commodity asset pairs using
                  Flare&apos;s Data Connector.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Solidity", "Uniswap V4", "LayerZero"].map((tag) => (
                    <span key={tag} className="pixel-tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pixel-border bg-surface-raised p-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-ink-light">Prize Winner</span>
                  <span className="font-mono font-bold text-copper">Flare Network</span>
                </div>
              </div>
            </DraggableCard>

            <div className="pixel-card p-4 absolute -bottom-4 -right-4 bg-copper -rotate-2 max-w-[200px] z-10">
              <p className="font-mono text-xs font-bold text-white uppercase">
                Swipe Right to Build This
              </p>
            </div>

            {/* Floating cursor indicator */}
            <div className="absolute -top-2 left-8 animate-bounce">
              <MousePointer2 className="w-5 h-5 text-ink" />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Layers,
              title: "Scroll Through Ideas",
              desc: "Browse 20,000+ real startup projects like scrolling cards. Every swipe is a new idea.",
              color: "bg-copper",
            },
            {
              icon: Zap,
              title: "Swipe to Decide",
              desc: "Drag right to accept an idea (BUILD), drag left to skip. Fast, intuitive, Tinder-style.",
              color: "bg-red-700",
            },
            {
              icon: Lightbulb,
              title: "Track Your Builds",
              desc: "All accepted ideas go to your Build List. Track status, add notes, and ship projects.",
              color: "bg-sage",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="pixel-card p-6 hover:shadow-pixel-lg transition-all duration-150 bg-surface-raised"
              >
                <div
                  className={`w-12 h-12 ${feature.color} border-[2px] border-ink rounded-badge flex items-center justify-center mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="pixel-heading text-lg mb-2 text-ink">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink-light">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
