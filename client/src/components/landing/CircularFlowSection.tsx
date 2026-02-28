import { useState, useEffect, useRef } from 'react';
import { Thermometer, Package, FileText, Network, CheckCircle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

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
      themeColor: "text-red-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      iconBg: "bg-red-100",
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
      themeColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      iconBg: "bg-yellow-100",
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
      themeColor: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      iconBg: "bg-green-100",
      delay: 2
    },
    {
      id: 4,
      icon: Network,
      traditional: "Isolated Supply Chains",
      solution: "Connected Network",
      metric: "100%",
      metricLabel: "Real-Time Sync",
      description: "Seamless demand matching across all nodes.",
      themeColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      iconBg: "bg-blue-100",
      delay: 3
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-20 md:py-24 bg-white relative overflow-hidden font-sans"
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-godam-leaf/5 blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-godam-sun/5 blur-3xl opacity-50" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {solutions.map((item, index) => {
            const Icon = item.icon;

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
                {/* Card Container */}
                <div className="relative bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-godam-leaf/10 transition-shadow duration-300 flex flex-col h-full overflow-hidden">
                  
                  {/* Top: Traditional (Problem) */}
                  <div className={`p-8 ${item.bgColor} relative h-48 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                        <Icon className={`w-6 h-6 ${item.themeColor}`} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 bg-white/60 px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
                        Traditional
                      </span>
                    </div>
                    
                    <div className="relative z-10 mt-2">
                        <h3 className="text-gray-500 font-medium text-base relative inline-block">
                            <span className="relative z-10">{item.traditional}</span>
                            <span className="absolute left-0 top-1/2 w-full h-0.5 bg-red-300 transform -rotate-2 origin-left"></span>
                        </h3>
                    </div>
                    
                    {/* Transformation Arrow Circle */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-50 z-20 group-hover:scale-110 transition-transform duration-500">
                      <ArrowRight className={`w-5 h-5 ${item.themeColor}`} />
                    </div>
                  </div>

                  {/* Bottom: Solution */}
                  <div className={`p-8 pt-12 flex-grow flex flex-col justify-between bg-white`}>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className={`w-5 h-5 ${item.themeColor}`} />
                            <span className={`text-xs font-bold ${item.themeColor} uppercase tracking-wide`}>Godam Solution</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight min-h-[3.5rem]">
                            {item.solution}
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            {item.description}
                        </p>
                    </div>

                    {/* Metric Highlight */}
                    <div className={`
                        mt-auto py-4 px-5 rounded-2xl border border-dashed flex items-center justify-between
                        ${item.borderColor} bg-white
                        hover:bg-opacity-50 transition-colors
                    `}>
                        <div>
                            <span className={`block text-2xl font-bold ${item.themeColor} mb-0.5`}>
                                {item.metric}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                {item.metricLabel}
                            </span>
                        </div>
                        <TrendingUp className={`w-5 h-5 ${item.themeColor}`} />
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
