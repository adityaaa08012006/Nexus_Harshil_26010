import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-godam-leaf rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-lg text-white">Godam Solutions</span>
                <span className="text-xs text-godam-leaf">Smart Warehouse, Zero Waste</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Transforming post-harvest operations with AI-powered optimization.
              Reduce waste, increase efficiency, maximize profits.
            </p>
            <div className="flex space-x-3">
              {[
                {
                  label: 'GitHub',
                  href: 'https://github.com',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  ),
                },
                {
                  label: 'LinkedIn',
                  href: 'https://linkedin.com',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  ),
                },
                {
                  label: 'Twitter',
                  href: 'https://twitter.com',
                  icon: (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-white/5 hover:bg-godam-leaf/20 text-gray-500 hover:text-godam-leaf rounded-xl transition-all duration-300 hover:scale-110"
                  aria-label={s.label}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            {
              title: 'Product',
              links: [
                { label: 'Features', to: '/features' },
                { label: 'Solutions', href: '#solution' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Dashboard', to: '/dashboard' },
              ],
            },
            {
              title: 'Company',
              links: [
                { label: 'About Us', to: '/about' },
                { label: 'Our Impact', href: '#impact' },
                { label: 'Team', href: '#team' },
                { label: 'Careers', href: '#careers' },
              ],
            },
            {
              title: 'Resources',
              links: [
                { label: 'Documentation', href: '#docs' },
                { label: 'Blog', href: '#blog' },
                { label: 'Support', href: '#support' },
                { label: 'Contact Us', to: '/contact' },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="space-y-4">
              <h3 className="text-white font-heading font-semibold text-sm uppercase tracking-wider">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {'to' in link && link.to ? (
                      <Link to={link.to} className="text-sm hover:text-godam-leaf transition-colors inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm hover:text-godam-leaf transition-colors inline-flex items-center group">
                        <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} Godam Solutions. All rights reserved. Made with{' '}
              <span className="text-godam-leaf">&hearts;</span> for Indian Farmers.
            </p>
            <div className="flex space-x-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
                <a key={text} href={`#${text.toLowerCase().replace(/\s+/g, '-')}`} className="text-sm text-gray-600 hover:text-godam-leaf transition-colors">
                  {text}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
