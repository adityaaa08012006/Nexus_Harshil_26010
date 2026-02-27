import { Link } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  ArrowRight, 
  Star, 
  CheckCircle, 
  Leaf, 
  Truck, 
  Users,
  ArrowLeft 
} from 'lucide-react';
import ThreePillarArchitecture from '../components/landing/ThreePillarArchitecture';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-2 text-godam-forest hover:text-godam-leaf transition">
              <ArrowLeft size={24} />
              <span className="text-lg font-bold">Back to Home</span>
            </Link>
            <h1 className="text-2xl font-bold text-godam-forest">About Godam Solutions</h1>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-godam-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-bold mb-6">Transforming Warehouse Management</h1>
          <p className="text-2xl text-white text-opacity-90 max-w-4xl mx-auto leading-relaxed">
            Godam Solutions is India's first intelligent post-harvest warehouse optimization platform, 
            combining IoT sensors, AI-powered allocation, and multi-role accessibility to eliminate waste 
            and maximize value realization.
          </p>
        </div>
      </section>

      {/* Three-Pillar Architecture */}
      <ThreePillarArchitecture />

      {/* Impact Dashboard */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-godam-sun font-semibold mb-2 text-lg">MEASURABLE RESULTS</p>
            <h2 className="text-5xl font-bold text-godam-forest mb-4">Proven Impact & ROI</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Data-driven results that transform warehouse operations</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                metric: "20-30%",
                label: "Spoilage Reduction",
                desc: "Decrease in post-harvest losses",
                icon: Package,
                color: "from-green-500 to-emerald-600"
              },
              {
                metric: "40%",
                label: "Faster Turnover",
                desc: "High-risk batch dispatch speed",
                icon: TrendingUp,
                color: "from-blue-500 to-cyan-600"
              },
              {
                metric: "+15%",
                label: "Farmer Income",
                desc: "Increase in value realization",
                icon: ArrowRight,
                color: "from-yellow-500 to-orange-600"
              },
              {
                metric: "5x",
                label: "Processing Speed",
                desc: "Faster requirement structuring",
                icon: Star,
                color: "from-purple-500 to-pink-600"
              },
              {
                metric: "99.2%",
                label: "Fulfillment Rate",
                desc: "Demand matching accuracy",
                icon: CheckCircle,
                color: "from-green-500 to-teal-600"
              },
              {
                metric: "-25%",
                label: "Carbon Footprint",
                desc: "Reduced food waste emissions",
                icon: Leaf,
                color: "from-emerald-500 to-green-700"
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-3xl bg-white border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className={`absolute inset-0 bg-${item.color.split('-')[1]}-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-godam-leaf bg-opacity-10 rounded-2xl flex items-center justify-center group-hover:bg-godam-leaf transition">
                      <item.icon className="text-godam-leaf group-hover:text-white transition" size={28} />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-godam-forest mb-2">{item.metric}</div>
                  <div className="text-xl font-bold text-gray-800 mb-2">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-godam-leaf rounded-3xl p-8 text-center">
            <h3 className="text-3xl font-bold text-white mb-4">Aligned with UN Sustainable Development Goals</h3>
            <div className="flex justify-center gap-8 text-white">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">SDG 2</div>
                <div className="text-sm">Zero Hunger</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">SDG 9</div>
                <div className="text-sm">Industry Innovation</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold mb-2">SDG 12</div>
                <div className="text-sm">Responsible Consumption</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Journey Flow */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute w-full h-full" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.1) 50px, rgba(255,255,255,0.1) 51px)'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-godam-sun font-semibold mb-2 text-lg">END-TO-END WORKFLOW</p>
            <h2 className="text-5xl font-bold mb-4">Supply Chain Journey with Godam</h2>
            <p className="text-xl text-white text-opacity-80 max-w-3xl mx-auto">From farm to market - see how every stakeholder benefits</p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-godam-sun hidden md:block"></div>

            <div className="grid md:grid-cols-5 gap-8">
              {[
                { step: "1", title: "Farmer Delivers", desc: "Produce arrives at warehouse", icon: Truck },
                { step: "2", title: "Manager Logs", desc: "Batch entry with sensors", icon: Package },
                { step: "3", title: "AI Monitors", desc: "Real-time risk scoring", icon: TrendingUp },
                { step: "4", title: "Smart Match", desc: "Demand allocation", icon: CheckCircle },
                { step: "5", title: "QC Dispatch", desc: "Optimal timing delivery", icon: ArrowRight }
              ].map((milestone, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  <div className="w-20 h-20 bg-godam-sun rounded-full flex items-center justify-center mb-4 relative z-10 group-hover:scale-125 transition-transform duration-500 shadow-xl">
                    <milestone.icon size={32} className="text-white" />
                  </div>
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-godam-forest font-bold text-lg">{milestone.step}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{milestone.title}</h4>
                  <p className="text-sm text-white text-opacity-70">{milestone.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              { role: "Warehouse Owner", benefit: "Multi-location analytics dashboard" },
              { role: "Warehouse Manager", benefit: "Real-time sensor + batch tracking" },
              { role: "QC Representative", benefit: "AI-powered PDF ordering" }
            ].map((stakeholder, idx) => (
              <div key={idx} className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-20">
                <Users className="text-godam-sun mb-3" size={32} />
                <h4 className="text-lg font-bold mb-2">{stakeholder.role}</h4>
                <p className="text-sm text-white text-opacity-80">{stakeholder.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-godam-forest mb-6">Ready to Transform Your Operations?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the agricultural revolution and eliminate post-harvest losses with intelligent warehouse management.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth" className="px-8 py-4 bg-godam-leaf text-white rounded-full font-bold hover:bg-godam-forest transition shadow-lg text-lg">
              Get Started Free
            </Link>
            <Link to="/" className="px-8 py-4 bg-gray-200 text-godam-forest rounded-full font-bold hover:bg-gray-300 transition text-lg">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
