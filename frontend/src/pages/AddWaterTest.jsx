import React, { useEffect, useState } from "react";
import { createTest } from "../services/waterService";
import api from "../api/axios";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  FilePlus, 
  FlaskConical, 
  Droplets, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const AddWaterTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    wellId: "",
    testerName: user?.name || user?.username || "",
    testDate: new Date().toISOString().split("T")[0],
    phLevel: "",
    turbidity: "",
    bacteriaCount: "",
    temperature: "",
    remarks: ""
  });

  useEffect(() => {
    const fetchWells = async () => {
      try {
        const res = await api.get("/wells");
        setWells(Array.isArray(res.data) ? res.data : res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load monitored wells.");
      }
    };
    fetchWells();
  }, []);

  useEffect(() => {
    if ((user?.name || user?.username) && !form.testerName) {
      setForm(prev => ({ ...prev, testerName: user.name || user.username }));
    }
  }, [user]);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const res = await createTest({
        wellId: form.wellId,
        testerName: form.testerName,
        testDate: form.testDate ? new Date(form.testDate) : new Date(),
        phLevel: Number(form.phLevel),
        turbidity: Number(form.turbidity),
        bacteriaCount: Number(form.bacteriaCount),
        temperature: Number(form.temperature),
        remarks: form.remarks
      });

      setSuccess("Water quality test recorded successfully.");
      setTimeout(() => {
        if (res?.data?._id) {
          navigate(`/water-quality/${res.data._id}`);
        } else {
          navigate("/water-quality");
        }
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save water quality test.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header - Styled like FieldOfficerDashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Record <span className="text-blue-600">Water Test</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Analyst: <span className="text-slate-900">{user?.username}</span> // Station Beta (Water QA)
            </p>
          </div>
          <Link
            to="/water-quality"
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Test History
          </Link>
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

        {/* MAIN CREATE FORM CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-2 text-slate-900">New Water Quality Sample Entry</h2>
            <p className="text-slate-600 text-sm">
              Input laboratory sample measurements for verification against public drinking water standards.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-sm font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* WELL & SAMPLING DETAILS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                <h3 className="text-base font-bold text-slate-800">Well & Sample Metadata</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Select Well Source</label>
                  <select
                    name="wellId"
                    value={form.wellId}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                    required
                  >
                    <option value="">Choose a well...</option>
                    {wells.map((well) => (
                      <option key={well._id} value={well._id}>
                        {well.wellId} {well.name ? `- ${well.name}` : ""} ({well.village})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">Location where the water sample was extracted</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Lab Analyst / Tester</label>
                  <input
                    name="testerName"
                    value={form.testerName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="Enter analyst name"
                    required
                  />
                  <p className="text-[11px] text-slate-500">Certified analyst signing off this report</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Sampling / Analysis Date</label>
                  <input
                    type="date"
                    name="testDate"
                    value={form.testDate}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                    required
                  />
                  <p className="text-[11px] text-slate-500">Date on which sample measurements were conducted</p>
                </div>
              </div>
            </div>

            {/* WATER QUALITY MEASUREMENTS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                <h3 className="text-base font-bold text-slate-800">Measured Quality Metrics</h3>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {/* pH Level */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">pH Level</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="14"
                    name="phLevel"
                    value={form.phLevel}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    placeholder="e.g. 7.2"
                    required
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Standard range: 6.5 – 8.5</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      form.phLevel && (Number(form.phLevel) < 6.5 || Number(form.phLevel) > 8.5)
                        ? 'bg-red-100 text-red-700'
                        : form.phLevel && (Number(form.phLevel) < 6.8 || Number(form.phLevel) > 8.2)
                        ? 'bg-amber-100 text-amber-700'
                        : form.phLevel
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {form.phLevel
                        ? (Number(form.phLevel) >= 6.5 && Number(form.phLevel) <= 8.5 ? 'Compliant' : 'Out of Bounds')
                        : 'Enter value'}
                    </span>
                  </div>
                </div>

                {/* Turbidity */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Turbidity (NTU)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    name="turbidity"
                    value={form.turbidity}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    placeholder="e.g. 2.1"
                    required
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Safe threshold: ≤ 4.0 NTU</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      form.turbidity && Number(form.turbidity) > 5.0
                        ? 'bg-red-100 text-red-700'
                        : form.turbidity && Number(form.turbidity) > 4.0
                        ? 'bg-amber-100 text-amber-700'
                        : form.turbidity
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {form.turbidity
                        ? (Number(form.turbidity) <= 4.0 ? 'Clear' : Number(form.turbidity) <= 5.0 ? 'Borderline' : 'Turbid')
                        : 'Enter value'}
                    </span>
                  </div>
                </div>

                {/* Bacteria Count */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Bacteria Count (CFU/100ml)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    name="bacteriaCount"
                    value={form.bacteriaCount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    placeholder="0"
                    required
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Safe: Must be 0 CFU</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      form.bacteriaCount !== "" && Number(form.bacteriaCount) > 0
                        ? 'bg-red-100 text-red-700'
                        : form.bacteriaCount !== ""
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {form.bacteriaCount !== ""
                        ? (Number(form.bacteriaCount) === 0 ? 'Pathogen Free' : 'Contaminated')
                        : 'Enter value'}
                    </span>
                  </div>
                </div>

                {/* Temperature */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Water Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="-20"
                    max="100"
                    name="temperature"
                    value={form.temperature}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm"
                    placeholder="e.g. 24.5"
                    required
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Normal range: 10.0°C – 30.0°C</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      form.temperature && Number(form.temperature) > 35
                        ? 'bg-red-100 text-red-700'
                        : form.temperature && Number(form.temperature) > 30
                        ? 'bg-amber-100 text-amber-700'
                        : form.temperature
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {form.temperature
                        ? (Number(form.temperature) <= 30 ? 'Normal' : Number(form.temperature) <= 35 ? 'Warm' : 'Elevated Heat')
                        : 'Enter value'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* REMARKS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
                <h3 className="text-base font-bold text-slate-800">Analyst Remarks & Observations</h3>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none text-sm"
                  placeholder="Document visual clarity, sediment, unusual odor, recent rainfall, or equipment used..."
                  rows="3"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate("/water-quality")}
                className="px-8 py-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg"
              >
                {loading ? "Saving Lab Test..." : "Save Water Quality Test"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center text-slate-300 font-black text-[9px] uppercase tracking-widest py-8">
          <p>WellSync Global // Lab Operations Center</p>
          <p>v2.0.4-Final</p>
        </footer>
      </div>
    </div>
  );
};

export default AddWaterTest;

