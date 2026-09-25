import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "1rem" };

const WellDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [well, setWell] = useState(null);
  const [labReports, setLabReports] = useState([]);
  const [maintenanceReports, setMaintenanceReports] = useState([]);
  const [fieldReports, setFieldReports] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTabState, setActiveTabState] = useState(location.state?.activeTab || "overview");

  const { isLoaded: isMapLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyDx-eCOnDtK41xamif2J_61AidaPIiwMz4", 
  });

  const isAdmin = user?.role === 'admin';
  const isFieldOfficer = user?.role === 'field_officer';
  const isLabTester = user?.role === 'lab_tester';
  const isCustomer = (user?.role === 'customer' || user?.role === 'communityUser');

  const canEditDetails = isAdmin;
  const canChangeStatus = isAdmin || isFieldOfficer;
  const canAddMaintenance = isAdmin || isFieldOfficer;
  const canAddFieldReport = isAdmin || isFieldOfficer;
  const canAddLabReport = isAdmin || isLabTester;

  let availableTabs = [{ id: 'overview', label: 'Overview' }];
  
  if (isAdmin || isCustomer) {
    availableTabs.push(
      { id: 'lab', label: 'Lab Reports' },
      { id: 'maintenance', label: 'Maintenance History' },
      { id: 'field', label: 'Field Reports' }
    );
  } else if (isFieldOfficer) {
    availableTabs.push(
      { id: 'maintenance', label: 'Maintenance History' },
      { id: 'field', label: 'Field Reports' }
    );
  } else if (isLabTester) {
    availableTabs.push({ id: 'lab', label: 'Lab Reports' });
  }

  const allowedTabIds = availableTabs.map(t => t.id);
  const currentTab = allowedTabIds.includes(activeTabState) ? activeTabState : 'overview';

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // 1. Well Details
        const wellRes = await api.get(`/wells/id/${id}`);
        setWell(wellRes.data.data);

        // 2. Lab Reports
        if (isAdmin || isLabTester || isCustomer) {
          try { 
            const labRes = await api.get(`/water-quality/well/${id}`); 
            setLabReports(labRes.data.data || labRes.data || []); 
          } catch (e) { console.log("Lab reports error", e); }
        }

        // 3. Maintenance & Field Reports
        if (isAdmin || isFieldOfficer || isCustomer) {
          try { 
            const mainRes = await api.get("/maintenance");
            const maintenance = Array.isArray(mainRes.data) ? mainRes.data : mainRes.data?.data || [];
            setMaintenanceReports(maintenance.filter((request) => {
              const requestWellId = request.wellId?._id || request.wellId;
              return String(requestWellId) === String(id);
            }));
          } catch (e) { console.log("Maintenance reports error"); }
          
          try { 
  // IMPORTANT: Verify if your backend expects the MongoDB _id or the String WellId
  // If your route uses Report.find({ wellId: req.params.wellId }), make sure you are sending well.wellId
  const fieldRes = await api.get(`/reports/well/${id}`); 
  
  console.log("Full API Response:", fieldRes); // Debugging line

  const fetchedReports = fieldRes.data.data || fieldRes.data || [];
  
  if (Array.isArray(fetchedReports)) {
    setFieldReports(fetchedReports);
  } else {
    // If backend returns a single object instead of array
    setFieldReports([fetchedReports]);
  }
} catch (e) { 
  console.error("Field reports connection failed:", e.response?.status, e.message);
  setFieldReports([]); 
}
        }

      } catch (err) {
        setError("Failed to load well details.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, isAdmin, isFieldOfficer, isLabTester, isCustomer]);

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      const response = await api.patch(`/wells/${id}/status`, { status: newStatus });
      setWell(response.data.data);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Loading well dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium">{error}</div>;
  if (!well) return <div className="p-8 text-center text-gray-500">Well not found.</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto font-sans">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate("/wells")} className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 mb-4 bg-transparent border-none cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to All Wells
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{well.name}</h1>
            {canChangeStatus ? (
              <select value={well.status} onChange={(e) => handleStatusChange(e.target.value)} className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm appearance-none cursor-pointer outline-none border ${well.status === 'Active' ? 'bg-green-100 text-green-700' : well.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                <option value="Active">ACTIVE</option>
                <option value="Maintenance">MAINTENANCE</option>
                <option value="Dry">DRY</option>
              </select>
            ) : (
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${well.status === 'Active' ? 'bg-green-100 text-green-700' : well.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{well.status.toUpperCase()}</span>
            )}
          </div>
          <p className="text-gray-500 mt-2 text-lg">{well.wellId} &bull; {well.village}</p>
        </div>
        {canEditDetails && (
          <Link to={`/wells/edit/${well._id}`} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors shadow-sm flex items-center gap-2">Edit Details</Link>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        {availableTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTabState(tab.id)} className={`py-4 px-6 md:px-8 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${currentTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>{tab.label}</button>
        ))}
      </div>

      {/* CONTENT */}
      {currentTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div><p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Well Type</p><p className="text-lg font-semibold text-gray-900">{well.type}</p></div>
              <div><p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Depth</p><p className="text-lg font-semibold text-gray-900">{well.depth}m</p></div>
              <div><p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Coordinates</p><p className="text-lg font-semibold text-gray-900">{well.location.coordinates[0].toFixed(4)}, {well.location.coordinates[1].toFixed(4)}</p></div>
              <div><p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Date Added</p><p className="text-lg font-semibold text-gray-900">{new Date(well.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 min-h-75">
            {isMapLoaded ? (
              <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={{ lat: well.location.coordinates[1], lng: well.location.coordinates[0] }}>
                <Marker position={{ lat: well.location.coordinates[1], lng: well.location.coordinates[0] }} title={well.name} />
              </GoogleMap>
            ) : <div className="p-8 text-center text-gray-400">Map Loading...</div>}
          </div>
        </div>
      )}

      {currentTab === "lab" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Lab Quality Reports</h3>
              <p className="text-xs text-gray-500">Historical chemical and microbiological test results for this well source.</p>
            </div>
            {canAddLabReport && <Link to="/water-quality" className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">+ Record Test</Link>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider bg-gray-50/30">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Analyst</th>
                  <th className="py-4 px-6">pH</th>
                  <th className="py-4 px-6">Turbidity</th>
                  <th className="py-4 px-6">Bacteria</th>
                  <th className="py-4 px-6">Temp</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {labReports.length === 0 ? <tr><td colSpan="8" className="py-8 text-center text-gray-500">No lab reports found for this well.</td></tr> :
                  labReports.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 text-sm">
                      <td className="py-4 px-6 font-medium">{new Date(r.testDate || r.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-gray-600 text-xs">{r.testerName || "N/A"}</td>
                      <td className="py-4 px-6 font-mono text-xs">{r.phLevel}</td>
                      <td className="py-4 px-6 font-mono text-xs">{r.turbidity} NTU</td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <span className={r.bacteriaCount > 0 ? "text-red-600 font-bold" : "text-gray-700"}>
                          {r.bacteriaCount} CFU
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">{r.temperature}°C</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          r.status === 'Safe'
                            ? 'bg-emerald-100 text-emerald-700'
                            : r.status === 'Warning'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 italic max-w-xs truncate" title={r.remarks || "No remarks"}>
                        {r.remarks || "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === "maintenance" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Maintenance History</h3>
            {canAddMaintenance && <Link to={`/maintenance/add/${well._id}`} className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">+ Log Maintenance</Link>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-225">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Date</th><th className="py-4 px-6 font-semibold">Issue Type</th><th className="py-4 px-6 font-semibold">Priority</th><th className="py-4 px-6 font-semibold">Status</th><th className="py-4 px-6 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {maintenanceReports.length === 0 ? <tr><td colSpan="5" className="py-8 text-center text-gray-500">No records found.</td></tr> :
                  maintenanceReports.map((job) => (
                    <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-600 font-medium">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-gray-800 font-medium">{job.issueType}</td>
                      <td className="py-4 px-6"><span className={`font-bold ${job.priority === 'High' ? 'text-red-600' : 'text-gray-600'}`}>{job.priority}</span></td>
                      <td className="py-4 px-6"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">{job.status}</span></td>
                      <td className="py-4 px-6 text-right"><Link to={`/maintenance/${job._id}`} className="text-blue-600 font-medium text-sm">View Details &rarr;</Link></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {currentTab === "field" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-900">Field Officer Reports</h3>
            {canAddFieldReport && (
              <Link to="/add-report" className="text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors">+ Add Field Report</Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-225">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Reported By</th>
                  <th className="py-4 px-6 font-semibold">Water Level</th>
                  <th className="py-4 px-6 font-semibold">Pump Status</th>
                  <th className="py-4 px-6 font-semibold">Severity</th>
                  <th className="py-4 px-6 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fieldReports.length === 0 ? (
                  <tr><td colSpan="6" className="py-8 text-center text-gray-500">No field reports found.</td></tr>
                ) : (
                  fieldReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-gray-600 font-medium">{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-gray-800">{report.reportedBy?.username || "Staff"}</td>
                      <td className="py-4 px-6 text-gray-600">{report.waterLevel}</td>
                      <td className="py-4 px-6 text-gray-600">{report.pumpStatus}</td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${report.severity === 'High' ? 'text-red-600' : 'text-blue-600'}`}>
                          {report.severity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/reports/${report._id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors">View Details &rarr;</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellDetails;