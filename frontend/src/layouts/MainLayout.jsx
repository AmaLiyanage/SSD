import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import FieldOfficerSidebar from "../components/FieldOfficerSidebar";
import LabTesterSidebar from "../components/LabTesterSidebar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

const MainLayout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase tracking-widest text-slate-400 text-xs animate-pulse">Syncing Session...</p>
        </div>
      </div>
    );
  }

  const isFieldOfficer = user?.role === "field_officer";
  const isLabTester = user?.role === "lab_tester";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navigation */}
      <NavBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Role-based Sidebar */}
        {isFieldOfficer && (
          <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm">
            <FieldOfficerSidebar />
          </aside>
        )}
        {isLabTester && (
          <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-white shadow-sm">
            <LabTesterSidebar />
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto relative">
          <main className="flex-1 relative">
            <Suspense fallback={
              <div className="h-full w-full flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 animate-fade-up">
                <Outlet />
              </div>
            </Suspense>
          </main>
          
          {/* Global Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

