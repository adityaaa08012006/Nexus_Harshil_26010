import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function ProblemSection() {
  const headerRef = useScrollReveal<HTMLDivElement>();
  const card1Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const card2Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const card3Ref = useScrollReveal<HTMLDivElement>({ threshold: 0.2 });
  const bottomRef = useScrollReveal<HTMLDivElement>();

  const stats = [
    {
      ref: card1Ref,
      icon: (
        <svg className="w-10 h-10 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
      value: '40%',
      label: 'Post-Harvest Wastage',
      description: 'Nearly half of all produce is lost between farm and market due to poor storage conditions',
      source: 'Source: National Food Security',
      borderColor: 'border-red-500/20',
      glowColor: 'from-red-500/10 to-orange-500/10',
      valueColor: 'text-red-400',
      delay: '0ms',
    },
    {
      ref: card2Ref,
      icon: (
        <svg className="w-10 h-10 text-godam-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
          <path d="M4 10h16M10 4v16"/>
        </svg>
      ),
      value: '8%',
      label: 'Cold Storage Access',
      description: 'Only a fraction of warehouses have modern refrigeration, leaving produce vulnerable',
      source: 'Source: Ministry of Agriculture',
      borderColor: 'border-godam-sun/20',
      glowColor: 'from-yellow-500/10 to-amber-500/10',
      valueColor: 'text-godam-sun',
      delay: '150ms',
    },
    {
      ref: card3Ref,
      icon: (
        <svg className="w-10 h-10 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
      value: '0%',
      label: 'Real-Time Tracking',
      description: 'Traditional warehouses operate blind — no sensors, no alerts, no data-driven decisions',
      source: 'Industry Survey 2026',
      borderColor: 'border-orange-500/20',
      glowColor: 'from-orange-500/10 to-red-500/10',
      valueColor: 'text-orange-400',
      delay: '300ms',
    },
  ];

  return (
    <section
      id="problem"
      className="relative py-24 md:py-36 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0f1419 0%, #1a2615 40%, #25671E 70%, #1a2615 100%)',
      }}
    >
      {/* Subtle cross pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="scroll-reveal text-center mb-20">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/10 backdrop-blur-md border border-red-400/20 rounded-full text-red-300 text-sm mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">The Crisis We're Solving</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6">
            The ₹92,000 Crore
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Problem
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300/80 max-w-3xl mx-auto leading-relaxed font-body">
            India loses billions annually to post-harvest waste. Traditional warehouses lack the technology
            to prevent spoilage, leaving farmers and businesses counting losses.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <div
              key={i}
              ref={stat.ref}
              className="scroll-reveal group"
              style={{ transitionDelay: stat.delay }}
            >
              <div className={`relative h-full bg-white/[0.04] backdrop-blur-md border ${stat.borderColor} rounded-3xl p-8 transition-all duration-500 hover:bg-white/[0.08] hover:scale-[1.02] hover:shadow-2xl`}>
                {/* Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.glowColor} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className="mb-5 group-hover:scale-110 transition-transform duration-500">
                    {stat.icon}
                  </div>
                  <div className={`text-5xl md:text-6xl font-heading font-extrabold ${stat.valueColor} mb-3`}>
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-white/90 mb-2">
                    {stat.label}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    {stat.description}
                  </p>
                  <div className="pt-4 border-t border-white/5 flex items-center space-x-2 text-xs text-gray-500">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>{stat.source}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom prompt */}
        <div ref={bottomRef} className="scroll-reveal mt-16 text-center">
          <div className="inline-flex items-center space-x-3 px-6 py-4 bg-white/[0.04] backdrop-blur-md border border-godam-leaf/20 rounded-2xl cursor-default">
            <div className="flex -space-x-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-godam-forest to-godam-leaf border-2 border-white/10" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-godam-sun to-orange-500 border-2 border-white/10" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-godam-leaf to-godam-forest border-2 border-white/10" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-sm">Ready for a solution?</p>
              <p className="text-xs text-gray-400">See how Godam optimizes warehouses</p>
            </div>
            <svg className="w-5 h-5 text-godam-leaf" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
