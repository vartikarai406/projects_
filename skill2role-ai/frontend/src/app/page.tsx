import Link from "next/link";
import { ArrowRight, Brain, Target, Map, Sparkles, Code2, LineChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Navbar */}
      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-white/10 sticky top-0 bg-black/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 font-bold text-2xl tracking-tighter">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span>Skill2Role AI</span>
        </div>
        <nav className="ml-auto flex gap-6">
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-gray-400 hover:text-white transition-colors" href="/demo">
            Live Demo
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden relative">
          {/* Background Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300 mb-8">
              <Sparkles className="mr-2 h-4 w-4" />
              Your AI Career Intelligence Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Know where your <br className="hidden md:block" /> skills can take you.
            </h1>
            
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl mb-10 leading-relaxed">
              Skill2Role AI turns your resume, skills, and career goals into a personalized path from where you are to where you want to be.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full bg-white text-black px-8 text-sm font-bold shadow-lg transition-all hover:scale-105"
              >
                Analyze My Career
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-full border border-white/20 bg-white/5 px-8 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Explore Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 bg-zinc-950 border-t border-white/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Intelligence at every step</h2>
              <p className="text-gray-400 max-w-[600px] mx-auto">
                We analyze the gap between your current profile and your dream role, then give you the exact steps to cross it.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Skill DNA Analysis</h3>
                <p className="text-gray-400 leading-relaxed">
                  Extracts verified skills from your resume and builds a visual DNA profile of your technical strengths.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">The "Next Best Skill"</h3>
                <p className="text-gray-400 leading-relaxed">
                  Uses AI to calculate the single most valuable skill you should learn next to maximize your employability.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors group">
                <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Map className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Actionable Roadmaps</h3>
                <p className="text-gray-400 leading-relaxed">
                  Generates personalized 4, 8, and 12-week learning roadmaps complete with project milestones.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© 2024 Skill2Role AI. Production MVP.</p>
      </footer>
    </div>
  );
}
