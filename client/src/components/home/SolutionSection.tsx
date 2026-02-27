import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const features = [
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
    title: 'Real-Time Monitoring',
    description: 'Simulated sensors track temperature, humidity, and gas levels 24/7. Get instant alerts when conditions deviate from optimal ranges.',
    benefits: [
      'Live environmental data updates every minute',
      'Automated alerts via SMS and email',
      'Historical trend analysis and reports',
      'Multi-zone monitoring for large warehouses',
    ],
    accent: 'godam-leaf',
    borderHover: 'hover:border-godam-leaf/40',
    iconBg: 'bg-godam-leaf/10',
    iconColor: 'text-godam-leaf',
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'AI Risk Scoring',
    description: 'Advanced machine learning algorithms predict spoilage before it happens. Each batch gets a dynamic risk score that updates in real-time.',
    benefits: [
      'Predictive analytics for spoilage prevention',
      'Fresh, Moderate, and High-risk classifications',
      'Batch-level granular tracking',
      'Confidence scores for each prediction',
    ],
    accent: 'godam-sun',
    borderHover: 'hover:border-godam-sun/40',
    iconBg: 'bg-godam-sun/10',
    iconColor: 'text-godam-sun',
  },
  {
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Smart Allocation',
    description: 'Intelligent matching engine pairs produce freshness with buyer needs. Retail gets fresh stock, processing units get near-expiry produce.',
    benefits: [
      'Automated buyer-batch matching',
      'Priority routing for high-risk inventory',
      'Revenue optimization algorithms',
      'Waste reduction up to 20%',
    ],
    accent: 'godam-forest',
    borderHover: 'hover:border-godam-forest/40',
    iconBg: 'bg-godam-forest/10',
    iconColor: 'text-godam-forest',
  },
];

export default function SolutionSection() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const extraRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const ctaRef = useScrollReveal<HTMLDivElement>();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section
      id="solution"
      className="relative py-24 md:py-36 bg-godam-cream overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-godam-leaf/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-godam-sun/5 rounded-full filter blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-godam-forest/10 border border-godam-forest/20 rounded-full text-godam-forest text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Our Solution</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 mb-6">
            Intelligent Warehouse
            <br />
            <span className="text-gradient-godam">Optimization</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body">
            Transform your warehouse operations with three powerful pillars of optimization.
            Monitor, predict, and optimize — all in one intelligent platform.
          </p>
        </div>

        {/* Feature Cards */}
        <div ref={cardsRef} className="scroll-reveal grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group relative bg-white rounded-3xl p-8 border-2 border-gray-100 ${f.borderHover} transition-all duration-500 hover:-translate-y-2 hover:shadow-glass`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 ${f.iconBg} rounded-2xl flex items-center justify-center mb-6 ${f.iconColor} group-hover:scale-110 transition-transform duration-500`}>
                {f.icon}
              </div>

              <h3 className="text-xl font-heading font-bold text-gray-900 mb-3 group-hover:text-godam-forest transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                {f.description}
              </p>

              {/* Expandable benefits */}
              <div className={`space-y-2.5 overflow-hidden transition-all duration-500 ${expanded === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pt-5 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Key Benefits</p>
                  {f.benefits.map((b, j) => (
                    <div key={j} className="flex items-start space-x-2 mb-2">
                      <svg className="w-4 h-4 text-godam-leaf mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className="mt-4 flex items-center space-x-1.5 text-godam-forest hover:text-godam-leaf font-medium text-sm transition-colors"
              >
                <span>{expanded === i ? 'Show Less' : 'Learn More'}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${expanded === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div ref={extraRef} className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {/* Traceability */}
          <div className="bg-godam-sun/5 border-2 border-godam-sun/15 rounded-3xl p-8 hover:shadow-sun transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-godam-sun/10 rounded-2xl flex items-center justify-center text-godam-sun flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading font-bold text-gray-900 mb-2">Complete Traceability</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Track every batch from farmer to buyer. QR code scanning, batch history, and full audit trails.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['QR Scanning', 'Batch History', 'Audit Logs'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-godam-sun border border-godam-sun/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI PDF Parsing */}
          <div className="bg-godam-forest/5 border-2 border-godam-forest/15 rounded-3xl p-8 hover:shadow-godam transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-godam-forest/10 rounded-2xl flex items-center justify-center text-godam-forest flex-shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <div>
                <h4 className="text-xl font-heading font-bold text-gray-900 mb-2">AI-Powered PDF Parsing</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Upload PDF orders and let Gemini AI extract requirements automatically. No manual data entry.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Gemini AI', 'PDF Upload', 'Auto-Extract'].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-white rounded-full text-xs font-medium text-godam-forest border border-godam-forest/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} className="scroll-reveal text-center">
          <Link
            to="/features"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-godam-forest text-white font-heading font-semibold rounded-2xl shadow-godam transition-all duration-300 hover:scale-[1.04] hover:shadow-godam-lg group"
          >
            <span>Explore All Features</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
