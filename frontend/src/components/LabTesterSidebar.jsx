import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FilePlus, ClipboardList, Droplets, FlaskConical, MapPin } from "lucide-react";

const LabTesterSidebar = () => {
  const sidebarLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "bg-blue-50 text-blue-600 shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <div className="h-full flex flex-col pt-6 pb-4">
      {/* Sidebar Header (Optional, since we have NavBar) */}
      <div className="px-6 mb-8 lg:hidden">
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-600 w-6 h-6" />
          <span className="font-black text-xl tracking-tighter uppercase">WellSync</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <div className="px-6 mb-4">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">
            Laboratory Menu
          </span>
        </div>
        
        <NavLink to="/lab-dashboard" className={sidebarLinkClass}>
          <LayoutDashboard className="w-5 h-5" />
          Lab Dashboard
        </NavLink>
        
        <NavLink to="/water-quality/add" className={sidebarLinkClass}>
          <FilePlus className="w-5 h-5" />
          Create Lab Test
        </NavLink>
        
        <NavLink to="/water-quality" end className={sidebarLinkClass}>
          <FlaskConical className="w-5 h-5" />
          Lab Test History
        </NavLink>
      </nav>

      {/* Sidebar Footer Info */}
      <div className="px-6 mt-auto">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-700 leading-tight mb-1">QA Lab Protocol</p>
          <p className="text-[10px] text-blue-600/70 font-medium leading-relaxed">
            EPA / WHO water testing standards active. Certified for public safety.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LabTesterSidebar;

