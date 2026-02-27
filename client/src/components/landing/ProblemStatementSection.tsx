import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, TrendingDown, XCircle, Clock, FileSpreadsheet, Package, Users, AlertCircle } from 'lucide-react';

const ProblemStatementSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lossCounter, setLossCounter] = useState(0);
  const [wastePercentage, setWastePercentage] = useState(0);
  const [expandedProblem, setExpandedProblem] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animated counter effect
  useEffect(() => {
    if (!isVisible) return;

    const lossTarget = 92651;
    const wasteTarget = 35;
    const duration = 2000;
    const steps = 60;
    const lossIncrement = lossTarget / steps;
    const wasteIncrement = wasteTarget / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setLossCounter(Math.min(Math.floor(lossIncrement * currentStep), lossTarget));
      setWastePercentage(Math.min(Math.floor(wasteIncrement * currentStep), wasteTarget));

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible]);

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

  const problems = [
    {
      icon: AlertCircle,
      title: "No real-time spoilage detection",
      stat: "₹18,000 Cr",
      detail: "Lost due to delayed detection"
    },
    {
      icon: FileSpreadsheet,
      title: "Manual tracking errors",
      stat: "40%",
      detail: "Error rate in manual logging"
    },
    {
      icon: Package,
      title: "FIFO wastes fresh produce",
      stat: "25%",
      detail: "Longer storage under FIFO"
    },
    {
      icon: Users,
      title: "Zero coordination",
      stat: "15-20%",
      detail: "Price volatility from asymmetry"
    },
    {
      icon: Clock,
      title: "Reactive decisions",
      stat: "3-5 Days",
      detail: "Delay in spoilage response"
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Split Screen Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12">
        
        {/* LEFT SECTION - Black Background with Problems (8/12 width) */}
        <div className="lg:col-span-8 bg-black px-6 lg:px-12 py-16 lg:py-20 relative">
          {/* Left Section Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-red-400 font-semibold uppercase text-xs tracking-wider">
                Critical Problem
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              The Post-Harvest Crisis in India
            </h2>
            <p className="text-gray-400 text-base max-w-2xl">
              Billions lost, millions affected. The supply chain is broken.
            </p>
          </div>

          {/* Left Content Grid: Metrics + Problems */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: Square Metric Boxes (Stacked Vertically) */}
            <div className="space-y-4">
              {/* Loss Amount Box - Square */}
              <div className="relative group">
                <div className="relative bg-gray-900 rounded-2xl p-4 border border-yellow-500/20 aspect-square flex flex-col items-center justify-center text-center">
                  {/* Progress Ring */}
                  <div className="relative w-16 h-16 mb-3">
                    <svg className="transform -rotate-90 w-16 h-16">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-700" />
                      <circle
                        cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - wastePercentage / 100)}`}
                        className="text-yellow-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-yellow-500 mb-2">
                    ₹{lossCounter.toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    Crores Lost
                  </div>
                  <p className="text-gray-400 text-xs">
                    Annually
                  </p>

                  {/* Pulse Effect */}
                  <div className="absolute top-2 right-2">
                    <div className="relative w-2 h-2">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                      <div className="relative w-2 h-2 bg-red-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wastage Percentage Box - Square */}
              <div className="relative group">
                <div className="relative bg-gray-900 rounded-2xl p-4 border border-orange-500/20 aspect-square flex flex-col items-center justify-center text-center">
                  {/* Pie Chart */}
                  <div className="relative w-20 h-20 mb-3">
                    <svg className="transform -rotate-90 w-20 h-20">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="10" className="text-green-500/30" />
                      <circle
                        cx="40" cy="40" r="35" fill="none" stroke="currentColor" strokeWidth="10"
                        strokeDasharray={`${2 * Math.PI * 35}`}
                        strokeDashoffset={`${2 * Math.PI * 35 * (1 - wastePercentage / 100)}`}
                        className="text-orange-500 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xl font-bold text-orange-400">
                        {wastePercentage}%
                      </div>
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-red-500 mb-2">
                    30-40%
                  </div>
                  <div className="text-sm font-bold text-white mb-1">
                    Never Reaches
                  </div>
                  <p className="text-gray-400 text-xs">
                    Market
                  </p>
                </div>
              </div>
            </div>

            {/* COLUMN 2-3: Problem Cards (Takes remaining space) */}
            <div className="md:col-span-2">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Critical Gaps in Current Systems
                </h3>

                <div className="space-y-2">
                  {problems.map((problem, index) => {
                    const Icon = problem.icon;
                    const isExpanded = expandedProblem === index;

                    return (
                      <div
                        key={index}
                        className={`
                          bg-gray-900 rounded-xl border transition-all duration-300 cursor-pointer
                          ${isExpanded 
                            ? 'border-red-500/50 shadow-lg shadow-red-500/20' 
                            : 'border-red-500/20 hover:border-red-500/40'
                          }
                        `}
                        onClick={() => setExpandedProblem(isExpanded ? null : index)}
                      >
                        <div className="p-3 flex items-center gap-2">
                          <div className={`
                            p-2 rounded-lg transition-colors flex-shrink-0
                            ${isExpanded ? 'bg-red-500/20' : 'bg-red-500/10'}
                          `}>
                            <Icon className="w-4 h-4 text-red-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm">
                              {problem.title}
                            </p>
                          </div>

                          <div className={`
                            transform transition-transform duration-300 flex-shrink-0
                            ${isExpanded ? 'rotate-180' : ''}
                          `}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-red-500/20 animate-fadeIn">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-xl font-bold text-red-400">
                                {problem.stat}
                              </div>
                              <div className="px-2 py-0.5 bg-red-500/10 rounded-full">
                                <span className="text-red-400 text-xs font-semibold">
                                  HIGH IMPACT
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs">
                              {problem.detail}
                            </p>

                            {/* Mini Progress Bar */}
                            <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 rounded-full animate-pulse"
                                style={{ width: '75%' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION - Green Background with Solutions (4/12 width) */}
        <div className="lg:col-span-4 bg-green-700 px-6 lg:px-8 py-16 lg:py-20 relative">
          {/* Animated Arrow Divider */}
          <div className="hidden lg:flex absolute -left-8 top-1/2 -translate-y-1/2 z-10">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-12 h-0.5 bg-green-500"></div>
              <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
              </svg>
            </div>
          </div>

          {/* Right Section Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 border border-white/40 rounded-full mb-3">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-semibold uppercase text-xs tracking-wider">
                The Solution
              </span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">
              Godam Solves
            </h2>
            <p className="text-green-100 text-base">
              Transform crisis into efficiency with intelligent solutions
            </p>
          </div>

          {/* Solutions List - Gradient Boxes */}
          <div className="space-y-4">
            {/* Solution 1 */}
            <div className="bg-red-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">Real-Time IoT Monitoring</h4>
                  <p className="text-sm text-white/90">Instant spoilage alerts via sensors</p>
                </div>
              </div>
            </div>

            {/* Solution 2 */}
            <div className="bg-yellow-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">AI-Powered Automation</h4>
                  <p className="text-sm text-white/90">Zero manual entry errors</p>
                </div>
              </div>
            </div>

            {/* Solution 3 */}
            <div className="bg-yellow-500 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">Freshness-Based Routing</h4>
                  <p className="text-sm text-white/90">Prioritize high-risk batches first</p>
                </div>
              </div>
            </div>

            {/* Solution 4 */}
            <div className="bg-green-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">Connected Network</h4>
                  <p className="text-sm text-white/90">Farmers, warehouses & buyers synced</p>
                </div>
              </div>
            </div>

            {/* Solution 5 */}
            <div className="bg-green-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-2">Predictive Analytics</h4>
                  <p className="text-sm text-white/90">Proactive decisions, not reactive</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 pt-6 border-t border-white/20">
            <p className="text-center text-white text-base font-semibold">
              Transform Crisis into Efficiency
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
};

export default ProblemStatementSection;
