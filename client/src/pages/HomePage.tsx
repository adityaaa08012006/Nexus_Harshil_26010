import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/public/logo1.png";
import GlassNavbar from '../components/home/GlassNavbar';
import { 
  Leaf,
  TrendingUp,
  Shield,
  Users,
  CheckCircle,
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Package,
  Star
} from 'lucide-react';
// import ProblemStatementSection from '../components/landing/ProblemStatementSection';
import CircularFlowSection from '../components/landing/CircularFlowSection';
import PotentialUsersCarousel from '../components/landing/PotentialUsersCarousel';
import HeroSlider from '../components/home/HeroSlider';
import SplitText from '../components/home/SplitText';
import BlurText from '../components/home/BlurText';

export default function HomePage() {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  const handleBlurAnimationComplete = () => {
    console.log('Animation completed!');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Navigation - Mobile Responsive */}
      <GlassNavbar />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Potential Users Carousel */}
      <PotentialUsersCarousel />

      {/* About Section - Mobile Responsive */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Images */}
            <div className="relative order-2 md:order-1">
              <div className="w-full aspect-square rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600" 
                  alt="Warehouse" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400" 
                  alt="Agriculture" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <BlurText
                text="ABOUT US"
                delay={100}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleBlurAnimationComplete}
                className="text-godam-sun font-semibold mb-2 text-sm md:text-base"
              />
              <SplitText
                text="Warehouse & Organic Post-Harvest Solutions"
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-godam-forest mb-4 md:mb-6"
                delay={50}
                duration={1.25}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
                tag="h2"
                onLetterAnimationComplete={handleAnimationComplete}
                showCallback
              />
              <BlurText
                text="India loses millions in post-harvest waste annually. Godam Solutions transforms traditional warehouses into intelligent optimization hubs using IoT sensors, AI-powered allocation, and real-time monitoring."
                delay={100}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleBlurAnimationComplete}
                className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed"
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-godam-sun bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="text-godam-sun" size={20} />
                  </div>
                  <div>
                    <BlurText
                      text="Growing Smartly"
                      delay={100}
                      animateBy="words"
                      direction="top"
                      className="font-bold text-godam-forest mb-1 text-sm md:text-base"
                    />
                    <BlurText
                      text="Optimized storage capacity utilization"
                      delay={100}
                      animateBy="words"
                      direction="top"
                      className="text-xs md:text-sm text-gray-600"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-godam-leaf bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-godam-leaf" size={20} />
                  </div>
                  <div>
                    <BlurText
                      text="Top-tier Efficiency"
                      delay={100}
                      animateBy="words"
                      direction="top"
                      className="font-bold text-godam-forest mb-1 text-sm md:text-base"
                    />
                    <BlurText
                      text="20% reduction in spoilage waste"
                      delay={100}
                      animateBy="words"
                      direction="top"
                      className="text-xs md:text-sm text-gray-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="text-godam-leaf flex-shrink-0" size={20} />
                <BlurText
                  text="Trusted by 50+ warehouses across India"
                  delay={100}
                  animateBy="words"
                  direction="top"
                  className="text-sm md:text-base text-gray-700"
                />
              </div>

              <button className="mt-6 md:mt-8 w-full sm:w-auto px-6 md:px-8 py-2.5 md:py-3 bg-godam-leaf text-white rounded-full font-bold hover:bg-godam-forest transition shadow-lg text-sm md:text-base">
                Discover More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Showcase - Animated Version */}
      {/* <ProblemStatementSection /> */}
      {/* TODO: Problem Statement Section - To be implemented later */}

      {/* The Godam Solutions Difference - Circular Flow Engine */}
      <CircularFlowSection />

      {/* Old Cards Section - Hidden */}
      <section className="hidden py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-godam-sun font-semibold mb-2 text-lg">THE SOLUTION</p>
            <h2 className="text-5xl font-bold text-godam-forest mb-4">How Godam Transforms Warehouses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From traditional to intelligent - see how we solve each critical problem</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <TrendingUp className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Manual Temperature Checks</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <CheckCircle className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Real-Time Sensor Monitoring</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">20%</div>
                  <div className="text-sm text-gray-600">Reduction in spoilage through early detection</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Package className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">FIFO Causes Stagnation</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <Shield className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Freshness-Based Routing</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">30%</div>
                  <div className="text-sm text-gray-600">Faster turnover of high-risk inventory</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Mail className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Manual PDF Processing</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <Star className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">AI-Powered Structuring</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">5x</div>
                  <div className="text-sm text-gray-600">Faster requirement processing with Gemini API</div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Users className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Isolated Supply Chains</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <CheckCircle className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Connected Network</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">Real-Time</div>
                  <div className="text-sm text-gray-600">Supply-demand matching across stakeholders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Call to Action Hub */}
      <section className="py-10 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-godam-forest mb-4">Ready to Transform Your Warehouse?</h2>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">Choose your path to get started with Godam Solutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "For Judges & Evaluators",
                desc: "Explore the live demo and see our technical implementation",
                cta: "View Live Demo",
                icon: Shield,
                link: "/dashboard"
              },
              {
                title: "For Warehouse Operators",
                desc: "Schedule a consultation to discuss your specific needs",
                cta: "Schedule Call",
                icon: Users,
                link: "#contact"
              },
              {
                title: "For Investors & Partners",
                desc: "Download our pitch deck and business plan",
                cta: "Download Pitch",
                icon: TrendingUp,
                link: "#pitch"
              }
            ].map((card, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl md:rounded-3xl bg-gray-50 border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-godam-leaf opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 p-6 md:p-8">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-godam-leaf rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-white group-hover:bg-opacity-20 transition">
                    <card.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-godam-forest mb-3 group-hover:text-white transition">{card.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 group-hover:text-white group-hover:text-opacity-90 transition">{card.desc}</p>
                  <Link 
                    to={card.link}
                    className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-godam-leaf text-white rounded-full font-bold hover:bg-white hover:text-godam-forest transition shadow-lg group-hover:bg-white group-hover:text-godam-forest text-sm md:text-base"
                  >
                    {card.cta}
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-16 bg-godam-leaf rounded-2xl md:rounded-3xl p-6 md:p-12 text-center text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Join the Agricultural Revolution</h3>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-white text-opacity-90 max-w-3xl mx-auto">
              Help us eliminate ₹92,651 crores in annual post-harvest losses and build a sustainable future for Indian agriculture.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
              <Link to="/auth" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-godam-forest rounded-full font-bold hover:bg-gray-100 transition shadow-lg text-base md:text-lg">
                Get Started Free
              </Link>
              <a href="mailto:contact@godamsolutions.com" className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white bg-opacity-20 text-white rounded-full font-bold hover:bg-opacity-30 transition border-2 border-white text-base md:text-lg">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-10 md:pt-16 pb-6 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8 md:mb-12">
            {/* Company Info */}
            <div className="sm:col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <img src={logo} alt="Godam AI" className="h-10 md:h-12 w-auto" />
              </div>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Intelligent post-harvest warehouse optimization for reducing agricultural losses and maximizing efficiency.
              </p>
              <div className="flex gap-3">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-9 h-9 md:w-10 md:h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-godam-leaf transition"
                  >
                    <span className="sr-only">{social}</span>
                    <span className="text-sm">●</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Explore</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {['About', 'Solutions', 'Team', 'Portfolio', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-godam-leaf transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* News */}
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">News</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                {['Blog', 'Recent News', 'FAQ', 'Terms & Conditions'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-godam-leaf transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>Green Building, Mumbai 400001, Maharashtra, India</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>support@godamsolutions.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={16} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
              © 2026 <span className="text-godam-leaf">Godam Solutions</span>. All Rights Reserved.
            </p>
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <a href="#" className="hover:text-godam-leaf transition">Privacy Policy</a>
              <a href="#" className="hover:text-godam-leaf transition">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
