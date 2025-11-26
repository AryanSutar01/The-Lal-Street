import React from 'react';
import { TrendingUp, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  The Lal Street
                </h3>
                <p className="text-xs text-slate-400">Portfolio Analysis</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your comprehensive mutual fund portfolio calculator with real-time NAV data and industry-standard calculations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="#investment-plan" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Investment Plan
                </a>
              </li>
              <li>
                <a href="#retirement-plan" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Retirement Plan
                </a>
              </li>
              <li>
                <a href="#financial-planning" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  Financial Planning
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <a href="mailto:contact@the-lal-street.com" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  contact@the-lal-street.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <a href="tel:+911234567890" className="text-slate-300 hover:text-blue-400 transition-colors text-sm">
                  +91 123 456 7890
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm">
                  India
                </span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Credits Section */}
        <div className="border-t border-slate-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-400 text-center md:text-left">
              <p>© {new Date().getFullYear()} The Lal Street. All rights reserved.</p>
              <p className="mt-1">Built with real NAV data for accurate portfolio analysis.</p>
            </div>
            <div className="text-sm text-slate-400 text-center md:text-right">
              <p className="font-medium text-slate-300 mb-1">Designed and Developed by</p>
              <p className="text-blue-400 font-semibold">Aryan Sutar</p>
              <p className="text-xs text-slate-500 mt-1">Oyster Kode Club RIT</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

