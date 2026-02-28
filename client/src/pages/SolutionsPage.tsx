import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Tractor, 
  Warehouse, 
  ClipboardCheck, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck, 
  Thermometer, 
  Truck, 
  Coins, 
  Cpu, 
  Smartphone,
  ScanLine
} from 'lucide-react';
import GlassNavbar from '../components/home/GlassNavbar';

// Data for Solutions
const solutionsData = [
  {
    role: "For Farmers",
    icon: <Tractor className="w-12 h-12 text-white" />,
    description: "Empowering growers with market access and storage intelligence.",
    color: "from-green-500 to-emerald-700",
    features: [
      {
        title: "Fair Price Discovery",
        desc: "Real-time visibility into market rates to ensure fair compensation.",
        icon: <Coins className="w-6 h-6 text-emerald-600" />
      },
      {
        title: "Storage Availability",
        desc: "Instant check for nearby warehouse space for specific crops.",
        icon: <Warehouse className="w-6 h-6 text-emerald-600" />
      },
      {
        title: "Crop Health Monitoring",
        desc: "Receive alerts if stored produce shows signs of spoilage.",
        icon: <Smartphone className="w-6 h-6 text-emerald-600" />
      }
    ]
  },
  {
    role: "For Warehouse Managers",
    icon: <Warehouse className="w-12 h-12 text-white" />,
    description: "Optimizing operations with AI-driven inventory management.",
    color: "from-blue-500 to-indigo-700",
    features: [
      {
        title: "Smart Allocation",
        desc: "AI algorithms suggest optimal storage locations based on shelf life.",
        icon: <Cpu className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "Spoilage Prediction",
        desc: "Proprietary 'Risk Score' to identify at-risk batches early.",
        icon: <BarChart3 className="w-6 h-6 text-indigo-600" />
      },
      {
        title: "IoT Integration",
        desc: "Seamless connection with temperature and humidity sensors.",
        icon: <Thermometer className="w-6 h-6 text-indigo-600" />
      }
    ]
  },
  {
    role: "For Quality Inspectors",
    icon: <ClipboardCheck className="w-12 h-12 text-white" />,
    description: "Streamlining audits with digital verification and remote monitoring.",
    color: "from-amber-500 to-orange-700",
    features: [
      {
        title: "Remote Audits",
        desc: "Verify storage conditions without physical site visits.",
        icon: <ScanLine className="w-6 h-6 text-orange-600" />
      },
      {
        title: "Digital Compliance",
        desc: "Automated logging of environmental data for regulatory standards.",
        icon: <ShieldCheck className="w-6 h-6 text-orange-600" />
      },
      {
        title: "Batch Traceability",
        desc: "Full history tracking from farm usage to dispatch.",
        icon: <Truck className="w-6 h-6 text-orange-600" />
      }
    ]
  },
  {
    role: "For Buyers & Traders",
    icon: <ShoppingCart className="w-12 h-12 text-white" />,
    description: "Ensuring quality and consistent supply for market demands.",
    color: "from-purple-500 to-pink-700",
    features: [
      {
        title: "Quality Assurance",
        desc: "Access detailed sensor history logs before purchasing.",
        icon: <ShieldCheck className="w-6 h-6 text-pink-600" />
      },
      {
        title: "Supply Forecasting",
        desc: "Predictive analytics on upcoming harvest availability.",
        icon: <BarChart3 className="w-6 h-6 text-pink-600" />
      },
      {
        title: "Direct Sourcing",
        desc: "Connect directly with storage facilities to reduce intermediaries.",
        icon: <Truck className="w-6 h-6 text-pink-600" />
      }
    ]
  }
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 selection:bg-godam-leaf/20 font-sans overflow-x-hidden">
      <GlassNavbar />
      
      {/* Header Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 text-center z-10">
         <div className="absolute top-0 inset-x-0 h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-godam-leaf/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-godam-forest/10 rounded-full blur-[100px]"></div>
         </div>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6"
        >
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-godam-leaf to-godam-forest">Solutions</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Tailored technology for every stakeholder in the agricultural value chain.
        </motion.p>
      </section>

      {/* Solutions Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-24 pb-32">
        {solutionsData.map((data, index) => (
          <SolutionSection key={index} data={data} index={index} />
        ))}
      </div>

    </div>
  );
}

function SolutionSection({ data, index }: { data: any, index: number }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const xLeft = useTransform(scrollYProgress, [0, 1], [-50, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  const isEven = index % 2 === 0;

  return (
    <motion.div 
      ref={ref}
      style={{ opacity }}
      className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-stretch min-h-[400px]`}
    >
      {/* User Type Card (Large) */}
      <motion.div 
        className={`flex-1 relative overflow-hidden rounded-[2.5rem] p-10 flex flex-col justify-between shadow-2xl group transition-all duration-500 hover:shadow-godam-leaf/20`}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${data.color} opacity-90 transition-all duration-500 group-hover:scale-105`}></div>
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        
        <div className="relative z-10">
           <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-white/10">
             {data.icon}
           </div>
           <h2 className="text-4xl font-bold text-white mb-4">{data.role}</h2>
           <p className="text-white/90 text-lg leading-relaxed font-medium">
             {data.description}
           </p>
        </div>

        <div className="relative z-10 mt-8">
           <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold hover:bg-white hover:text-gray-900 transition-all flex items-center gap-2 group/btn">
             Learn More <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
           </button>
        </div>
      </motion.div>

      {/* Features Grid (Right/Left side) */}
      <div className="flex-[1.5] grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.features.map((feature: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 + 0.2 }}
            className={`bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 group/card relative overflow-hidden ${idx === 2 ? 'md:col-span-2 md:w-3/4 md:mx-auto' : ''}`}
          >
             <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full -z-0 group-hover/card:scale-110 transition-transform"></div>
             
             <div className="relative z-10 mb-4 inline-block p-3 rounded-xl bg-gray-50 group-hover/card:bg-godam-leaf/10 transition-colors">
               {feature.icon}
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2 relative z-10">{feature.title}</h3>
             <p className="text-gray-500 text-sm leading-relaxed relative z-10 group-hover/card:text-gray-700 transition-colors">
               {feature.desc}
             </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
