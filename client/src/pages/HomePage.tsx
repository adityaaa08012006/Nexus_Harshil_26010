import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logo.png";
import { 
  ShoppingCart, 
  Phone, 
  Mail, 
  MapPin, 
  Search,
  Leaf,
  TrendingUp,
  Shield,
  Users,
  CheckCircle,
  Play,
  ArrowRight,
  Clock,
  User,
  Star,
  X,
  Building2,
  Package,
  Truck
} from 'lucide-react';
// import ProblemStatementSection from '../components/landing/ProblemStatementSection';
import CircularFlowSection from '../components/landing/CircularFlowSection';
import PotentialUsersCarousel from '../components/landing/PotentialUsersCarousel';
import HeroSlider from '../components/home/HeroSlider';

// Modal Component
const UserModal = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex justify-between items-center rounded-t-3xl">
          <h3 className="text-2xl font-bold text-godam-forest">User Details</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left Side - Company Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center p-6 bg-godam-leaf rounded-2xl">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <user.icon className="text-godam-leaf" size={64} />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">{user.company}</h4>
              <span className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-full text-sm font-semibold">
                {user.type}
              </span>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
              <h5 className="text-lg font-bold text-godam-forest mb-4">Contact Information</h5>
              <div className="flex items-center gap-3">
                <User className="text-godam-leaf" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-semibold text-gray-800">{user.contact.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-godam-leaf" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">{user.contact.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-godam-leaf" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-800">{user.contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="text-godam-leaf" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-800">{user.contact.location}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - About */}
          <div className="space-y-6">
            <div>
              <h5 className="text-2xl font-bold text-godam-forest mb-4">About {user.company}</h5>
              <p className="text-gray-700 leading-relaxed mb-6">{user.about}</p>
            </div>

            <div className="bg-godam-leaf bg-opacity-10 rounded-2xl p-6">
              <h5 className="text-xl font-bold text-godam-forest mb-4 flex items-center gap-2">
                <CheckCircle className="text-godam-leaf" size={24} />
                How They Can Use Godam
              </h5>
              <ul className="space-y-3">
                {user.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ArrowRight className="text-godam-leaf flex-shrink-0 mt-1" size={18} />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <h5 className="text-lg font-bold text-godam-forest mb-3">Key Features for {user.type}</h5>
              <div className="grid grid-cols-2 gap-3">
                {user.features.map((feature: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-3 rounded-lg">
                    <CheckCircle className="text-godam-leaf flex-shrink-0" size={16} />
                    <span className="text-sm text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-4 bg-godam-leaf text-white rounded-full font-bold text-lg hover:bg-godam-forest transition shadow-lg">
              Contact {user.company}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const potentialUsers = [
    {
      id: 1,
      company: "BigBasket Warehouses",
      type: "Warehouse Owner",
      icon: Building2,
      logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
      contact: {
        name: "Rajesh Kumar",
        email: "rajesh.k@bigbasket.com",
        phone: "+91 98765 12345",
        location: "Bangalore, Karnataka"
      },
      about: "BigBasket operates the largest network of fresh produce warehouses across India, managing over 50+ storage facilities. They handle everything from farm-fresh vegetables to grains and dairy products, serving millions of customers daily through their e-commerce platform.",
      benefits: [
        "Monitor all 50+ warehouses from a single dashboard with real-time visibility",
        "Reduce spoilage by 25% through AI-powered risk scoring and predictive alerts",
        "Optimize storage capacity utilization across multiple facilities",
        "Generate comprehensive performance analytics and ROI reports",
        "Track waste reduction metrics and cost savings across the entire network"
      ],
      features: ["Multi-Warehouse Dashboard", "Analytics & Reports", "Risk Monitoring", "Utilization Tracking"]
    },
    {
      id: 2,
      company: "FreshMart Cold Storage",
      type: "Warehouse Manager",
      icon: Package,
      logo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400",
      contact: {
        name: "Priya Sharma",
        email: "priya@freshmart.in",
        phone: "+91 98765 67890",
        location: "Mumbai, Maharashtra"
      },
      about: "FreshMart operates premium cold storage facilities specializing in preserving fresh fruits, vegetables, and dairy products. With state-of-art technology and a commitment to quality, they ensure optimal storage conditions for agricultural produce.",
      benefits: [
        "Real-time sensor monitoring of temperature, humidity, and gas levels in each zone",
        "Automated alerts for threshold breaches preventing spoilage incidents",
        "Track individual batch freshness with precision scoring system",
        "Smart allocation engine matches high-risk inventory with immediate demand",
        "Maintain detailed farmer contact database and market price references",
        "Generate maintenance reports and compliance documentation effortlessly"
      ],
      features: ["Sensor Monitoring", "Batch Tracking", "Smart Allocation", "Farmer Contacts"]
    },
    {
      id: 3,
      company: "Zepto Quick Commerce",
      type: "Quick Commerce Rep",
      icon: Truck,
      logo: "https://images.unsplash.com/photo-1605902711622-cfb43c4437c7?w=400",
      contact: {
        name: "Arjun Patel",
        email: "arjun.p@zepto.com",
        phone: "+91 98765 11223",
        location: "Delhi NCR"
      },
      about: "Zepto is a leading quick commerce platform delivering groceries and fresh produce in 10 minutes. They partner with multiple warehouses to ensure ultra-fast delivery of fresh products to customers across major cities.",
      benefits: [
        "Upload requirement PDFs and let AI parse order details automatically",
        "Edit and confirm quantities, deadlines, and pricing in structured forms",
        "Receive intelligent batch suggestions prioritizing freshness and proximity",
        "Track order status in real-time from warehouse to delivery",
        "Maintain order history and reorder frequently purchased items instantly",
        "Direct communication channel with warehouse managers for coordination"
      ],
      features: ["AI PDF Parsing", "Order Tracking", "Smart Suggestions", "Order History"]
    },
    {
      id: 4,
      company: "Reliance Fresh Distribution",
      type: "Warehouse Owner",
      icon: Building2,
      logo: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=400",
      contact: {
        name: "Amit Desai",
        email: "amit.desai@reliancefresh.com",
        phone: "+91 98765 33445",
        location: "Ahmedabad, Gujarat"
      },
      about: "Reliance Fresh operates one of India's largest retail chains with an extensive network of distribution centers. They manage massive volumes of fresh produce and groceries across 200+ cities nationwide.",
      benefits: [
        "Centralized control over nationwide warehouse network",
        "Benchmark performance across regions and identify top performers",
        "Predict demand patterns and optimize inventory distribution",
        "Reduce operational costs through data-driven decision making",
        "Ensure compliance and quality standards across all facilities"
      ],
      features: ["Enterprise Dashboard", "Predictive Analytics", "Compliance Tracking", "Network Optimization"]
    },
    {
      id: 5,
      company: "Nature's Basket Premium",
      type: "Warehouse Manager",
      icon: Package,
      logo: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
      contact: {
        name: "Sneha Reddy",
        email: "sneha@naturesbasket.in",
        phone: "+91 98765 55667",
        location: "Hyderabad, Telangana"
      },
      about: "Nature's Basket specializes in premium organic produce and imported goods. Their warehouse management focuses on maintaining the highest quality standards while minimizing waste of expensive inventory.",
      benefits: [
        "Premium product tracking with detailed freshness profiles",
        "Specialized handling protocols for organic and imported items",
        "Enhanced quality control with custom sensor parameters",
        "Priority allocation for high-value perishables",
        "Detailed reporting for organic certification compliance"
      ],
      features: ["Premium Tracking", "Quality Control", "Compliance Reports", "Custom Alerts"]
    },
    {
      id: 6,
      company: "Swiggy Instamart Logistics",
      type: "Quick Commerce Rep",
      icon: Truck,
      logo: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400",
      contact: {
        name: "Vikram Singh",
        email: "vikram@swiggy.com",
        phone: "+91 98765 77889",
        location: "Pune, Maharashtra"
      },
      about: "Swiggy Instamart delivers groceries and essentials in minutes, partnering with local warehouses for rapid fulfillment. Their success depends on efficient coordination with storage facilities and fresh inventory availability.",
      benefits: [
        "Streamlined ordering process with AI-powered requirement extraction",
        "Real-time inventory visibility across partner warehouses",
        "Fresher products through smart batch selection algorithms",
        "Faster order confirmation and reduced coordination time",
        "Historical analytics for better demand forecasting"
      ],
      features: ["Quick Ordering", "Multi-Warehouse Access", "Freshness Priority", "Demand Analytics"]
    }
  ];

  const openModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };
  return (
    <div className="min-h-screen bg-white">
      {/* Main Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center h-28">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Godam Solutions" className="h-24 w-auto object-contain" />
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className="px-6 py-3 text-godam-forest text-lg font-semibold hover:bg-godam-leaf hover:text-white rounded-full transition">Home</Link>
              <Link to="/about" className="px-6 py-3 text-gray-700 text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">About</Link>
              <Link to="/solutions" className="px-6 py-3 text-gray-700 text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">Solutions</Link>
              <Link to="/contact" className="px-6 py-3 text-gray-700 text-lg font-medium hover:bg-godam-leaf hover:text-white rounded-full transition">Contact</Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <Link 
                to="/auth?tab=register" 
                className="px-8 py-3.5 bg-godam-leaf text-white text-lg rounded-full font-semibold hover:bg-godam-forest transition shadow-lg"
              >
                Log In / Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
      <HeroSlider />

      {/* Potential Users Carousel */}
      <PotentialUsersCarousel />

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="w-full aspect-square rounded-full overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600" 
                  alt="Warehouse" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=400" 
                  alt="Agriculture" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <p className="text-godam-sun font-semibold mb-2">ABOUT US</p>
              <h2 className="text-4xl font-bold text-godam-forest mb-6">
                Warehouse & Organic<br />Post-Harvest Solutions
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                India loses millions in post-harvest waste annually. Godam Solutions transforms traditional warehouses into intelligent optimization hubs using IoT sensors, AI-powered allocation, and real-time monitoring.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-godam-sun bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="text-godam-sun" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-godam-forest mb-1">Growing Smartly</h4>
                    <p className="text-sm text-gray-600">Optimized storage capacity utilization</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-godam-leaf bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="text-godam-leaf" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-godam-forest mb-1">Top-tier Efficiency</h4>
                    <p className="text-sm text-gray-600">20% reduction in spoilage waste</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="text-godam-leaf" size={24} />
                <p className="text-gray-700">
                  Trusted by <span className="font-bold text-godam-forest">50+ warehouses</span> across India
                </p>
              </div>

              <button className="mt-8 px-8 py-3 bg-godam-leaf text-white rounded-full font-bold hover:bg-godam-forest transition shadow-lg">
                Discover More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Showcase - Animated Version */}
      {/* <ProblemStatementSection /> */}
      {/* TODO: Problem Statement Section - To be implemented later */}

      {/* The Godam Solutions Difference - Circular Flow Engine */}
      <CircularFlowSection />

      {/* Old Cards Section - Hidden */}
      <section className="hidden py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-godam-sun font-semibold mb-2 text-lg">THE SOLUTION</p>
            <h2 className="text-5xl font-bold text-godam-forest mb-4">How Godam Transforms Warehouses</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">From traditional to intelligent - see how we solve each critical problem</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <TrendingUp className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Manual Temperature Checks</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <CheckCircle className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Real-Time Sensor Monitoring</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">20%</div>
                  <div className="text-sm text-gray-600">Reduction in spoilage through early detection</div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Package className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">FIFO Causes Stagnation</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <Shield className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Freshness-Based Routing</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">30%</div>
                  <div className="text-sm text-gray-600">Faster turnover of high-risk inventory</div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Mail className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Manual PDF Processing</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <Star className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">AI-Powered Structuring</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">5x</div>
                  <div className="text-sm text-gray-600">Faster requirement processing with Gemini API</div>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="group relative overflow-hidden rounded-3xl border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 bg-gray-50 hover:shadow-2xl">
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-500 transition">
                    <Users className="text-red-500 group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Traditional</div>
                    <div className="text-lg font-bold text-gray-400">Isolated Supply Chains</div>
                  </div>
                </div>
                <div className="h-px bg-green-200 mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-godam-leaf bg-opacity-10 rounded-full flex items-center justify-center group-hover:bg-godam-leaf transition">
                    <CheckCircle className="text-godam-leaf group-hover:text-white" size={32} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-godam-leaf mb-1">Godam Solution</div>
                    <div className="text-lg font-bold text-godam-forest">Connected Network</div>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-godam-leaf bg-opacity-5 rounded-xl">
                  <div className="text-3xl font-bold text-godam-leaf mb-1">Real-Time</div>
                  <div className="text-sm text-gray-600">Supply-demand matching across stakeholders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Call to Action Hub */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-godam-forest mb-4">Ready to Transform Your Warehouse?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Choose your path to get started with Godam Solutions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "For Judges & Evaluators",
                desc: "Explore the live demo and see our technical implementation",
                cta: "View Live Demo",
                icon: Shield,
                link: "/dashboard"
              },
              {
                title: "For Warehouse Operators",
                desc: "Schedule a consultation to discuss your specific needs",
                cta: "Schedule Call",
                icon: Users,
                link: "#contact"
              },
              {
                title: "For Investors & Partners",
                desc: "Download our pitch deck and business plan",
                cta: "Download Pitch",
                icon: TrendingUp,
                link: "#pitch"
              }
            ].map((card, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-3xl bg-gray-50 border-2 border-gray-200 hover:border-godam-leaf transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                <div className="absolute inset-0 bg-godam-leaf opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 p-8">
                  <div className="w-16 h-16 bg-godam-leaf rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:bg-opacity-20 transition">
                    <card.icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-godam-forest mb-3 group-hover:text-white transition">{card.title}</h3>
                  <p className="text-gray-600 mb-6 group-hover:text-white group-hover:text-opacity-90 transition">{card.desc}</p>
                  <Link 
                    to={card.link}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-godam-leaf text-white rounded-full font-bold hover:bg-white hover:text-godam-forest transition shadow-lg group-hover:bg-white group-hover:text-godam-forest"
                  >
                    {card.cta}
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-godam-leaf rounded-3xl p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">🌾 Join the Agricultural Revolution</h3>
            <p className="text-xl mb-8 text-white text-opacity-90 max-w-3xl mx-auto">
              Help us eliminate ₹92,651 crores in annual post-harvest losses and build a sustainable future for Indian agriculture.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/auth" className="px-8 py-4 bg-white text-godam-forest rounded-full font-bold hover:bg-gray-100 transition shadow-lg text-lg">
                Get Started Free
              </Link>
              <a href="mailto:contact@godamsolutions.com" className="px-8 py-4 bg-white bg-opacity-20 text-white rounded-full font-bold hover:bg-opacity-30 transition border-2 border-white text-lg">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      <UserModal isOpen={isModalOpen} onClose={closeModal} user={selectedUser} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-godam-leaf rounded-full flex items-center justify-center">
                  <Leaf className="text-white" size={24} />
                </div>
                <span className="text-2xl font-bold">Godam</span>
              </div>
              <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                Intelligent post-harvest warehouse optimization for reducing agricultural losses and maximizing efficiency.
              </p>
              <div className="flex gap-3">
                {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-godam-leaf transition"
                  >
                    <span className="sr-only">{social}</span>
                    <span className="text-sm">●</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-bold text-lg mb-4">Explore</h3>
              <ul className="space-y-2 text-gray-400">
                {['About', 'Solutions', 'Team', 'Portfolio', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-godam-leaf transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* News */}
            <div>
              <h3 className="font-bold text-lg mb-4">News</h3>
              <ul className="space-y-2 text-gray-400">
                {['Blog', 'Recent News', 'FAQ', 'Terms & Conditions'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-godam-leaf transition">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin size={18} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>Green Building, Mumbai 400001, Maharashtra, India</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={18} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>support@godamsolutions.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <Phone size={18} className="text-godam-leaf flex-shrink-0 mt-1" />
                  <span>+91 98765 43210</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 <span className="text-godam-leaf">Godam Solutions</span>. All Rights Reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-godam-leaf transition">Privacy Policy</a>
              <a href="#" className="hover:text-godam-leaf transition">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
