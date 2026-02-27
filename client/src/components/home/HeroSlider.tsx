import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface Slide {
  id: number;
  type: 'intro' | 'content';
  image?: string;
  title?: string;
  subtitle?: string;
  quote?: string;
  fact?: string;
  description?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    type: 'content',
    image: '/image_1.jpeg',
    title: 'Real-Time Monitoring',
    quote: '"Every second counts in preserving freshness"',
    fact: '24/7 IoT Sensor Tracking',
    description: 'Continuous monitoring of temperature, humidity, and environmental conditions ensures optimal storage quality.',
  },
  {
    id: 2,
    type: 'content',
    image: '/image_2.jpeg',
    title: 'AI-Powered Allocation',
    quote: '"Smart storage, zero waste"',
    fact: '30% Faster Inventory Turnover',
    description: 'Intelligent batch allocation using Gemini AI reduces spoilage risk and maximizes warehouse efficiency.',
  },
  {
    id: 3,
    type: 'content',
    image: '/image_3.jpeg',
    title: 'Predictive Analytics',
    quote: '"Prevent problems before they happen"',
    fact: '20% Reduction in Spoilage',
    description: 'Advanced algorithms predict potential issues and alert managers to take preventive action.',
  },
  {
    id: 4,
    type: 'content',
    image: '/image_4.jpeg',
    title: 'Supply Chain Integration',
    quote: '"Connected warehouses, seamless operations"',
    fact: '5x Faster Requirement Processing',
    description: 'Real-time supply-demand matching across markets ensures optimal inventory levels and minimal waste.',
  },
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 500); // Half of transition for smooth effect
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="relative h-[400px] md:h-[600px] overflow-hidden bg-gradient-to-br from-godam-forest to-godam-leaf">
      {/* Slide Indicators */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-2 md:gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentSlide(index);
                setIsTransitioning(false);
              }, 500);
            }}
            className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              currentSlide === index 
                ? 'w-8 md:w-12 bg-godam-sun' 
                : 'w-6 md:w-8 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Intro Slide */}
      {slide.type === 'intro' && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 px-4 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="text-center">
            {/* Logo with glow effect */}
            <div className="mb-6 md:mb-8 relative inline-block">
              <div className="absolute inset-0 bg-godam-sun/30 blur-3xl rounded-full transform scale-150" />
              <img 
                src={logo} 
                alt="Godam AI" 
                className="relative h-24 md:h-40 w-auto object-contain drop-shadow-2xl animate-pulse"
              />
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg">
              {slide.title}
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-godam-sun font-semibold mb-8 md:mb-12 drop-shadow-md px-4">
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-5 bg-godam-sun text-godam-forest rounded-full font-bold text-base md:text-lg hover:bg-yellow-400 transition-all shadow-2xl hover:shadow-godam-sun/50 hover:scale-105 transform"
            >
              Get Started
              <ArrowRight size={20} className="md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
      )}

      {/* Content Slides with Image */}
      {slide.type === 'content' && (
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col md:flex-row h-full">
            {/* Left side - Image with overlay gradient merging to right */}
            <div className="relative w-full md:w-1/2 h-1/2 md:h-full overflow-hidden">
              {slide.image ? (
                <>
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay that merges into right side */}
                  <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-transparent via-godam-forest/50 to-godam-forest" />
                </>
              ) : (
                // Fallback if image not found
                <div className="absolute inset-0 bg-gradient-to-br from-godam-leaf to-godam-forest" />
              )}
            </div>

            {/* Right side - Content */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center px-4 sm:px-6 md:px-16 py-4 md:py-0 bg-godam-forest overflow-y-auto">
              <div className="max-w-xl">
                {/* Quote */}
                {slide.quote && (
                  <div className="mb-4 md:mb-8">
                    <div className="text-4xl md:text-6xl text-godam-sun opacity-50 font-serif mb-1 md:mb-2">"</div>
                    <p className="text-base sm:text-lg md:text-2xl text-white italic font-light leading-relaxed">
                      {slide.quote}
                    </p>
                  </div>
                )}

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 md:mb-6 leading-tight">
                  {slide.title}
                </h2>

                {/* Fact Badge */}
                {slide.fact && (
                  <div className="inline-block mb-3 md:mb-6 px-4 py-2 md:px-6 md:py-3 bg-godam-sun rounded-full">
                    <p className="text-godam-forest font-bold text-sm md:text-lg">
                      {slide.fact}
                    </p>
                  </div>
                )}

                {/* Description */}
                {slide.description && (
                  <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed mb-4 md:mb-8">
                    {slide.description}
                  </p>
                )}

                {/* CTA Button */}
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-godam-forest rounded-full font-bold text-sm md:text-base hover:bg-godam-sun transition-all shadow-xl hover:scale-105 transform"
                >
                  Learn More
                  <ArrowRight size={18} className="md:w-5 md:h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;
