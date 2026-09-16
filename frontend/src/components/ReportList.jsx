import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReports } from "../services/reportService";
import ReportCard from "./ReportCard";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        console.error(error.response?.data || error.message);
      }
    };
    fetchReports();
  }, []);

  // --- Filter and Sort Logic ---
  useEffect(() => {
    let result = reports.filter((report) => {
      const matchesSearch = report.wellId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === "All" || report.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });

    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredReports(result);
  }, [searchTerm, severityFilter, sortBy, reports]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
              Field <span className="text-blue-600">Intelligence</span>
            </h1>
            <p className="text-slate-500 mt-2 font-bold text-xs uppercase tracking-widest">
              Live Feed // {filteredReports.length} records matching current criteria
            </p>
          </div>

          <Link
            to="/add-report" 
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-black py-4 px-8 rounded-full transition-all duration-300 shadow-xl text-[11px] uppercase tracking-widest active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
            Create New Report
          </Link>
        </div>

        {/* 2. Professional Filter Bar */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 mb-10">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            <input 
              type="text"
              placeholder="Search by Well Identifier..."
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Severity Dropdown */}
          <select 
            className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severity</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort Toggle */}
          <select 
            className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>

        {/* 3. Results Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-white p-24 rounded-[3rem] text-center border border-slate-100 shadow-sm">
            <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">No matching telemetry</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredReports.map((report) => (
              <ReportCard key={report._id} report={report} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportList;