import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Droplets, User, LogOut, Menu, X, Shield, Bell } from "lucide-react";
import Button from "./common/Button";

const NavBar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Scroll visibility logic
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on navigation
  useEffect(() => setIsOpen(false), [location]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "text-blue-600 bg-blue-50/80 shadow-inner"
        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
    }`;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? "glass shadow-lg py-2" : "bg-white border-b border-slate-100 py-3"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-blue-200 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Droplets className="text-white w-6 h-6" />
              </div>
              <span className="text-slate-900 font-black text-2xl tracking-tighter uppercase letter-spacing-tight">
                Well<span className="text-blue-600">Sync</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1">
              {user && (
                <>
                  {user.role === "admin" && (
                    <>
                      <NavLink to="/admin" className={linkClass}><Shield className="w-4 h-4" /> Admin</NavLink>
                      <NavLink to="/wells" className={linkClass}>Wells</NavLink>
                      <NavLink to="/reports" className={linkClass}>Reports</NavLink>
                      <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                      <NavLink to="/water-quality" className={linkClass}>Water Quality</NavLink>
                    </>
                  )}
                  {user.role === "lab_tester" && (
                    <>
                      <NavLink to="/lab-dashboard" className={linkClass}>Lab Dashboard</NavLink>
                      <NavLink to="/water-quality" className={linkClass}>Water Tests</NavLink>
                    </>
                  )}
                  {user.role === "field_officer" && (
                    <>
                      <NavLink to="/officer-dashboard" className={linkClass}>Dashboard</NavLink>
                      <NavLink to="/reports" className={linkClass}>Reports</NavLink>
                      <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                    </>
                  )}
                  {["customer", "communityUser"].includes(user.role) && (
                    <>
                      <NavLink to="/home" className={linkClass}>Home</NavLink>
                      <NavLink to="/wells" className={linkClass}>Public Wells</NavLink>
                      <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                
                <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-900 leading-none capitalize">
                      {user.name || "User"}
                    </span>
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest mt-1">
                      {user.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={LogOut}
                    onClick={logout}
                    className="hidden sm:inline-flex"
                  >
                    Logout
                  </Button>
                </div>

                {/* Mobile Toggle */}
                <button onClick={toggleMenu} className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 px-4 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="md">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-slate-100 ${
        isOpen ? "max-h-[500px] opacity-100 py-6" : "max-h-0 opacity-0"
      }`}>
        <div className="px-6 space-y-2">
          {user ? (
            <>
              {user.role === "admin" && (
                <>
                  <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>
                  <NavLink to="/wells" className={linkClass}>Manage Wells</NavLink>
                  <NavLink to="/reports" className={linkClass}>View All Reports</NavLink>
                  <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                  <NavLink to="/water-quality" className={linkClass}>Water Quality</NavLink>
                </>
              )}
              {user.role === "lab_tester" && (
                <>
                  <NavLink to="/lab-dashboard" className={linkClass}>Lab Dashboard</NavLink>
                  <NavLink to="/water-quality" className={linkClass}>Water Tests</NavLink>
                </>
              )}
              {user.role === "field_officer" && (
                <>
                  <NavLink to="/officer-dashboard" className={linkClass}>Dashboard</NavLink>
                  <NavLink to="/reports" className={linkClass}>Reports</NavLink>
                  <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                </>
              )}
              {["customer", "communityUser"].includes(user.role) && (
                <>
                  <NavLink to="/home" className={linkClass}>Home</NavLink>
                  <NavLink to="/wells" className={linkClass}>Public Wells</NavLink>
                  <NavLink to="/maintenance" className={linkClass}>Maintenance</NavLink>
                </>
              )}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <Button
                  variant="danger"
                  className="w-full py-3"
                  icon={LogOut}
                  onClick={logout}
                >
                  Logout Session
                </Button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/home" className={linkClass}>Home</NavLink>
              <NavLink to="/wells" className={linkClass}>Public Wells</NavLink>
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                <Link to="/login" className="block w-full text-center py-3 text-slate-600 font-bold hover:text-blue-600">
                  Existing Member? Log In
                </Link>
                <Link to="/signup" className="block">
                  <Button variant="primary" className="w-full py-3">
                    Join WellSync Free
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
