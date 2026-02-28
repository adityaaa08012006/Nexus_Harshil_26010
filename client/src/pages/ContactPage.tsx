import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Sprout, 
  Store, 
  ShoppingCart,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import GlassNavbar from '../components/home/GlassNavbar';

export default function ContactPage() {
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

  const steps = [
    {
      icon: <Sprout size={32} />,
      title: "For Farmers",
      desc: "Register your harvest, get real-time market prices, and find the nearest certified warehouse.",
      color: "bg-green-100 text-green-600",
      step: "01"
    },
    {
        icon: <Store size={32} />,
        title: "For Managers",
        desc: "Digitize inventory, monitor spoilage risks via IoT, and automate space allocation.",
        color: "bg-blue-100 text-blue-600",
        step: "02"
    },
    {
        icon: <ShoppingCart size={32} />,
        title: "For Buyers",
        desc: "Source quality-assured produce directly from warehouses with complete traceability.",
        color: "bg-purple-100 text-purple-600",
        step: "03"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-godam-leaf/20 overflow-x-hidden">
      <GlassNavbar />
      
      {/* 1. Header & Mechanism Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-0 inset-x-0 h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-godam-leaf/10 rounded-full blur-[100px] animate-pulse"></div>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-8"
            >
              How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-godam-forest">Works</span>
            </motion.h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-16">
              A unified ecosystem connecting every stakeholder in the supply chain.
            </p>

            {/* Mechanism Visualization Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 -z-10"></div>

               {steps.map((step, idx) => (
                 <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.2 }}
                   className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative group hover:-translate-y-2 transition-transform duration-300"
                 >
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 mx-auto text-current shadow-sm group-hover:scale-110 transition-transform`}>
                       {step.icon}
                    </div>
                    <div className="absolute top-6 right-6 text-4xl font-bold text-gray-100 font-serif select-none">
                        {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                        {step.desc}
                    </p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* 2. Contact Form Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                
                {/* Contact Info Side */}
                <div className="bg-gradient-to-br from-godam-forest to-godam-leaf p-10 md:w-2/5 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                        <p className="text-white/80 mb-8 leading-relaxed">
                            Have questions? We'd love to hear from you. Fill out the form or reach us directly.
                        </p>
                        
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Phone size={18} />
                                </div>
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Mail size={18} />
                                </div>
                                <span>contact@godam.ai</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <MapPin size={18} />
                                </div>
                                <span>Pune, Maharashtra, India</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 relative z-10">
                        <div className="flex gap-4">
                            {/* Social Icons Placeholder */}
                            {[1,2,3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 cursor-pointer transition-colors"></div>
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
      <section className="py-24 bg-gray-900 relative overflow-hidden text-white">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
         
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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
                    <button className="px-8 py-4 bg-godam-leaf text-white rounded-full font-bold hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg shadow-godam-leaf/25">
                        Start Your Journey
                    </button>
                    <button className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        View Open Positions <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
         </div>
      </section>

    </div>
  );
}
