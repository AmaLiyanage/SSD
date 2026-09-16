import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, NavLink } from "react-router-dom";
import { getTestById } from "../services/waterService";
import PredictionBadge from "../components/PredictionBadge";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, 
  Edit3, 
  MapPin, 
  Calendar, 
  User, 
  Droplets, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  LayoutDashboard, 
  FilePlus, 
  FlaskConical 
} from "lucide-react";

const WaterQualityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const res = await getTestById(id);
        setTest(res.data?.data || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load water quality test details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white uppercase tracking-[0.3em] font-black text-slate-300 animate-pulse">
        Loading Lab Report...
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-8 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-900 mb-2">Record Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">{error || "The requested water test could not be located."}</p>
          <Link
            to="/water-quality"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to History
          </Link>
        </div>
      </div>
    );
  }

  const ph = Number(test.phLevel);
  const turbidity = Number(test.turbidity);
  const bacteria = Number(test.bacteriaCount);
  const temp = Number(test.temperature);

  const phStatus = (ph < 6.5 || ph > 8.5) ? "Unsafe" : (ph < 6.8 || ph > 8.2) ? "Warning" : "Safe";
  const turbidityStatus = turbidity > 5.0 ? "Unsafe" : turbidity > 4.0 ? "Warning" : "Safe";
  const bacteriaStatus = bacteria > 0 ? "Unsafe" : "Safe";
  const tempStatus = temp > 35 ? "Unsafe" : temp > 30 ? "Warning" : "Safe";

  const wellIdLabel = test.wellId?.wellId || (typeof test.wellId === "string" ? test.wellId : "Unknown");
  const wellName = test.wellId?.name;
  const village = test.wellId?.village;
  const wellType = test.wellId?.type;
  const wellDepth = test.wellId?.depth;

  const testDateFormatted = test.testDate
    ? new Date(test.testDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date(test.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const getEvaluationReasons = () => {
    const reasons = [];
    if (ph < 6.5) reasons.push(`pH Level (${ph}) is acidic, falling below the safe drinking baseline (6.5).`);
    if (ph > 8.5) reasons.push(`pH Level (${ph}) is excessively alkaline, exceeding safe baseline (8.5).`);
    if (ph >= 6.5 && ph < 6.8) reasons.push(`pH Level (${ph}) is within borderline acidic tolerance.`);
    if (ph > 8.2 && ph <= 8.5) reasons.push(`pH Level (${ph}) is within borderline alkaline tolerance.`);

    if (bacteria > 0) reasons.push(`Bacteria count is ${bacteria} CFU/100ml. Standard mandates 0 CFU for potability.`);
    if (turbidity > 5.0) reasons.push(`Turbidity is ${turbidity} NTU, which exceeds the critical limit of 5.0 NTU.`);
    else if (turbidity > 4.0) reasons.push(`Turbidity is ${turbidity} NTU, slightly elevated above standard (≤ 4.0 NTU).`);

    if (temp > 35) reasons.push(`Temperature is ${temp}°C, exceeding permissible water temperature.`);
    else if (temp > 30) reasons.push(`Temperature is ${temp}°C, slightly elevated.`);

    if (reasons.length === 0) {
      return ["All measured water parameters fall within certified safe drinking water guidelines."];
    }
    return reasons;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        
        {/* Header - Styled like FieldOfficerDashboard */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Lab Report <span className="text-blue-600">Details</span>
            </h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">
              Record ID: <span className="font-mono text-slate-900">{test._id}</span> // Certified Laboratory QA
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/water-quality"
              className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition"
            >
              <ArrowLeft className="w-4 h-4" /> All Tests
            </Link>
            <Link
              to={`/water-quality/edit/${test._id}`}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl transition-all duration-300"
            >
              <Edit3 className="w-4 h-4" /> Edit Report
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

        {/* SUMMARY HERO BANNER */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{wellIdLabel}</span>
              {wellName && <span className="text-xl font-bold text-slate-600">• {wellName}</span>}
            </div>
            <p className="text-sm text-slate-500">
              {village ? `Village Location: ${village}` : "Monitored Community Well"}
              {wellType ? ` • Type: ${wellType}` : ""}
              {wellDepth ? ` • Depth: ${wellDepth}m` : ""}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Certified Overall Status</span>
            <PredictionBadge item={test} />
          </div>
        </div>

        {/* METADATA OVERVIEW */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Well Identifier</p>
              <p className="text-lg font-black text-slate-900">{wellIdLabel}</p>
              <p className="text-xs text-slate-500">{village || "Registered Source"}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Analysis Date</p>
              <p className="text-lg font-black text-slate-900">{testDateFormatted}</p>
              <p className="text-xs text-slate-500">Logged: {new Date(test.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lab Technician</p>
              <p className="text-lg font-black text-slate-900">{test.testerName || "Not Recorded"}</p>
              <p className="text-xs text-slate-500">Station Beta QA</p>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
              Laboratory Parameter Breakdown
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* pH */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">pH Measurement</span>
                <p className="text-4xl font-black text-slate-900 mt-2">{test.phLevel}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Safe: 6.5 – 8.5</span>
                <span className={`font-bold ${phStatus === "Safe" ? "text-emerald-600" : "text-amber-600"}`}>
                  {ph < 7.0 ? "Acidic" : ph > 7.0 ? "Alkaline" : "Neutral"}
                </span>
              </div>
            </div>

            {/* Turbidity */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Turbidity Index</span>
                <p className="text-4xl font-black text-slate-900 mt-2">
                  {test.turbidity} <span className="text-sm font-bold text-slate-400">NTU</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Safe: ≤ 4.0 NTU</span>
                <span className={`font-bold ${turbidityStatus === "Safe" ? "text-emerald-600" : "text-amber-600"}`}>
                  {turbidity <= 4.0 ? "Clear" : turbidity <= 5.0 ? "Moderate" : "Turbid"}
                </span>
              </div>
            </div>

            {/* Bacteria */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Coliform Bacteria</span>
                <p className="text-4xl font-black text-slate-900 mt-2">
                  {test.bacteriaCount} <span className="text-sm font-bold text-slate-400">CFU/100ml</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Safe: 0 CFU</span>
                <span className={`font-bold ${bacteriaStatus === "Safe" ? "text-emerald-600" : "text-red-600"}`}>
                  {bacteria === 0 ? "Compliant" : "Contaminated"}
                </span>
              </div>
            </div>

            {/* Temperature */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Temperature</span>
                <p className="text-4xl font-black text-slate-900 mt-2">
                  {test.temperature} <span className="text-sm font-bold text-slate-400">°C</span>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500">Safe: ≤ 30.0 °C</span>
                <span className={`font-bold ${tempStatus === "Safe" ? "text-emerald-600" : "text-amber-600"}`}>
                  {temp <= 30 ? "Normal" : temp <= 35 ? "Warm" : "High Heat"}
                </span>
              </div>
            </div>
          </div>

          {/* Safety Evaluation Callout */}
          <div className={`p-6 rounded-2xl border ${
            test.status === "Safe"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : test.status === "Warning"
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-red-50/70 border-red-200 text-red-900"
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-2">
              {test.status === "Safe" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {test.status === "Warning" && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {test.status === "Unsafe" && <AlertOctagon className="w-5 h-5 text-red-600" />}
              Safety Compliance Assessment
            </h3>
            <ul className="text-sm space-y-1.5 pl-6 list-disc">
              {getEvaluationReasons().map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Remarks Section */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Analyst Remarks & Clinical Observations
            </span>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-sm italic font-serif leading-relaxed">
              {test.remarks ? `"${test.remarks}"` : "No special remarks or anomalies reported for this sample."}
            </div>
          </div>
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

export default WaterQualityDetails;

