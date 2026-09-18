import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link
import axios from "axios";

const WellReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(res.data);
      } catch (err) {
        console.error("Error fetching report", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) return <div className="p-10 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Generating Record...</div>;
  if (!report) return <div className="p-10 text-center text-red-500 font-bold uppercase underline">Report Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-200 py-6 px-4 print:bg-white print:p-0">
      
      {/* 1-PAGE STYLING OVERRIDE */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 0 !important; }
          html, body { height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
          nav, .no-print, button { display: none !important; }
          .print-wrapper {
            position: fixed; top: 0; left: 0; width: 210mm; height: 297mm;
            z-index: 9999; background: white !important;
            display: flex; flex-direction: column;
          }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />

      {/* Main Container */}
      <div className="print-wrapper mx-auto max-w-[800px] bg-white shadow-2xl overflow-hidden print:shadow-none print:border-none flex flex-col h-full min-h-[297mm]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 flex justify-between items-center border-b-8 border-blue-600">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Inspection Record</h1>
            <p className="text-blue-400 text-[9px] font-mono mt-1 uppercase tracking-widest">
              REF: {report._id.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 text-[10px] font-black uppercase border-2 ${
                report.severity === 'High' ? 'border-red-500 text-red-500' : 'border-emerald-500 text-emerald-500'
              }`}>
                {report.severity} Priority
            </span>
          </div>
        </div>

        {/* UI Controls - Updated with Edit Button */}
        <div className="no-print bg-slate-50 border-b px-10 py-3 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-all">
            ← Back
          </button>
          
          <div className="flex gap-3">
            {/* NEW UPDATE BUTTON */}
            <Link 
              to={`/update-report/${report._id}`} 
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-100 transition-all flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Report
            </Link>

            <button onClick={() => window.print()} className="bg-blue-600 text-white px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-blue-700">
              Export PDF
            </button>
          </div>
        </div>

        {/* ... Rest of your body content remains exactly the same ... */}
        <div className="p-10 flex-1 flex flex-col gap-8">
           {/* Section 1: Asset ID */}
           <section className="flex justify-between items-end border-b-2 border-slate-100 pb-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Identifier</h2>
              <p className="text-4xl font-black text-slate-900 tracking-tight leading-none">{report.wellId}</p>
            </div>
            <div className="text-right leading-tight">
              <p className="text-base font-bold text-slate-800">{new Date(report.createdAt).toLocaleDateString()}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </section>

          {/* Section 2: Stats Grid */}
          <section className="grid grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Water Level</p>
              <p className="text-lg font-bold text-slate-800 uppercase">{report.waterLevel}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Pump Status</p>
              <p className="text-lg font-bold text-slate-800 uppercase">{report.pumpStatus}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Validation</p>
              <p className="text-lg font-bold text-blue-600 uppercase tracking-tighter italic">{report.status}</p>
            </div>
          </section>

          {/* Section 3: Observation Narrative */}
          <section className="p-6 bg-slate-50 border-l-8 border-slate-200 rounded-r-xl">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Technical Observations</h2>
             <p className="text-slate-700 leading-relaxed text-md font-medium italic font-serif">
                "{report.description}"
             </p>
          </section>

          {/* Section 4: Visual Attachment */}
          <section className="space-y-4">
            <div className="flex items-center gap-4">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Visual Verification Attachment</h2>
               <div className="h-px bg-slate-100 w-full"></div>
            </div>
            <div className="mx-auto max-w-[480px] p-2 bg-slate-50 border-2 border-slate-100 rounded-2xl">
              <div className="rounded-xl overflow-hidden bg-white max-h-[300px] flex items-center justify-center">
                {report.photos?.length > 0 ? (
                  <img src={report.photos[0]} alt="Field evidence" className="w-full h-full object-contain" />
                ) : (
                  <div className="py-20 text-center text-slate-200 italic text-[10px] uppercase font-black">Photo Not Provided</div>
                )}
              </div>
            </div>
          </section>

          {/* Section 5: Signature Area */}
          <div className="mt-auto pb-10">
            <div className="flex justify-between items-end border-t-2 border-slate-900 pt-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Certifying Officer</p>
                <p className="text-xl font-bold text-slate-900 uppercase underline decoration-blue-500 decoration-4 underline-offset-4">
                  {report.reportedBy?.username || 'Field Personnel'}
                </p>
              </div>
              <div className="text-right">
                <div className="border-2 border-dashed border-slate-200 p-4 rounded-lg opacity-40 inline-block rotate-3">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Security Seal</p>
                  <p className="text-[10px] font-mono font-black text-slate-500">{new Date().getFullYear()}/VERIFIED</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Banner */}
        <div className="bg-slate-900 p-6 text-center">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.5em]">
            Official Digital Record &bull; WellSync Field Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default WellReportDetails;