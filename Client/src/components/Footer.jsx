import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#1E293B] bg-opacity-95 backdrop-blur-md py-8 text-center text-sm text-[#E2E8F0] font-['Inter',sans-serif] relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2025 Triangle IP. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <a href="/about" className="text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded px-2">
              About
            </a>
            <a href="/contact" className="text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded px-2">
              Contact
            </a>
            <a href="/privacy" className="text-[#64748B] text-base hover:text-[#38BDF8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] rounded px-2">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;