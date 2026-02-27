import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            © 2026 Godam Solutions. Built with ❤️ by Team Nexus
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-green-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
