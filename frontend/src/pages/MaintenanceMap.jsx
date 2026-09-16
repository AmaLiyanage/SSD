import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import api from "../api/axios";
import { Map as MapIcon, Filter, Info, ChevronRight, AlertTriangle } from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 200px)",
  borderRadius: "1.5rem",
};

const center = {
  lat: 7.8731, // Default center (Sri Lanka)
  lng: 80.7718,
};

const MaintenanceMap = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState("All");

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDx-eCOnDtK41xamif2J_61AidaPIiwMz4",
  });

  useEffect(() => {
    const fetchMaintenanceTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/maintenance");
        // Filter for tasks that have well data and coordinates
        const taskData = Array.isArray(response.data) ? response.data : response.data.data || [];
        const validTasks = taskData.filter(req => req.wellId && req.wellId.location && req.wellId.location.coordinates);
        setRequests(validTasks);
      } catch (err) {
        console.error("Error fetching map tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceTasks();
  }, []);

  if (loadError) return <div className="p-10 text-center text-red-500 font-bold">Error loading maps</div>;
  if (!isLoaded || loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Initializing Maintenance Map...</div>;

  const filteredRequests = requests.filter(req => {
    if (filter === "All") return req.status !== "Completed";
    return req.status === filter;
  });

  const getMarkerIcon = (priority) => {
    // We can use custom colors for icons
    // In a real app we'd use URL to a PNG/SVG marker
    return null; 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-blue-600" /> Maintenance Route Optimization
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Visualize and plan your field operations efficiently.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
           <button 
             onClick={() => setFilter("All")}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === "All" ? "bg-slate-900 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
             Active
           </button>
           <button 
             onClick={() => setFilter("Pending")}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === "Pending" ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
             Pending
           </button>
           <button 
             onClick={() => setFilter("InProgress")}
             className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === "InProgress" ? "bg-blue-500 text-white" : "text-slate-400 hover:bg-slate-50"}`}
           >
             In Progress
           </button>
        </div>
      </div>

      <div className="relative group">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={8}
          center={filteredRequests.length > 0 ? {
            lat: filteredRequests[0].wellId.location.coordinates[1],
            lng: filteredRequests[0].wellId.location.coordinates[0]
          } : center}
          options={{
            styles: [
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
            ]
          }}
        >
          {filteredRequests.map((req) => (
            <Marker
              key={req._id}
              position={{
                lat: req.wellId.location.coordinates[1],
                lng: req.wellId.location.coordinates[0]
              }}
              onClick={() => setSelectedRequest(req)}
              // label={{ text: req.priority[0], color: "white", fontWeight: "bold" }}
            />
          ))}

          {selectedRequest && (
            <InfoWindow
              position={{
                lat: selectedRequest.wellId.location.coordinates[1],
                lng: selectedRequest.wellId.location.coordinates[0]
              }}
              onCloseClick={() => setSelectedRequest(null)}
            >
              <div className="p-2 min-w-[200px] font-sans">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                    selectedRequest.priority === 'High' ? 'bg-red-100 text-red-600' : 
                    selectedRequest.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {selectedRequest.priority} Priority
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{selectedRequest.status}</span>
                </div>
                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{selectedRequest.wellId.name}</h4>
                <p className="text-xs text-slate-500 italic mb-3 line-clamp-2">"{selectedRequest.description}"</p>
                <Link 
                  to={`/maintenance/${selectedRequest._id}`}
                  className="flex items-center justify-between bg-slate-900 text-white p-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
                >
                  Manage Task <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        {/* Floating Stat Overlay */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-white/20 pointer-events-none">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Overview</p>
           <div className="flex items-center gap-6">
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{filteredRequests.length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Visible Tasks</p>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div>
                <p className="text-2xl font-black text-red-600 leading-none">{filteredRequests.filter(r => r.priority === 'High').length}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Critical</p>
              </div>
           </div>
        </div>
      </div>

      {/* List view below map for quick reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredRequests.slice(0, 3).map(req => (
          <div key={req._id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${req.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                {req.priority === 'High' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
             </div>
             <div>
               <h5 className="font-black text-slate-900 uppercase tracking-tight text-xs">{req.wellId.name}</h5>
               <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">{req.issueType} &bull; {req.status}</p>
               <Link to={`/maintenance/${req._id}`} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Details</Link>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaintenanceMap;
