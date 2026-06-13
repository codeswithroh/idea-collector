import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navigation />
      <div className="relative z-10">
        <main className="pt-14">
          <Hero />

          {/* Footer */}
          <footer className="border-t-[2px] border-ink bg-ink text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div>
                  <h4 className="font-mono font-bold uppercase text-sm mb-4">
                    StackForge
                  </h4>
                  <p className="text-sm text-ink-muted">
                    Built for builders who want to ship. Swipe, save, and build the
                    next big thing.
                  </p>
                </div>
                <div>
                  <h4 className="font-mono font-bold uppercase text-sm mb-4">
                    Data Source
                  </h4>
                  <p className="text-sm text-ink-muted">
                    20,000+ real projects from YC and ETHGlobal hackathons worldwide.
                  </p>
                </div>
                <div>
                  <h4 className="font-mono font-bold uppercase text-sm mb-4">
                    Tech Stack
                  </h4>
                  <p className="text-sm text-ink-muted">
                    Next.js 14 + React + MongoDB + Tailwind CSS
                  </p>
                </div>
                <div>
                  <h4 className="font-mono font-bold uppercase text-sm mb-4">
                    Open Source
                  </h4>
                  <p className="text-sm text-ink-muted">
                    Fork it, build on it, make it yours.
                  </p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-ink-light">
                <p className="font-mono text-xs text-ink-muted">
                  © 2025 StackForge. Built with Neo-Skeuo and caffeine.
                </p>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
