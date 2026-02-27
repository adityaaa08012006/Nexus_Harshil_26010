import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-godam-forest/5 py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-godam-leaf rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-gradient-to-br from-godam-forest to-godam-leaf p-2.5 rounded-xl">
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-heading font-bold text-lg transition-colors duration-300 ${isScrolled ? "text-godam-forest" : "text-white"}`}
              >
                Godam Solutions
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-[0.15em] transition-colors duration-300 ${isScrolled ? "text-godam-leaf" : "text-godam-sun"}`}
              >
                Smart Warehouse, Zero Waste
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {[
              { label: "Home", action: () => scrollTo("hero") },
              { label: "Solutions", action: () => scrollTo("solution") },
              { label: "How It Works", action: () => scrollTo("workflow") },
              { label: "Impact", action: () => scrollTo("impact") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                  isScrolled
                    ? "text-gray-600 hover:text-godam-forest hover:bg-godam-forest/5"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-godam-sun rounded-full transition-all duration-300 group-hover:w-6" />
              </button>
            ))}
            <Link
              to="/about"
              className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
                isScrolled
                  ? "text-gray-600 hover:text-godam-forest hover:bg-godam-forest/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              About
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-godam-sun rounded-full transition-all duration-300 group-hover:w-6" />
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              to="/auth"
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                isScrolled
                  ? "text-godam-forest hover:bg-godam-forest/5"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/auth?tab=register"
              className="px-6 py-2.5 bg-gradient-to-r from-godam-forest to-godam-leaf text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-godam hover:shadow-godam-lg hover:scale-[1.03] active:scale-[0.98]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2.5 rounded-xl transition-colors ${isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10"}`}
          >
            <svg
              className={`w-5 h-5 transition-colors ${isScrolled ? "text-godam-forest" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-400 ease-in-out overflow-hidden ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 px-4 py-6 space-y-1 shadow-xl">
          {[
            { label: "Home", action: () => scrollTo("hero") },
            { label: "Solutions", action: () => scrollTo("solution") },
            { label: "How It Works", action: () => scrollTo("workflow") },
            { label: "Impact", action: () => scrollTo("impact") },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="block w-full text-left px-4 py-3 text-gray-700 hover:text-godam-forest hover:bg-godam-forest/5 rounded-xl transition-all font-medium"
            >
              {item.label}
            </button>
          ))}
          <Link
            to="/about"
            className="block px-4 py-3 text-gray-700 hover:text-godam-forest hover:bg-godam-forest/5 rounded-xl transition-all font-medium"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <Link
              to="/auth"
              className="block w-full text-center px-4 py-3 text-godam-forest font-semibold rounded-xl hover:bg-godam-forest/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/auth?tab=register"
              className="block w-full text-center px-4 py-3 bg-gradient-to-r from-godam-forest to-godam-leaf text-white font-semibold rounded-xl shadow-godam"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
