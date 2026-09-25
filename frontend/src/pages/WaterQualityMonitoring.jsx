import React, { useEffect, useState, useMemo } from "react";
import { getAllTests, deleteTest } from "../services/waterService";
import PredictionBadge from "../components/PredictionBadge";
import LabTestDetailsModal from "../components/LabTestDetailsModal";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  PlusCircle, 
  LayoutDashboard, 
  FilePlus, 
  FlaskConical, 
  Droplets 
} from "lucide-react";

const WaterQualityMonitoring = () => {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTest, setSelectedTest] = useState(null);

  const [error, setError] = useState("");



  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await getAllTests();
      setTests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load test history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this lab test?")) return;
    try {
      await deleteTest(id);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete test.");
    }
  };

  const isOwnTest = (item) => {
    if (user?.role !== "lab_tester") return false;

    const createdBy = item.createdBy?._id || item.createdBy;
    const matchesUserId = createdBy && user?._id && String(createdBy) === String(user._id);
    const matchesTesterName = item.testerName?.trim().toLowerCase() === user?.username?.trim().toLowerCase();

    return matchesUserId || matchesTesterName;
  };

  const canManageTest = (item) => user?.role === "admin" || isOwnTest(item);

  const filteredTests = useMemo(() => {
    return tests.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const wellText = `${item.wellId?.wellId || ""} ${item.wellId?.name || ""} ${item.wellId?.village || ""}`.toLowerCase();
      const testerText = (item.testerName || "").toLowerCase();
      const query = searchTerm.toLowerCase();
      const matchesSearch = !query || wellText.includes(query) || testerText.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [tests, statusFilter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header - Styled like FieldOfficerDashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Water Quality <span className="text-blue-600">History</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Analyst: <span className="text-slate-900">{user?.username}</span> // Station Beta (Water QA)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/water-quality/add"
              className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Record New Water Test
            </Link>
          </div>
        </header>

        {/* In-Page Navigation Bar */}
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

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}


        {/* DATA TABLE SECTION - Dedicated Page */}
        <main className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900">
                  Recorded Quality Tests ({filteredTests.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Comprehensive audit trail of all monitored well samples.</p>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search well or tester..."
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 sm:w-60 bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Statuses ({tests.length})</option>
                    <option value="Safe">Safe</option>
                    <option value="Warning">Warning</option>
                    <option value="Unsafe">Unsafe</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="p-5 border-b border-slate-100">Asset / Well</th>
                  <th className="p-5 border-b border-slate-100">Analyst</th>
                  <th className="p-5 border-b border-slate-100">pH</th>
                  <th className="p-5 border-b border-slate-100">Turbidity</th>
                  <th className="p-5 border-b border-slate-100">Bacteria</th>
                  <th className="p-5 border-b border-slate-100">Temp</th>
                  <th className="p-5 border-b border-slate-100">Status</th>
                  <th className="p-5 border-b border-slate-100">Date Logged</th>
                  <th className="p-5 border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTests.map((item) => {
                  const wellId = item.wellId?.wellId || (typeof item.wellId === "string" ? item.wellId : "Unknown");
                  const village = item.wellId?.village ? ` (${item.wellId.village})` : "";
                  const formattedDate = new Date(item.testDate || item.createdAt).toLocaleDateString();
                  const wellName = item.wellId?.name ? ` - ${item.wellId.name}` : "";
                  

                  return (
                    <tr
                      key={item._id}
                      className={`group transition-all duration-200 ${
                        isOwnTest(item)
                          ? "bg-blue-50/70 border-l-4 border-blue-500 hover:bg-blue-100/70"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="p-5 font-black text-slate-900 tracking-tighter text-sm">
                        {wellId}{wellName}
                        <span className="block text-[10px] font-normal text-slate-400">{village}</span>
                      </td>
                      <td className="p-5 text-slate-600 text-xs font-semibold">
                        <span>{item.testerName || "N/A"}</span>
                        {isOwnTest(item) && (
                          <span className="ml-2 inline-flex rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            My Report
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-xs font-mono font-bold">{item.phLevel}</td>
                      <td className="p-5 text-xs font-mono text-slate-600">{item.turbidity} NTU</td>
                      <td className="p-5 text-xs font-mono">
                        <span className={item.bacteriaCount > 0 ? "text-red-600 font-bold" : "text-slate-600"}>
                          {item.bacteriaCount} CFU
                        </span>
                      </td>
                      <td className="p-5 text-xs font-mono text-slate-600">{item.temperature}°C</td>
                      <td className="p-5">
                        <PredictionBadge item={item} />
                      </td>
                      <td className="p-5 text-[10px] font-mono text-slate-400 font-black uppercase">
                        {formattedDate}
                      </td>
                      <td className="p-5 text-right space-x-2 whitespace-nowrap">
                        <Link
                          to={`/water-quality/${item._id}`}
                          className="inline-block px-4 py-1.5 rounded-full border-2 border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-tighter hover:bg-slate-900 hover:text-white transition-all"
                        >
                          Inspect
                        </Link>
                        {canManageTest(item) && (
                          <>
                            <Link
                              to={`/water-quality/edit/${item._id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-[9px] font-black uppercase tracking-tighter hover:bg-amber-100 hover:text-amber-800 transition-all"
                            >
                              <Edit3 className="h-3 w-3" /> Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-tighter hover:bg-red-600 hover:text-white transition-all"
                            >
                              <Trash2 className="h-3 w-3" /> Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredTests.length === 0 && (
                  <tr>
                    <td colSpan="9" className="py-24 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                      {loading ? "Loading tests..." : searchTerm || statusFilter !== "all" ? "No water quality tests match the selected filters." : "No tests recorded yet."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex justify-between items-center text-slate-300 font-black text-[9px] uppercase tracking-widest py-8">
          <p>WellSync Global // Lab Operations Center</p>
          <p>v2.0.4-Final</p>
        </footer>
      </div>

      {/* Optional Quick Inspection Modal */}
      {selectedTest && (
        <LabTestDetailsModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
};

export default WaterQualityMonitoring;