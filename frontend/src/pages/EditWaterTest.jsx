import React, { useEffect, useState } from "react";
import { getTestById, updateTest } from "../services/waterService";
import { useNavigate, useParams, Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  LayoutDashboard, 
  FilePlus, 
  FlaskConical, 
  Droplets, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";

const EditWaterTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    wellId: "",
    testerName: "",
    testDate: "",
    phLevel: "",
    turbidity: "",
    bacteriaCount: "",
    temperature: "",
    remarks: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTestById(id);
        const data = res.data?.data || res.data;
        setForm({
          wellId: data.wellId || "",
          testerName: data.testerName || "",
          testDate: data.testDate ? new Date(data.testDate).toISOString().split("T")[0] : "",
          phLevel: data.phLevel ?? "",
          turbidity: data.turbidity ?? "",
          bacteriaCount: data.bacteriaCount ?? "",
          temperature: data.temperature ?? "",
          remarks: data.remarks || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load test.");
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await updateTest(id, {
        phLevel: Number(form.phLevel),
        turbidity: Number(form.turbidity),
        bacteriaCount: Number(form.bacteriaCount),
        temperature: Number(form.temperature),
        testDate: form.testDate ? new Date(form.testDate) : undefined,
        remarks: form.remarks
      });
      navigate(`/water-quality/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update water test.");
    } finally {
      setLoading(false);
    }
  };

  const wellLabel = typeof form.wellId === "object"
    ? `${form.wellId.wellId || "Unknown"}${form.wellId.name ? ` - ${form.wellId.name}` : ""}${form.wellId.village ? ` (${form.wellId.village})` : ""}`
    : form.wellId;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header - Styled like FieldOfficerDashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Update <span className="text-blue-600">Water Test</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Analyst: <span className="text-slate-900">{user?.username}</span> // Record ID: {id}
            </p>
          </div>
          <Link
            to={`/water-quality/${id}`}
            className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel & View Details
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

        {/* EDIT FORM CARD */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-8 sm:p-10 max-w-3xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-black mb-2 text-slate-900">Modify Measured Parameters</h2>
            <p className="text-slate-600 text-sm">
              Adjust any measurement below. The system automatically recalculates the safety compliance status upon saving.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STATIC METADATA */}
            <div className="grid gap-6 md:grid-cols-2 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Source Well</label>
                <p className="mt-1 font-bold text-slate-900 text-sm">{wellLabel || "Unknown Well"}</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">Technician</label>
                <p className="mt-1 font-bold text-slate-900 text-sm">{form.testerName || "Unknown Tester"}</p>
              </div>
            </div>

            {/* DATE */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Sample / Analysis Date</label>
              <input
                type="date"
                name="testDate"
                value={form.testDate}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                required
              />
            </div>

            {/* MEASUREMENTS */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">pH Level</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="14"
                  name="phLevel"
                  value={form.phLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400">Safe guideline: 6.5 to 8.5</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Turbidity (NTU)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  name="turbidity"
                  value={form.turbidity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400">Safe threshold: ≤ 4.0 NTU</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Bacteria Count (CFU/100ml)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="bacteriaCount"
                  value={form.bacteriaCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400">Standard mandate: 0 CFU</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  min="-20"
                  max="100"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-400">Normal guideline: ≤ 30.0°C</p>
              </div>
            </div>

            {/* REMARKS */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Remarks (Optional)</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                rows="3"
              />
            </div>

            {/* BUTTONS */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-lg"
              >
                {loading ? "Saving Changes..." : "Save Changes"}
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

export default EditWaterTest;