import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AddWellReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wells, setWells] = useState([]);
  const [reportedWellIds, setReportedWellIds] = useState([]); 
  const [formData, setFormData] = useState({
    wellId: "",
    waterLevel: "High",
    pumpStatus: "Working",
    severity: "Low",
    description: "",
  });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch ALL Assets
        const wellsRes = await axios.get("http://localhost:5000/api/wells", { headers });
        const wellsData = wellsRes.data?.data || wellsRes.data;
        if (Array.isArray(wellsData)) setWells(wellsData);

        // 2. Fetch ALL Reports from ALL Field Officers
        const reportsRes = await axios.get("http://localhost:5000/api/reports", { headers });
        const allReports = Array.isArray(reportsRes.data) ? reportsRes.data : (reportsRes.data?.data || []);
        
        // 3. GLOBAL LOCKING LOGIC
        // We remove the .filter() by user so that we see every report ever made
        const allReportedIds = allReports.map(report => {
          // Extract wellId regardless of whether it's an object or string
          const idValue = report.wellId?.wellId || report.wellId;
          return String(idValue || "").trim().toUpperCase();
        });

        console.log("Global Locked Wells (All Officers):", allReportedIds);
        
        setReportedWellIds([...new Set(allReportedIds)]);
      } catch (err) {
        console.error("Sync Error:", err);
      }
    };
    if (user) fetchInitialData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.trim().length < 10) {
      setError("Description is too short (min 10 chars).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (photo) data.append("photo", photo);

      await axios.post("http://localhost:5000/api/reports", data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });

      setNotification({ show: true, message: "Report Saved." });
      setTimeout(() => navigate("/reports"), 1500);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Submission failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      {notification.show && (
        <div className="fixed top-5 right-5 z-[100] px-6 py-4 rounded-2xl shadow-2xl bg-white border-l-4 border-emerald-500 animate-bounce text-[10px] font-black uppercase tracking-widest text-emerald-600">
          ✓ {notification.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-black uppercase tracking-tight">New Well Report</h1>
          <p className="text-slate-400 text-[10px] mt-2 font-mono uppercase italic">Station Alpha // Entry Terminal</p>
        </div>

        {error && (
          <div className="mx-8 mt-6 p-4 bg-red-50 border border-red-500/20 text-red-600 rounded-xl text-xs font-black animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Well Identifier</label>
            <select
              name="wellId"
              value={formData.wellId}
              onChange={handleChange}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">-- Select an Asset --</option>
              {wells.map((well) => {
                const wellCode = String(well.wellId || "").trim().toUpperCase();
                const isLocked = reportedWellIds.includes(wellCode);

                return (
                  <option 
                    key={well._id} 
                    value={well.wellId} 
                    disabled={isLocked}
                    className={isLocked ? "text-slate-300 bg-slate-50" : "text-slate-900"}
                  >
                    {well.wellId} - {well.village} {isLocked ? "(  ALREADY REPORTED )" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["waterLevel", "pumpStatus", "severity"].map((field) => (
              <div key={field} className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <select name={field} value={formData[field]} onChange={handleChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 uppercase text-xs">
                  {field === "waterLevel" && ["High", "Medium", "Low"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {field === "pumpStatus" && ["Working", "Damaged", "Missing"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  {field === "severity" && ["Low", "Medium", "High"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Field Observations</label>
              <span className={`text-[10px] font-black ${formData.description.length < 10 ? 'text-red-400' : 'text-emerald-500'}`}>
                {formData.description.length}/10
              </span>
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium"
              required
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Photo Evidence</label>
            <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 relative">
              {preview ? <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow-lg border-2 border-white" /> : <div className="w-20 h-20 bg-slate-200 rounded-xl" />}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter italic">Tap to upload</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 border border-slate-200 text-slate-400 text-[10px] uppercase font-black rounded-xl">Cancel</button>
            <button type="submit" disabled={loading || formData.description.length < 10} className={`flex-1 py-4 text-white text-[10px] uppercase font-black rounded-xl transition-all ${loading || formData.description.length < 10 ? "bg-slate-300" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100"}`}>
              {loading ? "Syncing..." : "Submit File"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWellReport;