import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const AddWell = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    wellId: "",
    name: "",
    village: "",
    lat: "",
    lng: "",
    depth: "",
    type: "Tube Well", // Default matching your schema enum
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/wells", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/wells"); // Redirect back to list on success
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create well");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      <div className="mb-8">
        <Link to="/wells" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Wells</Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Well</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Well ID (e.g., WELL-001)</label>
              <input type="text" name="wellId" value={formData.wellId} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Village</label>
              <input type="text" name="village" value={formData.village} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Tube Well">Tube Well</option>
                <option value="Open Well">Open Well</option>
                <option value="Bore Well">Bore Well</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depth (meters)</label>
              <input type="number" name="depth" value={formData.depth} onChange={handleChange} required min="1" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
              {loading ? "Saving..." : "Save Well"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWell;