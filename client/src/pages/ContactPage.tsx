import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  Check
} from 'lucide-react';
import GlassNavbar from '../components/home/GlassNavbar';
import MagicBento from '../components/common/MagicBento';

export default function ContactPage() {
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    role: 'Farmer',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setTimeout(() => setIsSubmitted(true), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-godam-leaf/20 overflow-x-hidden relative">
      <GlassNavbar />
      
      {/* Global Background - Blur Light Green */}
      <div className="fixed inset-0 bg-godam-leaf/5 -z-50 pointer-events-none" />
      <div className="fixed -top-40 -right-40 w-[800px] h-[800px] bg-green-200/40 rounded-full blur-[100px] -z-40 pointer-events-none animate-pulse" />
      <div className="fixed bottom-0 -left-20 w-[600px] h-[600px] bg-godam-leaf/10 rounded-full blur-[120px] -z-40 pointer-events-none" />

      {/* 1. Header & Mechanism Section */}
      <section className="relative pt-16 pb-8 lg:pt-20 lg:pb-16 overflow-hidden min-h-[85vh] flex flex-col justify-center">
         {/* Background Elements */}
         <div className="absolute top-0 inset-x-0 h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-godam-leaf/10 rounded-full blur-[100px] animate-pulse"></div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6"
            >
              One Platform. <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-godam-forest">Total Impact.</span>
            </motion.h1>
            {/* Tagline removed */}

            {/* Mechanism Visualization Cards - Replaced with MagicBento */}
            <div className="w-full">
               <MagicBento 
                 textAutoHide={true}
                 enableStars
                 enableSpotlight
                 enableBorderGlow={true}
                 enableTilt={false}
                 enableMagnetism={false}
                 clickEffect
                 spotlightRadius={400}
                 particleCount={12}
                 glowColor="72, 161, 17"
                 disableAnimations={false}
               />
            </div>
         </div>
      </section>

      {/* 2. Contact Form Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                
                {/* Contact Info Side - Replaced with Logo */}
                <div className="bg-gradient-to-br from-godam-forest to-godam-leaf p-10 md:w-2/5 text-white flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6">
                            <img 
                                src="/logo1.png" 
                                alt="Godam Logo" 
                                className="w-48 h-auto object-contain"
                            />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Godam Solutions</h3>
                        <p className="text-white/80 max-w-xs">
                            Empowering the agricultural supply chain with technology.
                        </p>
                    </div>

                    <div className="mt-12 relative z-10">
                        <div className="flex gap-4">
                            {/* Social Icons */}
                            {[Instagram, Facebook, Twitter].map((Icon, idx) => (
                                <div key={idx} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors flex items-center justify-center backdrop-blur-sm">
                                    <Icon size={20} className="text-white" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className="p-10 md:w-3/5 bg-white relative">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-godam-leaf focus:bg-white focus:ring-0 transition-colors"
                                        placeholder="John Doe"
                                        value={formState.name}
                                        onChange={e => setFormState({...formState, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                    <select 
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-godam-leaf focus:bg-white focus:ring-0 transition-colors"
                                        value={formState.role}
                                        onChange={e => setFormState({...formState, role: e.target.value})}
                                    >
                                        <option>Farmer</option>
                                        <option>Warehouse Manager</option>
                                        <option>Buyer / Trader</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-godam-leaf focus:bg-white focus:ring-0 transition-colors"
                                    placeholder="john@example.com"
                                    value={formState.email}
                                    onChange={e => setFormState({...formState, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea 
                                    rows={4}
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:border-godam-leaf focus:bg-white focus:ring-0 transition-colors resize-none"
                                    placeholder="How can we help you?"
                                    value={formState.message}
                                    onChange={e => setFormState({...formState, message: e.target.value})}
                                />
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-godam-forest text-white rounded-xl font-bold hover:bg-godam-forest/90 transform active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-godam-forest/20"
                            >
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center p-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h3>
                            <p className="text-gray-600 text-lg">
                                Godam Solutions will soon reach out to you!
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
      </section>

      {/* 3. Why Join Revolution - Motivating Footer */}
      <section className="py-24 bg-gray-900 relative overflow-hidden text-white min-h-[600px] flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
         
         <div className="max-w-7xl mx-auto px-4 relative z-10 text-center w-full">
            <AnimatePresence mode="wait">
                {!showPricing ? (
                    <motion.div
                        key="revolution"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100, transition: { duration: 0.4 } }}
                        transition={{ duration: 0.5 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-godam-leaf text-sm font-semibold mb-8 border border-white/5">
                            <Sparkles size={16} /> JOIN THE REVOLUTION
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
                            Be Part of the <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-green-300">Future</span> of Agriculture
                        </h2>
                        
                        <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
                            Every grain saved is a life impact. Join us in building a zero-waste supply chain that empowers farmers and feeds the nation.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => navigate('/auth')}
                                className="px-8 py-4 bg-godam-leaf text-white rounded-full font-bold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg shadow-godam-leaf/25"
                            >
                                Start Your Journey
                            </button>
                            <button 
                                onClick={() => setShowPricing(true)}
                                className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                View Open Positions <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="pricing"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50, transition: { duration: 0.4 } }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <div className="flex items-center justify-between mb-12 px-4">
                             <button 
                                onClick={() => setShowPricing(false)}
                                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                             >
                                <ArrowRight className="rotate-180" size={20} /> Back
                             </button>
                             <h2 className="text-3xl md:text-5xl font-bold text-center flex-1 pr-10">
                                Subscription Models
                             </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
                            
                            {/* Manager Plan - Profitable Basic */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-godam-leaf/30 transition-all group">
                                <div className="mb-3 inline-block px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">
                                    WAREHOUSE MANAGER
                                </div>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-white">₹1,499</span>
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>
                                <p className="text-gray-400 mb-6 text-xs h-8">Essential tools for daily operations and inventory tracking.</p>
                                <ul className="space-y-3 mb-6">
                                    {['Basic Inventory Management', 'Real-time Alerts', 'Spoilage Detection (Basic)', 'Mobile App Access'].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                                            <Check size={14} className="text-blue-400 mt-0.5" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/auth')} className="w-full py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold transition-colors">
                                    Get Started
                                </button>
                            </div>

                            {/* Owner Plan - Profitable Pro */}
                            <div className="bg-gradient-to-b from-gray-800 to-gray-800/50 backdrop-blur-sm border border-godam-leaf/50 rounded-2xl p-6 relative transform md:-translate-y-2 shadow-2xl shadow-godam-leaf/10">
                                <div className="absolute top-0 right-0 bg-godam-leaf text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl">
                                    POPULAR
                                </div>
                                <div className="mb-3 inline-block px-2.5 py-0.5 bg-godam-leaf/10 text-godam-leaf text-[10px] font-bold rounded-full border border-godam-leaf/20">
                                    WAREHOUSE OWNER
                                </div>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-white">₹4,999</span>
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>
                                <p className="text-gray-400 mb-6 text-xs h-8">Complete control with advanced analytics and automation.</p>
                                <ul className="space-y-3 mb-6">
                                    {['Advanced Inventory & Analytics', 'Predictive Spoilage AI', 'Multi-user Access (up to 5)', 'Priority Support', 'Market Pricing Insights'].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                                            <Check size={14} className="text-godam-leaf mt-0.5" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/auth')} className="w-full py-2.5 rounded-lg bg-godam-leaf hover:bg-green-600 text-white text-sm font-bold transition-all shadow-lg shadow-godam-leaf/25">
                                    Start Free Trial
                                </button>
                            </div>

                            {/* Organization Plan - Enterprise */}
                            <div className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition-all group">
                                <div className="mb-3 inline-block px-2.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/20">
                                    ORGANIZATION
                                </div>
                                <div className="mb-4">
                                    <span className="text-3xl font-bold text-white">₹9,999</span>
                                    <span className="text-gray-400 text-sm">/mo</span>
                                </div>
                                <p className="text-gray-400 mb-6 text-xs h-8">Enterprise-grade solutions for large scale operations.</p>
                                <ul className="space-y-3 mb-6">
                                    {['Unlimited Warehouses', 'Custom API Integration', 'Dedicated Account Manager', 'Advanced Security Audit', 'White-label Reports'].map((feat, i) => (
                                        <li key={i} className="flex items-start gap-2 text-gray-300 text-xs">
                                            <Check size={14} className="text-purple-400 mt-0.5" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/auth')} className="w-full py-2.5 rounded-lg bg-gray-700 hover:bg-purple-600/20 hover:text-purple-300 text-white text-sm font-semibold transition-all border border-transparent hover:border-purple-500/50">
                                    Contact Sales
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </section>

    </div>
  );
}
