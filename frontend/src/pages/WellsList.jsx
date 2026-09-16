import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // <-- Added AuthContext

const WellsList = () => {
  const { user } = useAuth(); // <-- Destructure user to get their role
  
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const wellsPerPage = 6;

  const fetchWells = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/wells", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWells(res.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch wells data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWells();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/wells/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWells(wells.filter((well) => well._id !== id));
      } catch (err) {
        alert("Error deleting well.");
      }
    }
  };

  const filteredWells = wells.filter((well) => {
    const matchesSearch = 
      well.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      well.wellId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      well.village.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || well.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  useEffect(() => setCurrentPage(1), [searchTerm, statusFilter]);

  const indexOfLastWell = currentPage * wellsPerPage;
  const indexOfFirstWell = indexOfLastWell - wellsPerPage;
  const currentWells = filteredWells.slice(indexOfFirstWell, indexOfLastWell);
  const totalPages = Math.ceil(filteredWells.length / wellsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const activeCount = wells.filter(w => w.status === 'Active').length;
  const maintenanceCount = wells.filter(w => w.status === 'Maintenance').length;
  const dryCount = wells.filter(w => w.status === 'Dry').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-600">
        <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium animate-pulse">Loading well database...</p>
      </div>
    );
  }

  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      <style>{`@keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } } .animate-card { animation: slideUpFade 0.5s ease-out forwards; opacity: 0; }`}</style>

      {/* Header Area */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-gray-900 to-blue-800 tracking-tight">Well Management</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 font-medium">
              <span className="bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">Total: {wells.length}</span>
              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full shadow-sm">Active: {activeCount}</span>
              <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 rounded-full shadow-sm">Maintenance: {maintenanceCount}</span>
              {dryCount > 0 && <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full shadow-sm">Dry: {dryCount}</span>}
            </div>
          </div>

          {/* ROLE CHECK: Only Admins can add new wells */}
          {user?.role === 'admin' && (
            <Link to="/wells/add" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-blue-600/30 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 group whitespace-nowrap">
              <svg className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Add New Well
            </Link>
          )}
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
            <input type="text" placeholder="Search by ID, Name, or Village..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none" />
          </div>
          <div className="sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-11 pr-10 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition-all outline-none appearance-none font-medium text-gray-700 cursor-pointer">
              <option value="All">All Statuses</option>
              <option value="Active">🟢 Active</option>
              <option value="Maintenance">🟡 Maintenance</option>
              <option value="Dry">🔴 Dry</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></div>
          </div>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredWells.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <p className="text-gray-900 text-xl font-bold">No results found.</p>
          <p className="text-gray-500 mt-2 mb-6">We couldn't find any wells matching your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {currentWells.map((well, index) => (
            <div key={well._id} className="animate-card bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden relative group" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-blue-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10"></div>
              
              <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/30 group-hover:bg-blue-50/30 transition-colors duration-300">
                <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider shadow-sm group-hover:border-blue-200 group-hover:text-blue-700 transition-colors">
                  {well.wellId}
                </span>
                
                {/* ROLE CHECK: Only Admins can see Edit and Delete icons */}
                {user?.role === 'admin' && (
                  <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                    <Link to={`/wells/edit/${well._id}`} className="text-gray-400 hover:text-blue-600 p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-blue-50 hover:border-blue-200 hover:scale-110 transition-all duration-200" title="Edit Well">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                    <button onClick={() => handleDelete(well._id, well.name)} className="text-gray-400 hover:text-red-600 p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-red-50 hover:border-red-200 hover:scale-110 transition-all duration-200" title="Delete Well">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors duration-300">{well.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${well.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : well.status === 'Maintenance' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {well.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {well.village}
                </p>
                <div className="flex items-center gap-2 mt-auto text-sm text-gray-600 bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100 w-max group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors duration-300">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  {well.type} &bull; {well.depth}m
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
                <Link to={`/wells/${well._id}`} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                  View Full Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
                
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 font-medium transition-all bg-white shadow-sm hover:shadow">Previous</button>
          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} onClick={() => paginate(index + 1)} className={`w-10 h-10 rounded-xl font-medium transition-all shadow-sm hover:shadow ${currentPage === index + 1 ? "bg-blue-600 text-white border-transparent shadow-md transform -translate-y-0.5" : "bg-white text-gray-600 border border-gray-200 hover:bg-blue-50"}`}>
                {index + 1}
              </button>
            ))}
          </div>
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 font-medium transition-all bg-white shadow-sm hover:shadow">Next</button>
        </div>
      )}
    </div>
  );
};

export default WellsList;