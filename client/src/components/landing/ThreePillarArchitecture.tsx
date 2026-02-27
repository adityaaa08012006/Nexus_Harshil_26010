import { useState } from 'react';
import { Users, Activity, Zap, CheckCircle, ChevronRight } from 'lucide-react';

const ThreePillarArchitecture = () => {
  const [hoveredPillar, setHoveredPillar] = useState<number | null>(null);

  const pillars = [
    {
      id: 1,
      icon: Users,
      title: "Multi-Role Platform",
      emoji: "🎭",
      subtitle: "Tailored dashboards for every stakeholder",
      color: "emerald",
      roles: [
        {
          name: "Warehouse Owner",
          description: "Complete visibility across all facilities",
          features: [
            "Multi-warehouse performance analytics",
            "Real-time utilization tracking across sites",
            "Risk exposure monitoring dashboard",
            "Comparative efficiency metrics"
          ]
        },
        {
          name: "Warehouse Manager",
          description: "Operational control and batch monitoring",
          features: [
            "Batch-level inventory management",
            "Live sensor-based freshness tracking",
            "Smart allocation recommendations",
            "Integrated farmer & market database"
          ]
        },
        {
          name: "QC Representative",
          description: "Streamlined ordering with AI assistance",
          features: [
            "One-click PDF requirement upload",
            "AI-powered data extraction via Gemini",
            "Editable structured order forms",
            "Real-time order tracking & fulfillment"
          ]
        }
      ]
    },
    {
      id: 2,
      icon: Activity,
      title: "Sensor Intelligence",
      emoji: "🌡️",
      subtitle: "Real-time monitoring with predictive spoilage detection",
      color: "amber",
      sensors: [
        {
          name: "Temperature & Humidity",
          badge: "BME280 Simulation",
          description: "Continuous environmental monitoring with threshold alerts"
        },
        {
          name: "Ethylene Gas",
          badge: "Ripening Detection",
          description: "Early detection of fruit maturation and over-ripening"
        },
        {
          name: "Ammonia (MQ-137)",
          badge: "Decay Detection",
          description: "Identifies protein breakdown and spoilage gases"
        },
        {
          name: "Risk Score Engine",
          badge: "0-100% Classification",
          description: "AI-powered freshness scoring for optimal routing decisions"
        }
      ],
      routing: {
        fresh: "< 30% Risk → Retail & Quick Commerce",
        moderate: "30-70% Risk → Hotels & Restaurants",
        advanced: "> 70% Risk → Processing Units"
      }
    },
    {
      id: 3,
      icon: Zap,
      title: "Smart Allocation",
      emoji: "🧠",
      subtitle: "AI-driven demand matching and optimal routing",
      color: "violet",
      features: [
        {
          name: "Gemini API PDF Parsing",
          description: "Converts unstructured requirements into actionable orders in seconds",
          metric: "5x faster than manual entry"
        },
        {
          name: "Freshness-Based Prioritization",
          description: "High-risk batches automatically routed to nearest buyers",
          metric: "20% reduction in spoilage"
        },
        {
          name: "Stagnation Minimization",
          description: "Dynamic allocation prevents inventory from aging unnecessarily",
          metric: "30% faster turnover"
        },
        {
          name: "Optimal Dispatch Timing",
          description: "Demand-aware scheduling ensures peak freshness delivery",
          metric: "Real-time coordination"
        }
      ]
    }
  ];

  return (
    <section className="py-24 bg-godam-forest relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-godam-sun rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border-2 border-white/20 rounded-full mb-6">
            <Zap className="w-5 h-5 text-white" />
            <span className="text-white font-bold uppercase text-sm tracking-wider">
              System Architecture
            </span>
          </div>
          <h2 className="text-6xl font-bold text-white mb-6">
            Built on Three Intelligent Pillars
          </h2>
          <p className="text-white text-opacity-90 text-xl max-w-3xl mx-auto leading-relaxed">
            A comprehensive framework that transforms traditional warehouses into smart, data-driven operations
          </p>
        </div>

        {/* Pillar Cards - Larger Size */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isHovered = hoveredPillar === pillar.id;

            return (
              <div
                key={pillar.id}
                className={`
                  bg-white rounded-3xl border-4 shadow-xl
                  transform transition-all duration-300 cursor-pointer
                  ${isHovered 
                    ? 'border-godam-leaf scale-105 shadow-2xl shadow-godam-leaf/20' 
                    : 'border-gray-100 hover:border-godam-leaf/50'
                  }
                `}
                onMouseEnter={() => setHoveredPillar(pillar.id)}
                onMouseLeave={() => setHoveredPillar(null)}
              >
                {/* Card Header */}
                <div className="p-8 border-b-2 border-gray-100">
                  {/* Icon Circle */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className={`
                        absolute inset-0 bg-godam-leaf rounded-full blur-2xl opacity-20
                        ${isHovered ? 'animate-pulse' : ''}
                      `} />
                      <div className="relative w-24 h-24 rounded-full bg-godam-leaf flex items-center justify-center shadow-lg">
                        <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl font-bold text-godam-forest mb-3 text-center flex items-center justify-center gap-2">
                    {pillar.title} <span className="text-4xl">{pillar.emoji}</span>
                  </h3>

                  {/* Subtitle */}
                  <p className="text-gray-600 text-lg text-center font-medium">
                    {pillar.subtitle}
                  </p>
                </div>

                {/* Card Content */}
                <div className="p-8">
                  {/* Pillar 1: Multi-Role Platform */}
                  {pillar.id === 1 && (
                    <div className="space-y-6">
                      {pillar.roles?.map((role, index) => (
                        <div key={index} className="space-y-3">
                          {/* Role Header */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="px-4 py-2 bg-godam-sun rounded-xl">
                              <span className="text-white font-bold text-base">
                                {role.name}
                              </span>
                            </div>
                          </div>

                          {/* Role Description */}
                          <p className="text-godam-forest font-semibold text-base mb-3">
                            {role.description}
                          </p>

                          {/* Features */}
                          <div className="space-y-2">
                            {role.features.map((feature, fIndex) => (
                              <div key={fIndex} className="flex items-start gap-3 group">
                                <CheckCircle className="w-5 h-5 text-godam-leaf flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                                <span className="text-gray-700 text-base leading-relaxed">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Divider (except last) */}
                          {index < pillar.roles!.length - 1 && (
                            <div className="h-px bg-gray-200 my-4" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pillar 2: Sensor Intelligence */}
                  {pillar.id === 2 && (
                    <div className="space-y-6">
                      {pillar.sensors?.map((sensor, index) => (
                        <div key={index} className="bg-godam-leaf/5 rounded-2xl p-5 border-2 border-godam-leaf/10 hover:border-godam-leaf/30 transition-colors">
                          {/* Sensor Name */}
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-godam-forest font-bold text-lg">
                              {sensor.name}
                            </h4>
                            <span className="px-3 py-1.5 bg-godam-sun text-white text-xs font-bold rounded-full">
                              {sensor.badge}
                            </span>
                          </div>

                          {/* Sensor Description */}
                          <p className="text-gray-700 text-base leading-relaxed">
                            {sensor.description}
                          </p>
                        </div>
                      ))}

                      {/* Routing Classification */}
                      <div className="mt-6 p-6 bg-godam-forest rounded-2xl">
                        <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                          <ChevronRight className="w-5 h-5" />
                          Intelligent Routing
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <span className="text-white text-base font-medium">
                              {pillar.routing?.fresh}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <span className="text-white text-base font-medium">
                              {pillar.routing?.moderate}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <span className="text-white text-base font-medium">
                              {pillar.routing?.advanced}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pillar 3: Smart Allocation */}
                  {pillar.id === 3 && (
                    <div className="space-y-5">
                      {pillar.features?.map((feature, index) => (
                        <div key={index} className="bg-godam-leaf/5 rounded-2xl p-6 border-2 border-godam-leaf/10 hover:border-godam-leaf/30 transition-colors group">
                          {/* Feature Header */}
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-godam-forest font-bold text-lg flex-1 group-hover:text-godam-leaf transition-colors">
                              {feature.name}
                            </h4>
                            <CheckCircle className="w-6 h-6 text-godam-leaf flex-shrink-0 group-hover:scale-110 transition-transform" />
                          </div>

                          {/* Feature Description */}
                          <p className="text-gray-700 text-base leading-relaxed mb-3">
                            {feature.description}
                          </p>

                          {/* Metric Badge */}
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-godam-sun rounded-xl">
                            <Zap className="w-4 h-4 text-white" />
                            <span className="text-white font-bold text-sm">
                              {feature.metric}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Summary */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-godam-forest rounded-3xl p-12 shadow-2xl border-4 border-white">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-4">
                Three Pillars. One Intelligent System.
              </h3>
              <p className="text-white/90 text-xl mb-8 max-w-3xl mx-auto">
                Seamlessly integrated architecture that transforms warehouses from passive storage into active optimization engines
              </p>
              
              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                  <div className="text-5xl font-bold text-white mb-2">3</div>
                  <p className="text-white/80 text-base font-semibold">User Roles</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                  <div className="text-5xl font-bold text-white mb-2">4</div>
                  <p className="text-white/80 text-base font-semibold">Sensor Types</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border-2 border-white/20">
                  <div className="text-5xl font-bold text-white mb-2">100%</div>
                  <p className="text-white/80 text-base font-semibold">AI-Powered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreePillarArchitecture;
