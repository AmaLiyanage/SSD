import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import { 
  Plus, AlertTriangle, Clock, CheckCircle, Droplet, 
  Zap, Search, LayoutDashboard, Database, FileText, 
  FlaskConical, Settings, LogOut, Toolbox
} from "lucide-react";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const AdminDashboard = () => {
  const { logout } = useAuth();

  const [wells, setWells] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDx-eCOnDtK41xamif2J_61AidaPIiwMz4", // Make sure to restrict this key in Google Cloud Console!
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [wellsRes, maintenanceRes] = await Promise.all([
          api.get("/wells"),
          api.get("/maintenance")
        ]);

        setWells(wellsRes.data.data);
        setMaintenance(maintenanceRes.data);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderMarkers = () => {
    if (!mapRef.current || !window.google) return;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    wells.forEach((well) => {
      if (well.location?.coordinates) {
        const marker = new window.google.maps.Marker({
          position: {
            lat: well.location.coordinates[1],
            lng: well.location.coordinates[0],
          },
          map: mapRef.current,
          title: `${well.name} - ${well.village}`,
        });

        markersRef.current.push(marker);
      }
    });
  };

  useEffect(() => {
    renderMarkers();
  }, [wells]);

  // Helper function for styling active vs inactive links
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "py-3 px-4 bg-blue-800 text-white rounded-lg font-medium shadow-inner transition-colors"
      : "py-3 px-4 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg font-medium transition-colors";

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-blue-600 text-white flex flex-col p-6 shadow-xl z-10">
        <h2 className="text-2xl font-extrabold mb-10 tracking-tight">Admin Panel</h2>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2">
          <NavLink to="/admin" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/wells" className={navLinkClass}>
            Wells
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            Reports
          </NavLink>
          <NavLink to="/lab-reports" className={navLinkClass}>
            Lab Reports
          </NavLink>
          <NavLink to="/maintenance" className={navLinkClass}>
            Maintenance
          </NavLink>
        </nav>

        {/* Logout remains a button because it triggers a function, not a route */}
        <button
          onClick={logout}
          className="mt-auto py-3 px-4 bg-blue-700 hover:bg-red-500 text-white rounded-lg font-medium transition-colors text-left flex items-center justify-between group"
        >
          Logout
          <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-gray-500 mt-1">Monitor well statuses and locations in real-time.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Total Wells</p>
              <h2 className="text-4xl font-extrabold text-blue-600">{wells.length}</h2>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Active Tasks</p>
              <h2 className="text-4xl font-extrabold text-orange-600">
                {maintenance.filter(m => m.status !== "Completed").length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
              <Toolbox className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Critical Failures</p>
              <h2 className="text-4xl font-extrabold text-red-600">
                {maintenance.filter(m => m.priority === "High" && m.status !== "Completed").length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Ready Units</p>
              <h2 className="text-4xl font-extrabold text-emerald-600">
                {wells.length - maintenance.filter(m => m.status !== "Completed").length}
              </h2>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Google Map Section */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Interactive Map</h3>
          </div>
          <div className="p-2">
            {isLoaded ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={10}
                  center={{ lat: 6.9497, lng: 80.7898 }}
                  onLoad={(map) => (mapRef.current = map)}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                  }}
                />
              </div>
            ) : (
              <div className="w-full h-100 bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
                <p className="text-gray-500 font-medium">Initializing Map Data...</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboard;