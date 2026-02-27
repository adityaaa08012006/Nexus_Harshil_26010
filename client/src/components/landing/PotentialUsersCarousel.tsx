import { Building2, Package, Truck } from 'lucide-react';

const PotentialUsersCarousel = () => {
  const users = [
    {
      id: 1,
      company: "BigBasket",
      type: "E-Commerce Platform",
      icon: Building2,
      logo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400"
    },
    {
      id: 2,
      company: "FreshMart",
      type: "Cold Storage",
      icon: Package,
      logo: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400"
    },
    {
      id: 3,
      company: "Zepto",
      type: "Quick Commerce",
      icon: Truck,
      logo: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400"
    },
    {
      id: 4,
      company: "Reliance Fresh",
      type: "Retail Chain",
      icon: Building2,
      logo: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400"
    },
    {
      id: 5,
      company: "Nature's Basket",
      type: "Premium Organic",
      icon: Package,
      logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400"
    },
    {
      id: 6,
      company: "Swiggy Instamart",
      type: "Quick Commerce",
      icon: Truck,
      logo: "https://images.unsplash.com/photo-1593113598332-cd588b8f2e83?w=400"
    },
    {
      id: 7,
      company: "JioMart",
      type: "E-Commerce",
      icon: Building2,
      logo: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400"
    },
    {
      id: 8,
      company: "Milkbasket",
      type: "Daily Essentials",
      icon: Package,
      logo: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400"
    }
  ];

  return (
    <section className="py-12 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="text-center">
          <p className="text-godam-sun font-semibold mb-2 text-base uppercase tracking-wider">Trusted by Leading Brands</p>
          <h2 className="text-4xl font-bold text-godam-forest">Our Potential Users</h2>
        </div>
      </div>

      {/* Scrolling Container with CSS Animation */}
      <div className="relative">
        <div className="carousel-container">
          <div className="carousel-track">
            {/* Render users twice for seamless loop */}
            {[...users, ...users].map((user, index) => {
              const Icon = user.icon;
              return (
                <div
                  key={`${user.id}-${index}`}
                  className="carousel-card flex-shrink-0 w-64 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-gray-100"
                >
                  {/* Logo Image */}
                  <div className="h-32 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={user.logo} 
                      alt={user.company}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-godam-leaf rounded-full flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-godam-forest">{user.company}</h3>
                        <p className="text-xs text-gray-500 font-medium">{user.type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSS for infinite scroll animation */}
      <style>{`
        .carousel-container {
          overflow: hidden;
          width: 100%;
        }

        .carousel-track {
          display: flex;
          gap: 1.5rem;
          animation: scroll 40s linear infinite;
          width: max-content;
        }

        .carousel-track:hover {
          animation-play-state: paused;
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .carousel-card {
          min-width: 16rem;
        }
      `}</style>
    </section>
  );
};

export default PotentialUsersCarousel;
