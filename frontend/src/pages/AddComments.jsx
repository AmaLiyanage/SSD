import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const AddComments = () => {
  const { id } = useParams(); // Get reportId from URL
  const navigate = useNavigate();
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reportDetails, setReportDetails] = useState(null);

  // Optional: Fetch basic report info so the user knows which well they are commenting on
  useEffect(() => {
    const fetchReportInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReportDetails(res.data);
      } catch (err) {
        console.error("Error fetching report details", err);
      }
    };
    fetchReportInfo();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/reports/${id}/comments`,
        { message },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Redirect back to dashboard after success
      navigate("/reports"); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment. Min 3 characters required.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white">
          <h2 className="text-xl font-bold">Add Field Comment</h2>
          {reportDetails && (
            <p className="text-slate-400 text-sm mt-1">
              Updating Well: <span className="text-blue-400 font-mono">{reportDetails.wellId}</span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              Your Message
            </label>
            <textarea
              required
              rows="5"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
              placeholder="Describe the current situation or action taken..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              * Minimum 3 characters required.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all ${
                loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComments;