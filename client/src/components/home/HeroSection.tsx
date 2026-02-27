import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f1419 0%, #162415 25%, #25671E 55%, #1a2e1a 85%, #0f1419 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Floating orbs – brand colors */}
      <div className="absolute top-20 left-[10%] w-80 h-80 bg-godam-leaf rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-float" />
      <div className="absolute top-40 right-[10%] w-72 h-72 bg-godam-forest rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-float-delayed" />
      <div className="absolute -bottom-10 left-1/3 w-64 h-64 bg-godam-sun rounded-full mix-blend-screen filter blur-[100px] opacity-15 animate-float" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div
            className={`inline-flex items-center space-x-2.5 px-5 py-2.5 rounded-full border transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
            style={{
              background: "rgba(72, 161, 17, 0.1)",
              borderColor: "rgba(72, 161, 17, 0.25)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-godam-leaf opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-godam-leaf" />
            </span>
            <span className="text-godam-leaf text-sm font-medium tracking-wide">
              Revolutionizing Post-Harvest Operations
            </span>
          </div>

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white leading-[1.1] transition-all duration-1000 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Saving the Earth,
            <br />
            <span className="text-gradient-godam">One Harvest at a Time</span>
          </h1>

          {/* Sub-headline */}
          <p
            className={`max-w-2xl mx-auto text-lg sm:text-xl text-gray-300/90 leading-relaxed font-body transition-all duration-1000 delay-[400ms] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            Transform your warehouse with{" "}
            <span className="text-godam-leaf font-semibold">
              AI-powered optimization
            </span>
            . Monitor conditions in real-time, predict spoilage, and reduce
            waste by <span className="text-godam-sun font-semibold">20%</span>.
          </p>

          {/* Feature pills */}
          <div
            className={`flex flex-wrap justify-center gap-4 transition-all duration-1000 delay-[600ms] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            {[
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                ),
                label: "Real-Time",
                sub: "Monitoring",
                borderColor: "rgba(72, 161, 17, 0.3)",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                ),
                label: "AI-Powered",
                sub: "Risk Scoring",
                borderColor: "rgba(242, 181, 11, 0.3)",
              },
              {
                icon: (
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                ),
                label: "Smart",
                sub: "Allocation",
                borderColor: "rgba(72, 161, 17, 0.3)",
              },
            ].map((pill, i) => (
              <div
                key={i}
                className="flex items-center space-x-3 px-5 py-3 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:scale-105 group cursor-default"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderColor: pill.borderColor,
                }}
              >
                <div className="text-godam-leaf group-hover:scale-110 transition-transform">
                  {pill.icon}
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold text-sm leading-tight">
                    {pill.label}
                  </div>
                  <div className="text-gray-400 text-xs">{pill.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-[800ms] ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <Link
              to="/auth?tab=register"
              className="group px-8 py-4 bg-godam-forest text-white font-heading font-semibold rounded-2xl shadow-godam-lg transition-all duration-300 hover:scale-[1.04] hover:shadow-godam active:scale-[0.97] flex items-center space-x-2"
            >
              <span>Get Started Free</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("solution")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group px-8 py-4 bg-white/5 backdrop-blur-md hover:bg-white/10 text-white font-heading font-semibold rounded-2xl border border-white/20 hover:border-white/40 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Watch Demo</span>
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* Trust line */}
          <p
            className={`text-sm text-gray-500 font-body transition-all duration-1000 delay-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            No credit card required &bull; 14-day free trial &bull; Cancel
            anytime
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <button
          onClick={() =>
            document
              .getElementById("problem")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="flex flex-col items-center space-y-1 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Scroll down"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
            Scroll
          </span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
