const PotentialUsersCarousel = () => {
  const logos = [
    {
      id: 1,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=zeptonow.com',
      alt: 'Zepto'
    },
    {
      id: 2,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=compass-group.com',
      alt: 'Compass'
    },
    {
      id: 3,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=countrydelight.in',
      alt: 'Country Delight'
    },
    {
      id: 4,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=flipkart.com',
      alt: 'Flipkart'
    },
    {
      id: 5,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=jumbotail.com',
      alt: 'Jumbotail'
    },
    {
      id: 6,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=bbdaily.com',
      alt: 'Milkbasket'
    },
    {
      id: 7,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=relianceretail.com',
      alt: 'Reliance Retail'
    },
    {
      id: 8,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=sodexo.com',
      alt: 'Sodexo'
    },
    {
      id: 9,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=swiggy.com',
      alt: 'Swiggy'
    },
    {
      id: 10,
      src: 'https://www.google.com/s2/favicons?sz=128&domain_url=zomato.com',
      alt: 'Zomato'
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gray-50 overflow-hidden font-sans antialiased text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 md:mb-6">
        <div className="text-center">
          <h6 className="text-xl md:text-2xl font-semibold text-godam-forest">Our Potiental Users</h6>
        </div>
      </div>

      <div className="relative">
        <div className="logo-loop-container">
          <div className="logo-loop-track">
            {[...logos, ...logos].map((logo, index) => (
              <div key={`${logo.id}-${index}`} className="logo-loop-item">
                <img
                  className="logo-loop-image"
                  src={logo.src}
                  alt={logo.alt}
                  onError={(event) => {
                    const target = event.currentTarget;
                    target.onerror = null;
                    target.src = '/logo1.png';
                  }}
                />
                <span className="logo-loop-name">{logo.alt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .logo-loop-container {
          overflow: hidden;
          width: 100%;
        }

        .logo-loop-track {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          animation: logoScroll 28s linear infinite;
          width: max-content;
        }

        .logo-loop-track:hover {
          animation-play-state: paused;
        }

        @keyframes logoScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .logo-loop-item {
          min-width: 280px;
          height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .logo-loop-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .logo-loop-image {
          max-height: 48px;
          width: auto;
          max-width: 160px;
          object-fit: contain;
        }

        .logo-loop-name {
          font-size: 14px;
          line-height: 1.4;
          font-weight: 600;
          color: #1f2937;
          white-space: nowrap;
          margin-top: 12px;
        }
      `}</style>
    </section>
  );
};

export default PotentialUsersCarousel;
