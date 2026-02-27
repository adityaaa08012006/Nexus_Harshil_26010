import { useState, useEffect, useRef } from 'react';
import { Thermometer, Package, FileText, Network, CheckCircle, TrendingUp, Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';

const CircularFlowSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      id: 1,
      icon: Thermometer,
      traditional: "Manual Temperature Checks",
      solution: "Real-Time Sensor Monitoring",
      metric: "20%",
      metricLabel: "Less Spoilage",
      description: "Auto-alerts prevent spoilage before it happens.",
      color: "red",
      themeColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      delay: 0
    },
    {
      id: 2,
      icon: Package,
      traditional: "FIFO Causes Stagnation",
      solution: "Freshness-Based Routing",
      metric: "30%",
      metricLabel: "Better Turnover",
      description: "AI prioritizes items based on actual shelf life.",
      color: "yellow",
      themeColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      delay: 1
    },
    {
      id: 3,
      icon: FileText,
      traditional: "Manual PDF Processing",
      solution: "AI-Powered Structuring",
      metric: "5x",
      metricLabel: "Faster Processing",
      description: "Instantly digitize invoices & receipts with Gemini.",
      color: "green",
      themeColor: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      delay: 2
    },
    {
      id: 4,
      icon: Network,
      traditional: "Isolated Supply Chains",
      solution: "Connected Network",
      metric: "100%",
      metricLabel: "Real-time Sync",
      description: "Seamless demand matching across all nodes.",
      color: "blue",
      themeColor: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      delay: 3
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-24 bg-white relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-godam-leaf/5 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-godam-sun/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-godam-leaf/10 border border-godam-leaf/20 rounded-full mb-6 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-godam-leaf" />
            <span className="text-godam-forest font-semibold uppercase text-xs tracking-wider">
              The Transformation
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-godam-forest mb-6 tracking-tight animate-fade-in-up delay-100">
            From Traditional to <span className="text-godam-leaf relative inline-block">
              Intelligent
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-godam-leaf/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto animate-fade-in-up delay-200">
            See how Godam revolutionizes every step of your warehouse operations with AI-driven solutions.
          </p>
        </div>

        {/* Process Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          
          {solutions.map((item, index) => {
            const Icon = item.icon;
            // Calculations for staggered animation
            const delayClass = `delay-${index * 100}`; 

            return (
              <div 
                key={item.id}
                className={`
                  group relative flex flex-col h-full
                  transform transition-all duration-700 ease-out
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
                `}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Connecting Line (Desktop) */}
                {index < solutions.length - 1 && (
                  <div className="hidden lg:block absolute top-[28%] -right-5 w-10 h-[2px] bg-gray-100 z-0">
                    <div className={`
                      h-full bg-godam-leaf/50 origin-left transition-transform duration-1000 ease-out
                      ${isVisible ? 'scale-x-100' : 'scale-x-0'}
                    `} style={{ transitionDelay: `${index * 150 + 500}ms` }} />
                  </div>
                )}

                {/* Card Container */}
                <div className="relative bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-godam-leaf/10 transition-shadow duration-300 flex flex-col h-full overflow-hidden">
                  
                  {/* Top: Traditional (Problem) */}
                  <div className={`p-6 ${item.bgColor} relative`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Icon className={`w-6 h-6 ${item.themeColor}`} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-white/60 px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Traditional
                      </span>
                    </div>
                    <div className="min-h-[3rem] flex items-center">
                        <h3 className="text-gray-500 font-medium text-sm line-through decoration-red-300 decoration-2">
                            {item.traditional}
                        </h3>
                    </div>
                    
                    {/* Transformation Arrow Circle */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-50 z-10 group-hover:scale-110 group-hover:rotate-90 transition-all duration-500">
                      <ArrowRight className={`w-4 h-4 ${item.themeColor}`} />
                    </div>
                  </div>

                  {/* Bottom: Solution */}
                  <div className={`p-6 pt-10 flex-grow flex flex-col justify-between bg-white`}>
                    <div>
                        <div className="inline-flex items-center gap-1.5 mb-2">
                            <CheckCircle className={`w-4 h-4 ${item.themeColor}`} />
                            <span className={`text-xs font-bold ${item.themeColor} uppercase tracking-wide`}>Godam Solution</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-godam-forest transition-colors min-h-[3.5rem] flex items-center justify-center">
                            {item.solution}
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed mb-4 min-h-[3rem]">
                            {item.description}
                        </p>
                    </div>

                    {/* Metric Highlight */}
                    <div className={`
                        mt-4 py-3 px-4 rounded-xl border border-dashed flex items-center justify-between
                        ${item.borderColor} bg-opacity-30
                        group-hover:bg-opacity-100 transition-all
                    `}>
                        <div>
                            <span className={`block text-xl font-bold ${item.themeColor}`}>
                                {item.metric}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase">
                                {item.metricLabel}
                            </span>
                        </div>
                        <TrendingUp className={`w-5 h-5 ${item.themeColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translate3d(0, 40px, 0);
            }
            to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
            }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0; 
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </section>
  );
};

export default CircularFlowSection;
