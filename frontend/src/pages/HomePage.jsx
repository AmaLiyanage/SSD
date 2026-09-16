import React from "react";
import { Link } from "react-router-dom";
import { 
  Droplets, 
  Activity, 
  FlaskConical, 
  Settings, 
  Map as MapIcon, 
  Users, 
  Smartphone,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import HeroImage from "../assets/Hero.jpg";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-24 pb-24">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative -mt-8 -mx-4 md:-mx-6 lg:-mx-8 h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-pulse-slow"
          style={{ backgroundImage: `url(${HeroImage})` }}
        ></div>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-transparent to-slate-50"></div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/20 mb-8 animate-bounce-subtle">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-white drop-shadow-md">
              Live Monitoring Active
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] drop-shadow-2xl">
            Smart Rural <br />
            <span className="text-blue-400 drop-shadow-none">Water Sync</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-blue-50 mb-12 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
            Empowering communities with real-time tracking, lab reports, and automated maintenance alerts for safe drinking water.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/wells">
              <Button size="lg" className="w-full sm:w-auto shadow-2xl shadow-blue-500/20" icon={ArrowRight}>
                Explore Wells
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="lg" className="w-full sm:w-auto glass text-white border-white/40 hover:bg-white/10">
                View Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-[10px] font-black uppercase tracking-widest">Scroll Down</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Unified Water Management
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            A comprehensive toolkit designed to solve the unique challenges of rural water distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card 
            title="Live Monitoring" 
            subtitle="Real-time Status" 
            icon={Activity}
          >
            Get instant visibility into well operational status, water levels, and community usage patterns.
          </Card>

          <Card 
            title="Digital Lab Reports" 
            subtitle="Verified Quality" 
            icon={FlaskConical}
          >
            Access transparent water quality tests and historical safety records for every monitored location.
          </Card>

          <Card 
            title="Smart Maintenance" 
            subtitle="Predictive Alerts" 
            icon={Settings}
          >
            Report issues instantly and track repair progress through automated maintenance workflows.
          </Card>

          <Card 
            title="Geospatial Hub" 
            subtitle="Interactive Maps" 
            icon={MapIcon}
          >
            Locate every well accurately with integrated GIS data to coordinate field teams efficiently.
          </Card>

          <Card 
            title="Community Driven" 
            subtitle="Role-based Access" 
            icon={Users}
          >
            Tailored interfaces for citizens, field officers, and administrators ensuring seamless collaboration.
          </Card>

          <Card 
            title="Offline Ready" 
            subtitle="Field Applications" 
            icon={Smartphone}
          >
            Designed for low-connectivity environments with sync capabilities for remote field operation.
          </Card>
        </div>
      </section>

      {/* ================= IMPACT SECTION ================= */}
      <section className="relative py-32 -mx-4 md:-mx-6 lg:-mx-8 bg-slate-950 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6 border border-blue-500/20">
              Our Global Mission
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight">
              Ensuring Clean Water <br />
              <span className="text-blue-500">For Every Household.</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-10">
              Access to safe water is a fundamental human right. WellSync bridges the gap between infrastructure and monitoring, ensuring sustainability for generations to come.
            </p>
            
            <div className="space-y-6">
              {[
                "Community-Led Issue Reporting",
                "Transparent Quality Verification",
                "Rapid Response Infrastructure Support"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition-colors duration-300">
                    <Droplets className="w-3.5 h-3.5 text-blue-400 group-hover:text-white" />
                  </div>
                  <span className="text-slate-300 font-bold tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {[
              { label: "Wells Active", value: "500+" },
              { label: "Lives Impacted", value: "25k" },
              { label: "Repair SLA", value: "24h" },
              { label: "Safety Rating", value: "99%" }
            ].map((stat, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-colors duration-500 group">
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter group-hover:text-blue-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="max-w-4xl mx-auto w-full text-center px-6">
        <div className="p-12 md:p-20 rounded-[3rem] bg-blue-600 shadow-2xl shadow-blue-500/40 animate-fade-up relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter relative z-10">
            Ready to secure your <br /> community's future?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto px-12">
                Join WellSync Now
              </Button>
            </Link>
            <Link to="/contact" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10">
                Contact Technical Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;