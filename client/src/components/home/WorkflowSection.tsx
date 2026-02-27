import { useScrollReveal } from '../../hooks/useScrollReveal';

const steps = [
  {
    title: 'Produce Enters',
    description: 'Farmers deliver produce. QR codes generated, batch tracking begins with full traceability.',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    bgColor: 'godam-forest',
  },
  {
    title: 'Sensors Monitor',
    description: 'Environmental sensors track conditions 24/7. AI calculates real-time risk scores for each batch.',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
      </svg>
    ),
    bgColor: 'godam-leaf',
  },
  {
    title: 'Demand Arrives',
    description: 'Buyers submit orders. Smart allocation engine matches produce freshness to buyer requirements.',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    bgColor: 'godam-sun',
  },
  {
    title: 'Optimized Dispatch',
    description: 'High-risk batches prioritized. Fresh produce reaches markets, waste minimized by 20%.',
    icon: (
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    bgColor: 'godam-forest',
  },
];

export default function WorkflowSection() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const stepsRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const loopRef = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section
      id="workflow"
      className="relative py-24 md:py-36 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fdf8ee 0%, #f5f0e0 30%, #eef5e8 70%, #f7f0f0 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-20 h-20 border-2 border-godam-leaf/10 rounded-full" />
      <div className="absolute top-40 right-20 w-32 h-32 border-2 border-godam-sun/10 rounded-full" />
      <div className="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-godam-forest/10 rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-godam-sun/10 border border-godam-sun/20 rounded-full text-godam-sun-dark text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-gray-900 mb-6">
            From Farm to Market
            <br />
            <span className="text-gradient-godam">In 4 Simple Steps</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-body">
            Our intelligent platform automates your entire post-harvest workflow,
            from intake to dispatch, ensuring optimal freshness at every stage.
          </p>
        </div>

        {/* Steps */}
        <div ref={stepsRef} className="scroll-reveal grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 mb-20">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group" style={{ transitionDelay: `${i * 150}ms` }}>
              {/* Icon circle */}
              <div className="relative mb-6 group-hover:scale-110 transition-transform duration-500">
                <div className={`absolute inset-0 bg-${step.bgColor} rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
                <div className={`relative w-24 h-24 bg-${step.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                  {step.icon}
                </div>
                {/* Step number */}
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
                  <span className={`text-sm font-heading font-bold text-${step.bgColor}`}>
                    {i + 1}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 group-hover:text-godam-forest transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-[220px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Optimization Loop */}
        <div ref={loopRef} className="scroll-reveal bg-white rounded-3xl shadow-glass p-8 md:p-12 border border-gray-100">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">Continuous Optimization Loop</h3>
            <p className="text-gray-500 font-body">Our system learns and improves with every batch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Data Collection',
                desc: 'Sensors gather environmental data continuously',
                icon: (
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 20V10M12 20V4M6 20v-6"/>
                  </svg>
                ),
                bgColor: 'godam-forest',
                bgLight: 'godam-forest/5',
                border: 'border-godam-leaf/15',
              },
              {
                title: 'AI Analysis',
                desc: 'Machine learning predicts risks and trends',
                icon: (
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                bgColor: 'godam-sun',
                bgLight: 'godam-sun/5',
                border: 'border-godam-sun/15',
              },
              {
                title: 'Smart Actions',
                desc: 'Automated alerts and allocation decisions',
                icon: (
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                bgColor: 'godam-leaf',
                bgLight: 'godam-leaf/5',
                border: 'border-godam-forest/15',
              },
            ].map((item, i) => (
              <div key={i} className={`flex flex-col items-center text-center p-6 bg-${item.bgLight} rounded-2xl border ${item.border}`}>
                <div className={`w-14 h-14 bg-${item.bgColor} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  {item.icon}
                </div>
                <h4 className="font-heading font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '24/7', label: 'Monitoring', color: 'text-godam-forest' },
              { value: '<1min', label: 'Data Updates', color: 'text-godam-leaf' },
              { value: '100%', label: 'Traceability', color: 'text-godam-sun' },
              { value: '20%', label: 'Waste Reduction', color: 'text-godam-forest' },
            ].map((s, i) => (
              <div key={i}>
                <div className={`text-2xl font-heading font-bold ${s.color} mb-1`}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
