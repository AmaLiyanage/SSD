import React, { useEffect, useMemo, useState } from "react";
import { getAllTests } from "../services/waterService";
import WaterChart from "../components/WaterChart";
import PredictionBadge from "../components/PredictionBadge";
import LabTestDetailsModal from "../components/LabTestDetailsModal";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  FilePlus, 
  FlaskConical, 
  MapPin, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Eye 
} from "lucide-react";

const LabTesterDashboard = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("abnormal"); // "abnormal" | "all"
  const [selectedTest, setSelectedTest] = useState(null);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await getAllTests();
      setTests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const safeCount = useMemo(() => tests.filter((item) => item.status === "Safe").length, [tests]);
  const warningCount = useMemo(() => tests.filter((item) => item.status === "Warning").length, [tests]);
  const unsafeCount = useMemo(() => tests.filter((item) => item.status === "Unsafe").length, [tests]);
  const totalCount = tests.length;

  const abnormalTests = useMemo(
    () => tests.filter((item) => item.status !== "Safe").slice(0, 10),
    [tests]
  );

  const recentTests = useMemo(
    () => tests.slice(0, 10),
    [tests]
  );

  const highRiskWells = useMemo(() => {
    const map = {};
    tests.forEach((item) => {
      const wellIdKey = item.wellId?._id || item.wellId?.wellId || item.wellId || "Unknown";
      const wellLabel = item.wellId?.wellId || "Well";
      const wellName = item.wellId?.name || "";
      const village = item.wellId?.village || "";
      const status = item.status || "Unknown";

      if (status === "Unsafe" || status === "Warning") {
        if (!map[wellIdKey]) {
          map[wellIdKey] = {
            wellId: wellLabel,
            name: wellName,
            village,
            status,
            count: 0
          };
        }
        map[wellIdKey].count += 1;
        if (status === "Unsafe") {
          map[wellIdKey].status = "Unsafe";
        }
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [tests]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white uppercase tracking-[0.3em] font-black text-slate-300 animate-pulse">
        System Initializing...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header - Styled like FieldOfficerDashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Lab Operations <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Analyst: <span className="text-slate-900">{user?.username}</span> // Station Beta (Water QA)
            </p>
          </div>
          <Link
            to="/water-quality/add"
            className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl transition-all duration-300"
          >
            + New Test Entry
          </Link>
        </header>

        {/* Dashboard In-Page Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <NavLink
              to="/lab-dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`
              }
            >
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </NavLink>
            <NavLink
              to="/water-quality/add"
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`
              }
            >
              <FilePlus className="w-3.5 h-3.5" /> Create Lab Test
            </NavLink>
            <NavLink
              to="/water-quality"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
                }`
              }
            >
              <FlaskConical className="w-3.5 h-3.5" /> Water Tests & History
            </NavLink>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <Droplets className="w-4 h-4 text-blue-600" />
            Certified Bio-Chemical Standards
          </div>
        </div>

        {/* Stats Grid - Exact CSS from FieldOfficerDashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Total Tests</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-slate-900">{totalCount}</p>
              <span className="text-xs font-bold text-slate-300">SAMPLES</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3">Warning Alerts</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-amber-500">{warningCount}</p>
              <span className="text-xs font-bold text-slate-300">UNITS</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">Critical Unsafe</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-red-600">{unsafeCount}</p>
              <span className="text-xs font-bold text-slate-300">UNSAFE</span>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Compliant Clean</p>
            <div className="flex items-baseline gap-2">
              <p className="text-5xl font-black text-emerald-500">{safeCount}</p>
              <span className="text-xs font-bold text-slate-300">SAFE</span>
            </div>
          </div>
        </section>

        {/* Main Content: Monitoring table followed by analytics */}
        <section className="space-y-8">
          {/* Data Table Container - Styled like FieldOfficerDashboard main table */}
          <main className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/40">
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900">Lab Test Monitoring</h2>
                <p className="text-xs text-slate-400 mt-0.5">Live chemical analysis results and anomaly tracking.</p>
              </div>

              {/* Pill Switcher */}
              <div className="inline-flex p-1 bg-slate-100 rounded-full text-[11px] font-black uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab("abnormal")}
                  className={`px-4 py-1.5 rounded-full transition ${
                    activeTab === "abnormal"
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Abnormal ({abnormalTests.length})
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-1.5 rounded-full transition ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Recent ({recentTests.length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                    <th className="p-6 border-b border-slate-100">Asset / Well</th>
                    <th className="p-6 border-b border-slate-100">Status</th>
                    <th className="p-6 border-b border-slate-100">pH Index</th>
                    <th className="p-6 border-b border-slate-100">Turbidity</th>
                    <th className="p-6 border-b border-slate-100">Bacteria</th>
                    <th className="p-6 border-b border-slate-100">Date Logged</th>
                    <th className="p-6 border-b border-slate-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(activeTab === "abnormal" ? abnormalTests : recentTests).map((item) => {
                    const wellLabel = item.wellId?.wellId || (typeof item.wellId === "string" ? item.wellId : "Unknown");
                    const village = item.wellId?.village ? ` (${item.wellId.village})` : "";
                    const isUnsafe = item.status === "Unsafe";
                    const isWarning = item.status === "Warning";

                    return (
                      <tr key={item._id} className="group hover:bg-slate-50/50 transition-all duration-200">
                        <td className="p-6 font-black text-slate-900 tracking-tighter">
                          {wellLabel}
                          <span className="block text-[10px] font-normal text-slate-400">{village}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isUnsafe
                                  ? "bg-red-500 animate-pulse"
                                  : isWarning
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                              }`}
                            ></span>
                            <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">
                              {item.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-xs font-bold text-slate-700 font-mono">
                          {item.phLevel}
                        </td>
                        <td className="p-6 text-slate-500 text-xs font-mono">
                          {item.turbidity} NTU
                        </td>
                        <td className="p-6 text-xs font-bold font-mono">
                          <span className={item.bacteriaCount > 0 ? "text-red-500 font-black" : "text-slate-600"}>
                            {item.bacteriaCount} CFU
                          </span>
                        </td>
                        <td className="p-6 text-[10px] text-slate-400 font-black uppercase font-mono">
                          {new Date(item.testDate || item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-6 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTest(item)}
                            className="inline-block px-5 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-tighter hover:bg-slate-900 hover:text-white transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(activeTab === "abnormal" ? abnormalTests : recentTests).length === 0 && (
                <div className="py-24 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.5em]">
                    {activeTab === "abnormal" ? "No abnormal test logs found." : "No tests recorded yet."}
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Analytics below the monitoring table */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Wells Needing Re-test */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  Re-test Watchlist
                </h2>
              </div>
              <div className="space-y-3">
                {highRiskWells.length > 0 ? (
                  highRiskWells.map((well) => (
                    <div key={well.wellId} className="rounded-2xl border border-slate-100 p-4 bg-slate-50/60">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{well.wellId}</p>
                          <p className="text-xs text-slate-500">
                            {well.name ? `${well.name} ` : ""}{well.village ? `• ${well.village}` : ""}
                          </p>
                          <p className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-wider">
                            Flagged Samples: {well.count}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            well.status === "Unsafe"
                              ? "bg-red-500 text-white"
                              : "bg-amber-400 text-slate-900"
                          }`}
                        >
                          {well.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/60 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">
                    All monitored sources optimal.
                  </div>
                )}
              </div>
            </div>

            {/* pH Trend Overview */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="mb-4">
                <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
                  pH Chronological Trend
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Sequential analysis of recent samples.</p>
              </div>
              <WaterChart data={tests} />
            </div>
          </div>
        </section>

        {/* Footer - Styled like FieldOfficerDashboard */}
        <footer className="flex justify-between items-center text-slate-300 font-black text-[9px] uppercase tracking-widest py-8">
          <p>WellSync Global // Lab Operations Center</p>
          <p>v2.0.4-Final</p>
        </footer>
      </div>

      {/* Lab Test Inspection Modal */}
      {selectedTest && (
        <LabTestDetailsModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
};

export default LabTesterDashboard;