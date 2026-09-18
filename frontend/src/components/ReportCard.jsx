import React from "react";
import { Link } from "react-router-dom"; 

const ReportCard = ({ report }) => {
  const severityColors = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-300 group">
      
      {/* Image Header - Standardized Aspect Ratio */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {report.photos?.length > 0 ? (
          <img
            src={report.photos[0]}
            alt="Well Status"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span className="text-xs font-medium uppercase tracking-wider">No Image Available</span>
          </div>
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm border border-white">
            {report.wellId}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${severityColors[report.severity] || severityColors.Low} shadow-sm`}>
            {report.severity}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-800 leading-tight mb-3 line-clamp-2">
          {report.description}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-bold">
            {report.reportedBy?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-medium text-slate-500">
            {report.reportedBy?.username || "Unknown Officer"}
          </span>
        </div>

        {/* Technical Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Water Level</p>
            <p className="text-sm font-semibold text-slate-700">{report.waterLevel}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Pump Status</p>
            <p className="text-sm font-semibold text-slate-700">{report.pumpStatus}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-auto mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Comments</h4>
            <Link 
              to={`/add-comment/${report._id}`} 
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Add Comment
            </Link>
          </div>

          {report.comments?.length > 0 ? (
            <div className="space-y-2">
              {report.comments.slice(0, 2).map((c) => (
                <div key={c._id} className="text-xs bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <p className="text-slate-700 italic mb-1">"{c.message}"</p>
                  <p className="text-slate-400 font-medium">— {c.commentedBy?.username}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-300 italic">No comments posted yet.</p>
          )}
        </div>

        {/* Action Bar - View Full Report */}
        <div className="pt-4 border-t border-slate-100">
          <Link 
            to={`/reports/${report._id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all active:scale-95"
          >
            View Full Report
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ReportCard;