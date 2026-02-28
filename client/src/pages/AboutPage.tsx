import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  ShieldCheck, 
  Award,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassNavbar from '../components/home/GlassNavbar';
import logo from '../assets/public/logo1.png';

const creators = [
  { 
    name: 'Harshil Biyani', 
    role: 'Full Stack Developer',
    description: 'Visionary architect behind the Godam core system.',
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  { 
    name: 'Aditya Rajput', 
    role: 'AI/ML Engineer',
    description: 'The brain behind our predictive inventory models.',
    color: 'bg-purple-50 text-purple-600 border-purple-100'
  },
  { 
    name: 'Ved Jadhav', 
    role: 'Frontend Specialist',
    description: 'Crafting intuitive user experiences for managers.',
    color: 'bg-pink-50 text-pink-600 border-pink-100'
  },
  { 
    name: 'Ansh Dudhe', 
    role: 'Backend Architect',
    description: 'Ensuring scalable and secure infrastructure.',
    color: 'bg-orange-50 text-orange-600 border-orange-100'
  },
];

const values = [
  {
    icon: <Target className="w-6 h-6" />,
    title: "Mission Driven",
    description: "Laser-focused on reducing post-harvest losses in India's agricultural sector."
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    title: "Innovation First",
    description: "Leveraging cutting-edge AI and IoT to solve age-old logistics problems."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "People Centric",
    description: "Empowering warehouse owners and farmers with accessible technology."
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-godam-leaf/20">
      <GlassNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-white/50 via-transparent to-white/80 pointer-events-none"></div>
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-br from-godam-leaf/10 to-transparent rounded-full blur-[100px] opacity-40 animate-pulse" />
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-godam-forest/5 to-transparent rounded-full blur-[100px] opacity-40 animate-pulse duration-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-godam-leaf/10 text-godam-forest text-sm font-semibold tracking-wide mb-6">
              ESTABLISHED 2026
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8">
              Revolutionizing <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-godam-forest">
                Warehouse Logistics
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
              We are on a mission to eliminate the <span className="font-bold text-gray-900">₹92,000 Crore</span> annual post-harvest loss through intelligent, data-driven storage solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      {/* Our Story & Stats Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Story Card */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-14 shadow-xl shadow-gray-100/50 relative overflow-hidden group border border-gray-100 hover:shadow-2xl hover:shadow-godam-leaf/5 transition-all duration-500 h-full flex flex-col justify-center"
            >
              {/* Blur Green Effects */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-godam-leaf/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 group-hover:bg-godam-leaf/20 transition-colors duration-700"></div>
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-godam-leaf/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 group-hover:bg-godam-leaf/20 transition-colors duration-700"></div>

              <div className="absolute top-10 right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-700 transform group-hover:scale-110">
                <Building2 size={180} />
              </div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  Our Story
                  <span className="h-2 w-2 rounded-full bg-godam-leaf animate-pulse"></span>
                </h3>
                
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  Godam AI began with a simple observation: India's agricultural potential is immense, but its infrastructure is fragmented. 
                  We saw warehouses struggling with <span className="text-godam-forest font-medium bg-godam-leaf/10 px-1 rounded">manual processes</span>, lack of visibility, and preventable spoilage.
                </p>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                 Our mission evolved into building an <strong>Intelligent Post-Harvest Warehouse Optimization Framework</strong>. By integrating <span className="text-godam-forest font-medium bg-godam-leaf/10 px-1 rounded">environmental monitoring</span>, batch-level inventory tracking, and spoilage risk scoring, we bridge the gap between farmers, warehouse managers, and buyers.
                </p>
                
                <p className="text-gray-600 text-lg leading-relaxed">
                  By combining <span className="text-godam-forest font-medium bg-godam-leaf/10 px-1 rounded">IoT sensors</span> with <span className="text-godam-forest font-medium bg-godam-leaf/10 px-1 rounded">Gemini-powered AI</span>, we created a platform that doesn't just manage inventory—it protects it. 
                  Today, Godam Solutions is not just a platform; it's a decision-making hub that minimizes waste and maximizes value for the entire supply chain.
                </p>
              </div>
            </motion.div>

            {/* Right Column - Reimagined Impact Stats */}
            <div className="lg:mt-0 flex flex-col gap-6 h-full"> 
              
              {/* Crisis Donut Chart Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 relative overflow-hidden flex-1 flex flex-col justify-center group"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-red-50/50 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shadow-sm shrink-0">
                            <TrendingUp size={20} className="transform rotate-180" />
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-gray-400">The Crisis</div>
                            <div className="text-lg font-bold text-gray-900 leading-tight">Post-Harvest Loss</div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center py-4">
                        <div className="relative w-32 h-32">
                           <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                              {/* Background Circle */}
                              <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.8" />
                              {/* Foreground Circle (40%) */}
                              <motion.path 
                                initial={{ strokeDasharray: "0, 100" }}
                                whileInView={{ strokeDasharray: "40, 100" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="text-red-500 drop-shadow-md" 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="3.8" 
                                strokeLinecap="round"
                              />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-2xl font-bold text-gray-900">40%</span>
                              <span className="text-[10px] text-gray-500 font-medium">Wasted</span>
                           </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-2">Annual loss of <span className="font-bold text-red-600">₹92,000 Cr</span> due to poor infrastructure.</p>
                 </div>
              </motion.div>

              {/* Solution Impact Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 relative overflow-hidden flex-1 flex flex-col justify-center group"
              >
                 {/* Strong Blur Green Background */}
                 <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-godam-leaf/10 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                 
                 {/* Stat 2: Growth Chart */}
                 <div className="relative z-10 w-full group/item">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-godam-leaf text-white flex items-center justify-center shadow-lg shadow-godam-leaf/20 shrink-0">
                         <Building2 size={20} />
                       </div>
                       <div>
                         <div className="text-xs uppercase tracking-wider font-bold text-gray-400">Our Solution</div>
                         <div className="text-lg font-bold text-gray-900 leading-none">Smart Storage</div>
                       </div>
                     </div>
                   </div>
                   
                   {/* Animated Bar Chart */}
                   <div className="h-28 flex items-end justify-between gap-2 px-2 pb-2 mt-4 relative">
                      {[
                        { year: '24', val: 15, label: '50' },
                        { year: '26', val: 35, label: '500' },
                        { year: '28', val: 65, label: '2.5k' },
                        { year: '30', val: 100, label: '10k' }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 w-full h-full justify-end relative z-10">
                           <div className="relative w-full max-w-[30px] h-[80%] flex items-end bg-gray-50 rounded-t-lg overflow-hidden">
                              <motion.div 
                                initial={{ height: "0%" }}
                                whileInView={{ height: `${bar.val}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 1.2, delay: 0.2 + (idx * 0.2), ease: "easeOut" }}
                                className={`w-full rounded-t-lg ${idx === 3 ? 'bg-gradient-to-t from-godam-forest to-godam-leaf' : 'bg-green-200'}`}
                              />
                           </div>
                           <span className={`text-[9px] font-bold ${idx === 3 ? 'text-godam-forest' : 'text-gray-400'}`}>{bar.year}</span>
                        </div>
                      ))}
                   </div>
                 </div>

              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
        <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-godam-leaf/20 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-godam-forest/15 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
           <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">"To Feed the World, We Must First <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-godam-forest">Stop Wasting It.</span>"</h2>
            <p className="text-lg text-gray-600">Our core values drive every line of code, every sensor deployed, and every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="relative overflow-hidden bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-godam-leaf/10 hover:border-godam-leaf/30 hover:shadow-md transition-all"
              >
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-godam-leaf/20 blur-2xl" />
                <div className="absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-godam-forest/15 blur-2xl" />
                <div className="relative z-10 w-12 h-12 bg-godam-leaf/10 rounded-xl flex items-center justify-center text-godam-forest mb-6">
                  {val.icon}
                </div>
                <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                <p className="relative z-10 text-gray-600 leading-relaxed">
                  {val.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Meet The Creators</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A diverse team of engineers and visionaries working together to solve India's storage crisis.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {creators.map((creator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl ${creator.color} flex items-center justify-center mb-6`}>
                  <Users size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1">{creator.name}</h3>
                <p className={`text-sm font-semibold mb-4 ${creator.color.split(' ')[1]}`}>{creator.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {creator.description}
                </p>

                <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-4 border-t border-gray-50">
                   <a href="#" className="text-gray-400 hover:text-gray-600"><Github size={18} /></a>
                   <a href="#" className="text-gray-400 hover:text-blue-600"><Linkedin size={18} /></a>
                   <a href="#" className="text-gray-400 hover:text-sky-500"><Twitter size={18} /></a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Modernize Your Warehouse?</h2>
          <p className="text-gray-400 text-lg mb-8">Join the network of smart warehouses powered by Godam AI.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link 
               to="/auth?tab=register" 
               className="px-8 py-3 bg-godam-leaf text-white font-semibold rounded-full hover:bg-godam-forest transition-colors flex items-center justify-center gap-2"
             >
               Get Started <ArrowRight size={18} />
             </Link>
             <Link 
               to="/contact" 
               className="px-8 py-3 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
             >
               Contact Sales
             </Link>
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
