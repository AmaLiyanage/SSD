import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  ArrowLeft, Clock, AlertCircle, CheckCircle, Zap, 
  Droplet, UserCircle, MapPin, Calendar, Edit2, Edit3, ShieldCheck,
  Trash2, X, Check
} from "lucide-react";
import WeatherRiskCard from "../components/WeatherRiskCard";

const MaintenanceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status/Assignment update states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusInput, setStatusInput] = useState("");
  const [field_officers, setFieldOfficers] = useState([]);
  const [assignInput, setAssignInput] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    issueType: "",
    priority: "Medium",
    status: "Pending",
    description: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const isOfficerOrAdmin = user?.role === "admin" || user?.role === "field_officer";

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/maintenance/${id}`);
        setRequest(res.data);
        setStatusInput(res.data.status);
        setAssignInput(res.data.assignedTo?._id || "");
        setEditFormData({
          issueType: res.data.issueType || "PumpDamage",
          priority: res.data.priority || "Medium",
          status: res.data.status || "Pending",
          description: res.data.description || "",
        });
      } catch {
        setError("Failed to load maintenance request details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFieldOfficers = async () => {
      try {
        const res = await api.get("/auth?role=field_officer");
        setFieldOfficers(res.data);
      } catch (e) {
        console.error("Failed to fetch field officers.", e);
      }
    };

    fetchRequestDetails();
    if (user?.role === "admin") {
      fetchFieldOfficers();
    }
  }, [id, user]);

  const handleStatusUpdate = async () => {
    try {
      setActionError(null);
      setIsUpdatingStatus(true);
      const res = await api.patch(`/maintenance/${id}/status`, { status: statusInput });
      setRequest(res.data);
      setEditFormData(prev => ({ ...prev, status: res.data.status }));
      setActionSuccess("Status updated successfully!");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssign = async () => {
    try {
      setActionError(null);
      setIsAssigning(true);
      const res = await api.patch(`/maintenance/${id}/assign`, { assignedTo: assignInput });
      setRequest(res.data);
      setStatusInput(res.data.status);
      setActionSuccess("Request assigned successfully!");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to assign request.");
    } finally {
      setIsAssigning(false);
    }
  };

  // Full Edit
  const handleOpenEdit = () => {
    setEditError(null);
    setEditFormData({
      issueType: request.issueType || "PumpDamage",
      priority: request.priority || "Medium",
      status: request.status || "Pending",
      description: request.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingEdit(true);
      setEditError(null);

      const res = await api.put(`/maintenance/${id}`, editFormData);
      setRequest(res.data);
      setStatusInput(res.data.status);
      setIsEditModalOpen(false);
      setActionSuccess("Maintenance request updated successfully!");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setEditError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update request.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      await api.delete(`/maintenance/${id}`);
      navigate("/maintenance");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete request.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium">{error || "Request not found"}</h3>
            <p className="mt-1 text-sm text-red-600">Please check the URL or return to the list.</p>
          </div>
          <Link to="/maintenance" className="text-sm font-medium underline hover:text-red-800">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock className="w-5 h-5 text-amber-500" />;
      case "InProgress": return <Zap className="w-5 h-5 text-blue-500" />;
      case "Completed": return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/maintenance")}
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Maintenance Tasks
        </button>

        {/* Officer & Admin Quick Action Buttons */}
        {isOfficerOrAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenEdit}
              className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Edit Request
            </button>

            <button
              onClick={() => { setDeleteError(null); setIsDeleteModalOpen(true); }}
              className="inline-flex items-center px-4 py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-xs font-bold transition-all shadow-xs">
          <Check className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-xs font-bold shadow-xs">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          {actionError}
        </div>
      )}

      {!request.wellId && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center text-amber-800 text-xs">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-amber-600" />
          <div>
            <h3 className="font-bold">Unlinked Maintenance Request</h3>
            <p className="mt-0.5 text-amber-700">This request is not linked to an active well. Weather insights and location data are unavailable.</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header section */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-slate-50/50">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(request.priority)}`}>
                {request.priority} Priority
              </span>
              <span className="text-xs font-semibold text-slate-400">
                ID: {request._id.substring(request._id.length - 6).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
              {request.wellId?.name || "Unknown Well"}
              {request.issueType === 'Contamination' && <AlertCircle className="w-5 h-5 text-red-500 ml-2" />}
            </h1>
            <p className="text-slate-500 mt-1 flex items-center text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> 
              {request.wellId?.location?.coordinates 
                ? `${request.wellId.location.coordinates[1].toFixed(4)}, ${request.wellId.location.coordinates[0].toFixed(4)}` 
                : request.wellId?.village || "Location unknown"}
            </p>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center min-w-32">
            {getStatusIcon(request.status)}
            <span className="mt-1 font-bold text-xs text-slate-800">{request.status}</span>
          </div>
        </div>

        {/* Content section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Issue Description</h3>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{request.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Issue Type</div>
                <div className="font-bold text-slate-900 text-sm">{request.issueType.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-xs">
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Created At</div>
                <div className="font-bold text-slate-900 text-sm flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            {isOfficerOrAdmin && (
              <div className="mt-6">
                <WeatherRiskCard wellId={request.wellId?._id} />
              </div>
            )}
          </div>

          {/* Sidebar Info & Action Panel */}
          <div className="space-y-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <UserCircle className="w-4 h-4 mr-2" />
                People Involved
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-0.5">Requested By</div>
                  <div className="font-bold text-slate-900 text-sm">{request.requestedBy?.username || "Unknown"}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">{request.requestedBy?.role?.replace('_', ' ') || "Customer"}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-0.5">Assigned Officer</div>
                  <div className="font-bold text-slate-900 text-sm flex items-center">
                    {request.assignedTo ? (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-1 text-blue-500" />
                        {request.assignedTo.username}
                      </>
                    ) : (
                      <span className="text-slate-400 italic font-normal text-xs">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Officer / Admin Quick Management Actions */}
            {isOfficerOrAdmin && (
              <div className="bg-blue-50/70 rounded-2xl p-5 border border-blue-100 mt-6">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center mb-4">
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                  Management Actions
                </h3>

                {/* Status Update Form */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-blue-900 mb-1">Update Status</label>
                  <div className="flex gap-2">
                    <select
                      value={statusInput}
                      onChange={(e) => setStatusInput(e.target.value)}
                      className="block w-full rounded-xl border border-blue-200 text-xs font-semibold p-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={handleStatusUpdate}
                      disabled={isUpdatingStatus || statusInput === request.status}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors shrink-0"
                    >
                      {isUpdatingStatus ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Assignment Form (Admin Only) */}
                {user?.role === "admin" && (
                  <div className="pt-4 border-t border-blue-100">
                    <label className="block text-xs font-bold text-blue-900 mb-1">Assign Request</label>
                    <div className="flex gap-2">
                      <select
                        value={assignInput}
                        onChange={(e) => setAssignInput(e.target.value)}
                        className="block w-full rounded-xl border border-blue-200 text-xs font-semibold p-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="" disabled>Select officer</option>
                        {field_officers.length > 0 ? (
                          field_officers.map(officer => (
                            <option key={officer._id} value={officer._id}>{officer.username}</option>
                          ))
                        ) : (
                          <option disabled>No officers found</option>
                        )}
                      </select>
                      <button
                        onClick={handleAssign}
                        disabled={isAssigning || !assignInput || assignInput === request.assignedTo?._id}
                        className="px-4 py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl disabled:opacity-50 transition-colors shrink-0"
                      >
                        {isAssigning ? '...' : 'Assign'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Request Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Maintenance Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Well: {request.wellId?.name || "Well"}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Type</label>
                  <select
                    value={editFormData.issueType}
                    onChange={(e) => setEditFormData({ ...editFormData, issueType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PumpDamage">Pump Damage</option>
                    <option value="Contamination">Contamination</option>
                    <option value="DryWell">Dry Well</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  required
                  minLength={10}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Delete Maintenance Request?</h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this maintenance task for{" "}
              <strong className="text-slate-800">{request.wellId?.name || "this well"}</strong>?
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                {deleteError}
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDetails;
