import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const EditWell = () => {
  const { id } = useParams(); // Gets the Mongo ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    village: "",
    depth: "",
    type: "",
    status: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch existing data when component loads
  useEffect(() => {
    const fetchWell = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/wells/id/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const wellData = res.data.data;
        setFormData({
          name: wellData.name,
          village: wellData.village,
          depth: wellData.depth,
          type: wellData.type,
          status: wellData.status,
        });
        setLoading(false);
      } catch (err) {
        setError("Failed to load well details.");
        setLoading(false);
      }
    };
    fetchWell();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      
      // Update Metadata
      await axios.put(`http://localhost:5000/api/wells/${id}`, {
        name: formData.name,
        village: formData.village,
        depth: formData.depth,
        type: formData.type
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update Status (Separate endpoint in your backend)
      await axios.patch(`http://localhost:5000/api/wells/${id}/status`, {
        status: formData.status
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/wells"); // Redirect back to list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update well");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading form...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto font-sans">
      <div className="mb-8">
        <Link to="/wells" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Back to Wells</Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Well Details</h1>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Depth (meters)</label>
              <input type="number" name="depth" value={formData.depth} onChange={handleChange} required min="1" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="Active">Active</option>
                <option value="Dry">Dry</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Update Well
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWell;