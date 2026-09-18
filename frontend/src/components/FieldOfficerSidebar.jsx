import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FilePlus, ClipboardList, MessageSquare, Droplets,Map,Wrench } from "lucide-react";

const FieldOfficerSidebar = () => {
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
            Main Menu
          </span>
        </div>
        
        <NavLink to="/officer-dashboard" className={sidebarLinkClass}>
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </NavLink>
        
        <NavLink to="/add-report" className={sidebarLinkClass}>
          <FilePlus className="w-5 h-5" />
          Add Report
        </NavLink>
        
        <NavLink to="/reports" className={sidebarLinkClass}>
          <ClipboardList className="w-5 h-5" />
          Well Reports
        </NavLink>

        <NavLink to="/maintenance" className={sidebarLinkClass}>
          <Wrench className="w-5 h-5" />
          Maintenance Tasks
        </NavLink>

        <NavLink to="/maintenance/map" className={sidebarLinkClass}>
          <Map className="w-5 h-5" />
          Route Map
        </NavLink>
        
        <NavLink to="/comments" className={sidebarLinkClass}>
          <MessageSquare className="w-5 h-5" />
          Comments
        </NavLink>
      </nav>

      {/* Sidebar Footer Info */}
      <div className="px-6 mt-auto">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs font-bold text-blue-700 leading-tight mb-1">Field Support</p>
          <p className="text-[10px] text-blue-600/70 font-medium leading-relaxed">
            Need help? Contact the admin team for technical support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FieldOfficerSidebar;
