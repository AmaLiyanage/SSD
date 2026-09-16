import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, ArrowLeft, Send } from "lucide-react";

const MaintenanceForm = () => {
  const [wells, setWells] = useState([]);
  const [formData, setFormData] = useState({
    wellId: "",
    issueType: "",
    description: "",
    priority: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();

  useEffect(() => {
    const fetchWells = async () => {
      try {
        const response = await api.get("/wells"); 
        // Backend returns: { success: true, count: X, data: [...] }
        if (response.data && response.data.data) {
          setWells(response.data.data);
        } else {
          setWells(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        console.error("Failed to fetch wells:", err);
        setError("Failed to load wells. Please try again later.");
      }
    };
    fetchWells();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.wellId) {
      setError("Please select a well before submitting.");
      setLoading(false);
      return;
    }

    try {
      await api.post("/maintenance", formData);
      navigate("/maintenance");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Failed to submit maintenance request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/maintenance")}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Requests
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4">
          <h1 className="text-xl font-bold text-white">Report Maintenance Issue</h1>
          <p className="text-blue-100 mt-1 text-sm">Please provide details about the well condition.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="wellId" className="block text-sm font-medium text-gray-700">
                Select Well *
              </label>
              <select
                id="wellId"
                name="wellId"
                value={formData.wellId}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="" disabled>Select a well</option>
                {wells.map((well) => (
                  <option key={well._id} value={well._id}>
                    {well.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">
                Issue Type *
              </label>
              <select
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="" disabled>Select issue type</option>
                <option value="PumpDamage">Pump Damage</option>
                <option value="Contamination">Contamination</option>
                <option value="DryWell">Dry Well</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Priority Level</label>
            <div className="grid grid-cols-3 gap-3">
              {['Low', 'Medium', 'High'].map((level) => (
                <div key={level} className="flex items-center">
                  <input
                    id={`priority-${level}`}
                    name="priority"
                    type="radio"
                    value={level}
                    checked={formData.priority === level}
                    onChange={handleChange}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor={`priority-${level}`} className="ml-3 block text-sm font-medium text-gray-700">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Detailed Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
              minLength={10}
              placeholder="Please describe the issue in detail (at least 10 characters)..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
            />
            <p className="text-xs text-gray-500 text-right">
              {formData.description.length} characters
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/maintenance")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;
