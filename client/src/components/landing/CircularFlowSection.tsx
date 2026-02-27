import { useState, useEffect, useRef } from 'react';
import { Thermometer, Package, FileText, Network, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';

const CircularFlowSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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
      description: "Reduction in spoilage through early detection",
      color: "red-500",
      iconColor: "text-red-500",
      delay: 0
    },
    {
      id: 2,
      icon: Package,
      traditional: "FIFO Causes Stagnation",
      solution: "Freshness-Based Routing",
      metric: "30%",
      description: "Faster turnover of high-risk inventory",
      color: "yellow-500",
      iconColor: "text-orange-500",
      delay: 1
    },
    {
      id: 3,
      icon: FileText,
      traditional: "Manual PDF Processing",
      solution: "AI-Powered Structuring",
      metric: "5x",
      description: "Faster requirement processing with Gemini",
      color: "green-500",
      iconColor: "text-yellow-600",
      delay: 2
    },
    {
      id: 4,
      icon: Network,
      traditional: "Isolated Supply Chains",
      solution: "Connected Network",
      metric: "Real-time",
      description: "Supply-demand matching across markets",
      color: "green-600",
      iconColor: "text-green-600",
      delay: 3
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L30 60 M0 30 L60 30' stroke='%2348A111' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full mb-4">
            <TrendingUp className="w-5 h-5 text-godam-sun animate-bounce" />
            <span className="text-godam-sun font-semibold uppercase text-sm tracking-wider">
              The Solution
            </span>
          </div>
          <h2 className="text-5xl font-bold text-godam-forest mb-4">
            How Godam Transforms Warehouses
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            From traditional to intelligent - see how we solve each critical problem
          </p>
        </div>

        {/* Circular Flow Engine - Horizontal Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Horizontal Flow Container */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-0">
              {/* Solution Nodes */}
              {solutions.map((solution, index) => {
                const Icon = solution.icon;
                const isActive = activeNode === index;
                const isLast = index === solutions.length - 1;

                return (
                  <div key={solution.id} className="relative flex flex-col lg:flex-row items-center">
                    {/* Solution Circle Container */}
                    <div className="flex items-center justify-center z-10">
                    <div 
                      className={`
                        relative transition-all duration-500
                        ${isActive ? 'scale-110' : 'scale-100'}
                      `}
                      onMouseEnter={() => setActiveNode(index)}
                      onMouseLeave={() => setActiveNode(null)}
                    >
                      {/* Outer Glow Ring */}
                      <div 
                        className={`
                          absolute inset-0 rounded-full transition-opacity duration-500
                          ${ isVisible ? 'opacity-100' : 'opacity-0'}
                          bg-${solution.color} blur-2xl
                        `}
                        style={{
                          transitionDelay: `${solution.delay * 300}ms`,
                          animation: isVisible ? 'pulse 3s ease-in-out infinite' : 'none',
                          animationDelay: `${solution.delay * 300}ms`
                        }}
                      />

                      {/* Main Circle */}
                      <div 
                        className={`
                          relative w-64 h-64 lg:w-72 lg:h-72 rounded-full bg-white border-4 cursor-pointer
                          shadow-2xl transform transition-all duration-500 z-10
                          ${isActive ? 'border-godam-leaf shadow-godam-leaf/30 scale-105' : 'border-gray-200'}
                          ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}
                        `}
                        style={{
                          transitionDelay: `${solution.delay * 300}ms`
                        }}
                      >
                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                          {/* Icon with Animated Background */}
                          <div className="relative mb-4">
                            <div className={`absolute inset-0 bg-${solution.color} rounded-full blur-xl opacity-30 animate-pulse`} />
                            <div className={`relative w-16 h-16 lg:w-18 lg:h-18 rounded-full bg-${solution.color} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-8 h-8 lg:w-9 lg:h-9 text-white" />
                            </div>
                          </div>

                          {/* Traditional Label */}
                          <div className="text-center mb-3">
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full mb-1">
                              Traditional
                            </span>
                            <p className="text-gray-500 text-xs line-through">
                              {solution.traditional}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="w-full h-px bg-gray-300 my-2" />

                          {/* Godam Solution Label */}
                          <div className="text-center mb-3">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-godam-leaf text-xs font-semibold rounded-full mb-1">
                              <CheckCircle className="w-3 h-3" />
                              Godam Solution
                            </span>
                            <p className="text-godam-forest font-bold text-base lg:text-lg">
                              {solution.solution}
                            </p>
                          </div>

                          {/* Metric */}
                          <div className={`text-center mt-3 p-3 rounded-xl bg-${solution.color} bg-opacity-10`}>
                            <div className={`text-3xl lg:text-4xl font-bold text-${solution.color} mb-1`}>
                              {solution.metric}
                            </div>
                            <p className="text-gray-600 text-xs font-medium">
                              {solution.description}
                            </p>
                          </div>
                        </div>

                        {/* Rotating Border Effect */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full animate-spin-slow">
                            <div className={`absolute inset-0 rounded-full bg-${solution.color} opacity-20`} style={{ 
                              clipPath: 'polygon(0% 0%, 100% 0%, 100% 2%, 0% 2%)' 
                            }} />
                          </div>
                        )}
                      </div>

                      {/* Number Badge */}
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-godam-leaf flex items-center justify-center shadow-xl z-20">
                        <span className="text-white font-bold text-xl">
                          {solution.id}
                        </span>
                      </div>

                      {/* Checkmark Badge (appears on hover) */}
                      {isActive && (
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shadow-xl z-20 animate-bounceIn">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    </div>

                    {/* Horizontal Connecting Pipe (Hidden on Mobile) */}
                    {!isLast && (
                      <div className="hidden lg:block relative w-24 h-4 mx-2 z-0">
                        {/* Outer Pipe */}
                        <div className="w-full h-4 bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                          {/* Animated Liquid Fill */}
                          <div 
                            className={`
                              absolute left-0 h-full bg-${solution.color}
                              transition-all duration-1000 ease-out
                              ${isVisible ? 'w-full' : 'w-0'}
                            `}
                            style={{
                              transitionDelay: `${solution.delay * 300 + 800}ms`,
                              animation: isVisible ? 'flowPulse 2s ease-in-out infinite' : 'none',
                              animationDelay: `${solution.delay * 300 + 800}ms`
                            }}
                          />
                          
                          {/* Flow Particles */}
                          {isVisible && (
                            <>
                              <div 
                                className="absolute w-2 h-2 bg-white rounded-full animate-flowRight"
                                style={{ 
                                  top: '25%',
                                  animationDelay: `${solution.delay * 300 + 800}ms`
                                }}
                              />
                              <div 
                                className="absolute w-2 h-2 bg-white rounded-full animate-flowRight"
                                style={{ 
                                  top: '75%',
                                  animationDelay: `${solution.delay * 300 + 1300}ms`
                                }}
                              />
                            </>
                          )}
                        </div>
                        
                        {/* Connecting Dots */}
                        <div className="absolute -right-1.5 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-godam-leaf rounded-full shadow-lg" />
                      </div>
                    )}

                    {/* Vertical Pipe for Mobile */}
                    {!isLast && (
                      <div className="lg:hidden relative w-4 h-16 my-4 flex justify-center z-0">
                        <div className="w-4 h-full bg-gray-200 rounded-full relative overflow-hidden shadow-inner">
                          <div 
                            className={`
                              absolute bottom-0 w-full bg-${solution.color}
                              transition-all duration-1000 ease-out
                              ${isVisible ? 'h-full' : 'h-0'}
                            `}
                            style={{
                              transitionDelay: `${solution.delay * 300 + 800}ms`,
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-godam-leaf rounded-full shadow-lg" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <div className="mt-20 text-center">
          <div className="max-w-4xl mx-auto bg-godam-leaf rounded-3xl p-12 shadow-2xl">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Sparkles className="w-12 h-12 text-white" />
              <h3 className="text-4xl font-bold text-white">
                Complete Transformation
              </h3>
            </div>
            <p className="text-white/90 text-xl mb-8">
              From manual, reactive systems to intelligent, predictive warehouse management
            </p>
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-2">20%</div>
                <p className="text-white/80 text-sm">Less Spoilage</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-2">5x</div>
                <p className="text-white/80 text-sm">Faster Processing</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-2">30%</div>
                <p className="text-white/80 text-sm">Better Turnover</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-bold text-white mb-2">100%</div>
                <p className="text-white/80 text-sm">Connected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes flowDown {
          0% {
            top: -10%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            top: 110%;
            opacity: 0;
          }
        }

        .animate-flowDown {
          animation: flowDown 2s linear infinite;
        }

        @keyframes flowRight {
          0% {
            left: -10%;
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            left: 110%;
            opacity: 0;
          }
        }

        .animate-flowRight {
          animation: flowRight 2s linear infinite;
        }

        @keyframes flowPulse {
          0%, 100% {
            opacity: 0.8;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounceIn {
          animation: bounceIn 0.5s ease-out;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CircularFlowSection;
