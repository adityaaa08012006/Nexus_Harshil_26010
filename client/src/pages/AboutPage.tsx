import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Brain, LineChart, Users, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';

export default function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const creators = [
    { name: 'Harshil Biyani', role: 'Creator' },
    { name: 'Aditya Rajput', role: 'Creator' },
    { name: 'Ved Jadhav', role: 'Creator' },
    { name: 'Ansh Dudhe', role: 'Creator' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation - Mobile Responsive */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-20 md:h-28">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Godam Solutions" className="h-16 md:h-24 w-auto object-contain" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className="px-4 lg:px-6 py-3 text-gray-700 text-base lg:text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">Home</Link>
              <Link to="/about" className="px-4 lg:px-6 py-3 text-godam-forest text-base lg:text-lg font-semibold bg-godam-leaf/10 rounded-full transition">About</Link>
              <Link to="/solutions" className="px-4 lg:px-6 py-3 text-gray-700 text-base lg:text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">Solutions</Link>
              <Link to="/contact" className="px-4 lg:px-6 py-3 text-gray-700 text-base lg:text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">Contact</Link>
            </div>

            {/* Desktop Auth Button */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/auth?tab=register" 
                className="px-6 lg:px-8 py-2.5 lg:py-3.5 bg-godam-leaf text-white text-base lg:text-lg rounded-full font-semibold hover:bg-godam-forest transition shadow-lg"
              >
                Log In / Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 border-t border-gray-100"
            >
              <div className="flex flex-col space-y-2 pt-4">
                <Link 
                  to="/" 
                  className="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className="px-4 py-3 text-godam-forest text-base font-semibold bg-godam-leaf/10 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  to="/solutions" 
                  className="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Solutions
                </Link>
                <Link 
                  to="/contact" 
                  className="px-4 py-3 text-gray-700 text-base font-medium hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  to="/auth?tab=register" 
                  className="mx-4 px-6 py-3 bg-godam-leaf text-white text-base rounded-full font-semibold hover:bg-godam-forest transition shadow-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In / Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* About Us Section - Mobile Responsive */}
      <section className="py-8 md:py-16 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Green header with white text - Separate */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:mb-12"
          >
            <div className="bg-gradient-to-br from-godam-forest to-godam-leaf py-8 md:py-12 px-4 md:px-8 rounded-2xl md:rounded-3xl shadow-xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white text-center">ABOUT GODAM AI</h1>
            </div>
          </motion.div>

          {/* About content box */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="max-w-4xl mx-auto">
              {/* Green box with white and yellow text */}
              <div className="bg-gradient-to-br from-godam-forest to-godam-leaf rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-white">Who We Are</h2>
                <p className="text-base md:text-xl leading-relaxed mb-4 md:mb-6 text-white">
                  Godam AI is an intelligent warehouse management platform revolutionizing post-harvest storage 
                  in India. We combine IoT sensors, AI-powered analytics, and real-time monitoring to help 
                  warehouses minimize spoilage and maximize efficiency.
                </p>
                <p className="text-base md:text-xl leading-relaxed mb-4 md:mb-6 text-white">
                  Founded in 2024, we're on a mission to eliminate the <span className="text-godam-sun font-bold">₹92,000 Crore</span> annual loss from 
                  post-harvest waste. Our platform empowers warehouse managers, owners, and supply chain 
                  professionals with data-driven insights and intelligent automation.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                    <Package size={32} className="mx-auto mb-3 md:mb-4 text-godam-sun md:w-10 md:h-10" />
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-godam-forest">Real-Time Monitoring</h3>
                    <p className="text-sm md:text-base text-gray-700">24/7 IoT sensor tracking of temperature, humidity, and conditions</p>
                  </div>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                    <Brain size={32} className="mx-auto mb-3 md:mb-4 text-godam-sun md:w-10 md:h-10" />
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-godam-forest">AI-Powered Intelligence</h3>
                    <p className="text-sm md:text-base text-gray-700">Gemini AI for smart batch allocation and risk prediction</p>
                  </div>
                  <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg">
                    <LineChart size={32} className="mx-auto mb-3 md:mb-4 text-godam-sun md:w-10 md:h-10" />
                    <h3 className="text-lg md:text-xl font-bold mb-2 text-godam-forest">Predictive Analytics</h3>
                    <p className="text-sm md:text-base text-gray-700">Advanced algorithms to prevent spoilage before it happens</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Creators Section - Mobile Responsive */}
      <section className="py-12 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-godam-forest mb-3 md:mb-4">CREATORS</h2>
            <p className="text-base md:text-xl text-gray-600">The team behind Godam AI</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {creators.map((creator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bg-gradient-to-br from-godam-forest to-godam-leaf rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {/* Profile Picture Placeholder */}
                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-4 md:mb-6 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 overflow-hidden">
                  <Users size={64} className="text-white/50 md:w-20 md:h-20" />
                </div>

                {/* Name and Role */}
                <div className="text-center text-white">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{creator.name}</h3>
                  <p className="text-base md:text-lg text-godam-sun font-semibold">{creator.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Mobile Responsive */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src={logo} alt="Godam AI" className="h-12 md:h-16 w-auto mx-auto mb-4 md:mb-6" />
          <p className="text-gray-400 mb-3 md:mb-4 text-sm md:text-base">
            Transforming warehouses, one sensor at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-500">
            <span>© 2026 Godam AI</span>
            <span>•</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
