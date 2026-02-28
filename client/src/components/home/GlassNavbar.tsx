import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/public/logo1.png";

export default function GlassNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-white shadow-md border-b border-gray-100 ${
        isScrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <img
                src={logo}
                alt="Godam Solutions"
                className="relative h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {["Home", "About", "Solutions", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="px-5 py-2 text-gray-700 font-medium hover:bg-[#48A111] hover:text-white rounded-lg transition-all duration-200"
              >
                <span>{item}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Auth Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/auth?tab=register"
              className="px-6 py-2.5 bg-[#25671E] hover:bg-[#1e5318] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Log In / Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 border border-gray-200 transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={28} className="text-gray-700" />
            ) : (
              <Menu size={28} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            mobileMenuOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
            {["Home", "About", "Solutions", "Contact"].map((item) => (
              <Link
                key={item}
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="px-4 py-3 text-gray-700 text-lg font-medium hover:bg-gray-50 rounded-xl transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <Link
              to="/auth?tab=register"
              className="mt-4 px-4 py-3 bg-gradient-to-r from-godam-leaf to-godam-forest text-white text-lg font-semibold rounded-xl text-center shadow-lg hover:shadow-xl transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              Log In / Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
