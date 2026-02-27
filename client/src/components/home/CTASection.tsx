import { Link } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export default function CTASection() {
  const sectionRef = useScrollReveal<HTMLElement>({ threshold: 0.2 });

  return (
    <section
      ref={sectionRef}
      className="scroll-reveal relative py-24 md:py-36 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a3a17 0%, #25671E 30%, #2d7a24 60%, #25671E 100%)',
      }}
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-godam-sun/10 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-godam-leaf/10 rounded-full blur-[100px] animate-pulse-slow" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/90 text-sm font-medium mb-8">
            <svg className="w-4 h-4 text-godam-sun" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            <span>Ready to Transform Your Warehouse?</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
            Start Reducing Waste
            <br />
            <span className="text-godam-sun">Today, Not Tomorrow</span>
          </h2>

          {/* Sub */}
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-12 leading-relaxed font-body">
            Join the agricultural revolution. Get started with Godam Solutions
            and see measurable results in your first month.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/login"
              className="group w-full sm:w-auto px-10 py-5 bg-white hover:bg-godam-cream text-godam-forest font-heading font-bold text-lg rounded-2xl shadow-godam-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3"
            >
              <span>Start Free Trial</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group w-full sm:w-auto px-10 py-5 bg-transparent hover:bg-white/10 text-white font-heading font-bold text-lg rounded-2xl border-2 border-white/30 hover:border-white/60 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <span>Schedule Demo</span>
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Trust */}
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
              {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-godam-sun" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/15">
              <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-godam-leaf to-godam-forest border-2 border-white/30 flex items-center justify-center text-white font-heading font-bold text-sm"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-godam-sun" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-white text-sm font-medium">
                  Trusted by <span className="text-godam-sun font-bold">50+ warehouses</span>
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <p className="mt-8 text-white/50 text-sm">
            Questions?{' '}
            <a href="mailto:contact@godamsolutions.com" className="text-godam-sun hover:text-godam-sun-light font-semibold underline underline-offset-2">
              Contact our team
            </a>{' '}
            for a personalized consultation
          </p>
        </div>
      </div>
    </section>
  );
}
