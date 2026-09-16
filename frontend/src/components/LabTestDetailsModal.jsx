import React from "react";
import { X, CheckCircle, AlertTriangle, AlertOctagon, Droplets, Calendar, User, MapPin, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LabTestDetailsModal = ({ test, onClose }) => {
  const navigate = useNavigate();

  if (!test) return null;

  const ph = Number(test.phLevel);
  const turbidity = Number(test.turbidity);
  const bacteria = Number(test.bacteriaCount);
  const temp = Number(test.temperature);

  // Determine parameter-level statuses
  const phStatus = (ph < 6.5 || ph > 8.5) ? "Unsafe" : (ph < 6.8 || ph > 8.2) ? "Warning" : "Safe";
  const turbidityStatus = turbidity > 5.0 ? "Unsafe" : turbidity > 4.0 ? "Warning" : "Safe";
  const bacteriaStatus = bacteria > 0 ? "Unsafe" : "Safe";
  const tempStatus = temp > 35 ? "Unsafe" : temp > 30 ? "Warning" : "Safe";

  const overallStatus = test.status || (
    (phStatus === "Unsafe" || turbidityStatus === "Unsafe" || bacteriaStatus === "Unsafe" || tempStatus === "Unsafe")
      ? "Unsafe"
      : (phStatus === "Warning" || turbidityStatus === "Warning" || tempStatus === "Warning")
      ? "Warning"
      : "Safe"
  );

  const wellIdLabel = test.wellId?.wellId || (typeof test.wellId === "string" ? test.wellId : "Unknown");
  const wellName = test.wellId?.name;
  const village = test.wellId?.village;
  const wellType = test.wellId?.type;
  const wellDepth = test.wellId?.depth;

  const testDateFormatted = test.testDate
    ? new Date(test.testDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : test.createdAt
    ? new Date(test.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : "Not Recorded";

  const getStatusBadge = (status) => {
    if (status === "Safe") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white">
          <CheckCircle className="w-3.5 h-3.5" /> Safe
        </span>
      );
    }
    if (status === "Warning") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-900">
          <AlertTriangle className="w-3.5 h-3.5" /> Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white">
        <AlertOctagon className="w-3.5 h-3.5" /> Unsafe
      </span>
    );
  };

  const getEvaluationReasons = () => {
    const reasons = [];
    if (ph < 6.5) reasons.push(`pH level (${ph}) is too acidic (minimum threshold is 6.5)`);
    if (ph > 8.5) reasons.push(`pH level (${ph}) is too alkaline (maximum threshold is 8.5)`);
    if (ph >= 6.5 && ph < 6.8) reasons.push(`pH level (${ph}) is in the borderline low range (6.5 - 6.8)`);
    if (ph > 8.2 && ph <= 8.5) reasons.push(`pH level (${ph}) is in the borderline high range (8.2 - 8.5)`);

    if (bacteria > 0) reasons.push(`Bacteria count is ${bacteria} CFU/100ml (must be 0 for drinking water)`);
    if (turbidity > 5.0) reasons.push(`Turbidity is ${turbidity} NTU (exceeds maximum threshold of 5.0 NTU)`);
    else if (turbidity > 4.0) reasons.push(`Turbidity is ${turbidity} NTU (elevated, safe threshold is ≤ 4.0 NTU)`);

    if (temp > 35) reasons.push(`Temperature is ${temp}°C (critical heat threshold exceeded)`);
    else if (temp > 30) reasons.push(`Temperature is ${temp}°C (slightly elevated)`);

    if (reasons.length === 0) {
      return ["All measured water parameters fall within certified safe drinking water guidelines."];
    }
    return reasons;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-md">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Lab Test Result</h2>
              <p className="text-xs text-slate-400">Sample ID: <span className="font-mono text-slate-200">{test._id}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(overallStatus)}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Well & Sampling Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> Well Source
              </span>
              <p className="font-bold text-slate-800">{wellIdLabel}</p>
              {(wellName || village) && (
                <p className="text-xs text-slate-500">
                  {wellName ? `${wellName}` : ""}{wellName && village ? " • " : ""}{village || ""}
                </p>
              )}
              {wellType && (
                <p className="text-[11px] text-slate-400">{wellType}{wellDepth ? ` (${wellDepth}m depth)` : ""}</p>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Date Sampled
              </span>
              <p className="font-bold text-slate-800">{testDateFormatted}</p>
              <p className="text-xs text-slate-400">Recorded: {new Date(test.createdAt || Date.now()).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-500" /> Lab Analyst
              </span>
              <p className="font-bold text-slate-800">{test.testerName || "Not Recorded"}</p>
              <p className="text-xs text-slate-400">Certified Water Lab</p>
            </div>
          </div>

          {/* Measurements Grid */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Measured Quality Metrics</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* pH Level */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">pH Level</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{test.phLevel}</p>
                  </div>
                  {getStatusBadge(phStatus)}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Standard: 6.5 - 8.5</span>
                  <span className={phStatus === "Safe" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                    {ph < 7.0 ? "Acidic" : ph > 7.0 ? "Alkaline" : "Neutral"}
                  </span>
                </div>
              </div>

              {/* Turbidity */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Turbidity</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{test.turbidity} <span className="text-sm font-bold text-slate-400">NTU</span></p>
                  </div>
                  {getStatusBadge(turbidityStatus)}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Standard: ≤ 4.0 NTU</span>
                  <span className={turbidityStatus === "Safe" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                    {turbidity <= 4.0 ? "Clear" : turbidity <= 5.0 ? "Moderate" : "Cloudy"}
                  </span>
                </div>
              </div>

              {/* Bacteria Count */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Bacteria Count</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{test.bacteriaCount} <span className="text-sm font-bold text-slate-400">CFU/100ml</span></p>
                  </div>
                  {getStatusBadge(bacteriaStatus)}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Standard: 0 CFU</span>
                  <span className={bacteriaStatus === "Safe" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                    {bacteria === 0 ? "Contaminant Free" : "Pathogen Detected"}
                  </span>
                </div>
              </div>

              {/* Temperature */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Water Temperature</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{test.temperature} <span className="text-sm font-bold text-slate-400">°C</span></p>
                  </div>
                  {getStatusBadge(tempStatus)}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Standard: ≤ 30.0 °C</span>
                  <span className={tempStatus === "Safe" ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                    {temp <= 30 ? "Optimal" : temp <= 35 ? "Warm" : "Critical High"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Evaluation Notes */}
          <div className={`p-4 rounded-2xl border ${
            overallStatus === "Safe"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : overallStatus === "Warning"
              ? "bg-amber-50/70 border-amber-200 text-amber-900"
              : "bg-red-50/70 border-red-200 text-red-900"
          }`}>
            <h4 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {overallStatus === "Safe" && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              {overallStatus === "Warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
              {overallStatus === "Unsafe" && <AlertOctagon className="w-4 h-4 text-red-600" />}
              Safety Assessment Evaluation
            </h4>
            <ul className="text-xs space-y-1 pl-5 list-disc">
              {getEvaluationReasons().map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          {/* Tester Remarks */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Analyst Observations / Remarks</span>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm italic font-serif">
              {test.remarks ? `"${test.remarks}"` : "No special remarks or anomalies recorded for this sample."}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition"
          >
            Close
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate(`/water-quality/edit/${test._id}`);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition shadow"
            >
              Edit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestDetailsModal;

