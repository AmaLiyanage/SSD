import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FieldOfficerDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyReports = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
           setError("No token found. Please login again.");
           return;
        }

        const res = await axios.get("http://localhost:5000/api/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const allData = Array.isArray(res.data) ? res.data : [];

        // --- FILTER LOGIC ---
        // We filter the list so it only contains reports where the ID matches the current user
        const filteredData = allData.filter(report => {
            // We check both ._id and the field itself in case the backend hasn't populated yet
            const creatorId = report.reportedBy?._id || report.reportedBy;
            return creatorId === user?.id || creatorId === user?._id;
        });

        setReports(filteredData);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.response?.data?.message || "Sync Error");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyReports();
  }, [user]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white uppercase tracking-[0.3em] font-black text-slate-300 animate-pulse">
        System Initializing...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Field Operations <span className="text-blue-600">Center</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Officer: <span className="text-slate-900">{user?.username}</span> // Station Alpha
            </p>
          </div>
          <Link to="/add-report" className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl transition-all duration-300">
            + New Field Entry
          </Link>
        </header>

        {/* Stats Grid - Now reflects only YOUR reports */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">My Total Logs</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-slate-900">{reports.length}</p>
                    <span className="text-xs font-bold text-slate-300">UNITS</span>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-3">My Critical Alerts</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-red-600">
                        {reports.filter(r => r.severity === "High").length}
                    </p>
                </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Recent Activity</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-blue-600">
                        {reports.length > 0 ? "Active" : "None"}
                    </p>
                </div>
            </div>
        </section>

        {/* Clean Data Table */}
        <main className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th className="p-6 border-b border-slate-100">Asset ID</th>
                  <th className="p-6 border-b border-slate-100">Severity</th>
                  <th className="p-6 border-b border-slate-100">Pump Hardware</th>
                  <th className="p-6 border-b border-slate-100">Water Index</th>
                  <th className="p-6 border-b border-slate-100">Date Logged</th>
                  <th className="p-6 border-b border-slate-100 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.map((report) => (
                  <tr key={report._id} className="group hover:bg-slate-50/50 transition-all duration-200">
                    <td className="p-6 font-black text-slate-900 tracking-tighter">{report.wellId}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                            report.severity === 'High' ? 'bg-red-500 animate-pulse' : 
                            report.severity === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}></span>
                        <span className="text-[10px] font-black uppercase tracking-tight text-slate-600">{report.severity}</span>
                      </div>
                    </td>
                    <td className="p-6 text-xs font-bold">
                      <span className={report.pumpStatus === 'Working' ? 'text-emerald-500' : 'text-red-500'}>
                          {report.pumpStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-6 text-slate-400 text-xs italic font-serif">"{report.waterLevel}"</td>
                    <td className="p-6 text-[10px] text-slate-400 font-black uppercase">
                        {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-6 text-right">
                      <Link to={`/reports/${report._id}`} className="inline-block px-5 py-2 rounded-full border-2 border-slate-900 text-slate-900 text-[9px] font-black uppercase tracking-tighter hover:bg-slate-900 hover:text-white transition-all">
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {reports.length === 0 && (
            <div className="py-32 text-center">
                <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.5em]">You haven't submitted any reports yet.</p>
            </div>
          )}
        </main>

        <footer className="flex justify-between items-center text-slate-300 font-black text-[9px] uppercase tracking-widest py-8">
            <p>WellSync Global // Personal Dashboard</p>
            <p>v2.0.4-Final</p>
        </footer>
      </div>
    </div>
  );
};

export default FieldOfficerDashboard;