import React from "react";
import { Link } from "react-router-dom";
import { Droplets, Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Droplets className="text-white w-6 h-6" />
              </div>
              <span className="text-slate-900 font-black text-2xl tracking-tighter uppercase">
                WellSync
              </span>
            </Link>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">
              Bridging the gap between rural infrastructure and real-time monitoring to ensure safe water for everyone, everywhere.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 italic">Platform</h4>
            <ul className="space-y-4">
              <li><Link to="/wells" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Monitoring Hub</Link></li>
              <li><Link to="/reports" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Lab Analysis</Link></li>
              <li><Link to="/maintenance" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Repair Tracking</Link></li>
              <li><Link to="/map" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Interactive Map</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-slate-900 font-bold mb-6 italic">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Documentation</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Community Forum</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">Field Manuals</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors">API Reference</a></li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <h4 className="text-slate-900 font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Need Support?
            </h4>
            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
              Our technical team is available 24/7 for field emergency support.
            </p>
            <a href="mailto:support@wellsync.org">
              <button className="w-full bg-white border border-slate-200 text-slate-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all">
                Contact Support
              </button>
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-xs font-medium">
            &copy; 2026 WellSync Systems. Built for sustainable water management.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Use</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
