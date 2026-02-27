import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

const stats = [
  {
    end: 20,
    suffix: '%',
    label: 'Waste Reduction',
    desc: 'Average decrease in spoilage across partner warehouses',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    color: 'text-godam-forest',
    gradient: 'from-godam-forest to-godam-leaf',
    bg: 'from-godam-forest/5 to-godam-leaf/5',
    border: 'hover:border-godam-leaf/40',
  },
  {
    end: 25,
    suffix: '%',
    label: 'Faster Dispatch',
    desc: 'Optimized allocation cuts decision time significantly',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    color: 'text-godam-leaf',
    gradient: 'from-godam-leaf to-emerald-500',
    bg: 'from-godam-leaf/5 to-emerald-50',
    border: 'hover:border-godam-leaf/40',
  },
  {
    end: 15,
    suffix: '%',
    label: 'Revenue Increase',
    desc: 'Better margins through reduced waste and premium pricing',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    color: 'text-godam-sun',
    gradient: 'from-godam-sun to-orange-500',
    bg: 'from-godam-sun/5 to-orange-50',
    border: 'hover:border-godam-sun/40',
  },
  {
    end: 100,
    suffix: '%',
    label: 'Traceability',
    desc: 'Complete farm-to-market visibility for every batch',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    color: 'text-godam-forest',
    gradient: 'from-godam-forest to-godam-leaf',
    bg: 'from-godam-forest/5 to-godam-leaf/5',
    border: 'hover:border-godam-forest/40',
  },
];

function StatCard({ stat, delay }: { stat: (typeof stats)[0]; delay: number }) {
  const { count, ref } = useAnimatedCounter({ end: stat.end, duration: 2000, delay });

  return (
    <div className="group relative" ref={ref}>
      <div className={`absolute inset-0 bg-${stat.gradient.split('-')[0]}-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-15 transition-all duration-500`} />
      <div className={`relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-godam transition-all duration-500 border border-gray-100 ${stat.border}`}>
        <div className={`${stat.color} mb-5`}>{stat.icon}</div>
        <div className="text-5xl font-heading font-extrabold text-gray-900 mb-2">
          {count}
          <span className={stat.color}>{stat.suffix}</span>
        </div>
        <div className="text-base font-heading font-semibold text-gray-800 mb-2">{stat.label}</div>
        <p className="text-sm text-gray-500 leading-relaxed">{stat.desc}</p>
      </div>
    </div>
  );
}

export default function ImpactSection() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const cardsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const compareRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="impact" className="relative py-24 md:py-36 overflow-hidden bg-white">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-godam-leaf/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-godam-forest/10 rounded-full blur-[100px] animate-float-delayed" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-godam-leaf/10 border border-godam-leaf/20 rounded-full text-godam-forest text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <span>Measurable Results</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 mb-6">
            The Godam Solutions
            <br />
            <span className="text-gradient-godam">Impact</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body">
            Real numbers from real warehouses. See how we're transforming
            post-harvest operations across India.
          </p>
        </div>

        {/* Stat Cards */}
        <div ref={cardsRef} className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, i) => (
            <StatCard key={i} stat={stat} delay={i * 200} />
          ))}
        </div>

        {/* Before vs After */}
        <div ref={compareRef} className="scroll-reveal bg-white rounded-3xl shadow-glass overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Before */}
            <div className="p-8 md:p-12 bg-red-50/60 md:border-r border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900">Before Godam</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Manual tracking with paper records',
                  'No real-time condition monitoring',
                  'Reactive spoilage management',
                  'Random allocation to buyers',
                  '40% average post-harvest waste',
                  'No batch traceability',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* After */}
            <div className="p-8 md:p-12 bg-godam-leaf/5">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-11 h-11 bg-godam-leaf/15 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-godam-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900">After Godam</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Digital batch tracking with QR codes',
                  '24/7 sensor monitoring & alerts',
                  'Predictive AI risk scoring',
                  'Smart allocation engine',
                  '20% waste reduction achieved',
                  '100% end-to-end traceability',
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-godam-leaf mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="bg-godam-forest p-5 text-center">
            <p className="text-white font-heading font-semibold text-base">
              Join <span className="text-godam-sun font-bold">50+ warehouses</span> already reducing waste with Godam Solutions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
