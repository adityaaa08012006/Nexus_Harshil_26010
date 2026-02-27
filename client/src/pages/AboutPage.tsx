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
  Twitter
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
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-gradient-to-br from-godam-leaf/20 to-transparent rounded-full blur-3xl opacity-60" />
          <div className="absolute top-[40%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-tr from-godam-forest/10 to-transparent rounded-full blur-3xl opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-godam-leaf/10 text-godam-forest text-sm font-semibold tracking-wide mb-6">
              ESTABLISHED 2024
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Story Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 bg-gray-50 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Building2 size={120} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Godam AI began with a simple observation: India's agricultural potential is immense, but its infrastructure is fragmented. 
                We saw warehouses struggling with manual processes, lack of visibility, and preventable spoilage.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                By combining IoT sensors with Gemini-powered AI, we created a platform that doesn't just manage inventory—it protects it. 
                Today, we empower warehouse owners to make decisions that save money and food.
              </p>
            </motion.div>

            {/* Impact Stats */}
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-godam-forest text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden"
              >
                 <div className="absolute -bottom-4 -right-4 bg-white/10 w-32 h-32 rounded-full blur-2xl"></div>
                 <h4 className="text-white/80 text-sm uppercase tracking-wider font-semibold mb-2">Annual Loss Targeted</h4>
                 <div className="text-4xl md:text-5xl font-bold mb-1">₹92k Cr</div>
                 <div className="text-godam-leaf text-sm font-medium">Post-harvest waste</div>
              </motion.div>

              <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.5, delay: 0.2 }}
                 className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">Growth Focus</h4>
                </div>
                <p className="text-gray-600">Scaling to empower 10,000+ warehouses across India by 2030.</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why We Do It</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-godam-leaf/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-700 mb-6">
                  {val.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed">
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
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Godam AI" className="h-8 w-auto opacity-80" />
              <span className="text-sm text-gray-500">© 2026 Godam AI Solutions</span>
            </div>
            <div className="flex gap-8">
               <span className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">Privacy Policy</span>
               <span className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">Terms of Service</span>
               <span className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">Contact</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
