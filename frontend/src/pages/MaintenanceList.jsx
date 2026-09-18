import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, AlertCircle, Clock, CheckCircle, Droplet, Zap, Search, 
  Trash2, Edit3, X, Filter, UserCheck, ShieldAlert, Check
} from "lucide-react";

const MaintenanceList = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Edit Modal State
  const [editingRequest, setEditingRequest] = useState(null);
  const [editFormData, setEditFormData] = useState({
    issueType: "",
    priority: "Medium",
    status: "Pending",
    description: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete Modal State
  const [deletingRequest, setDeletingRequest] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const currentUserId = user?._id || user?.id;
  const isOfficerOrAdmin = user?.role === "field_officer" || user?.role === "admin";

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/maintenance");
      
      const rawData = Array.isArray(response.data) ? response.data : [];

      // If user is customer/communityUser, show only their own requests
      const data = (user?.role === "customer" || user?.role === "communityUser") 
        ? rawData.filter(req => {
            const creatorId = req.requestedBy?._id || req.requestedBy;
            return creatorId === currentUserId;
          })
        : rawData;
        
      // Deduplicate by _id to prevent duplicate display
      const uniqueMap = new Map();
      data.forEach(item => {
        if (item && item._id && !uniqueMap.has(item._id)) {
          uniqueMap.set(item._id, item);
        }
      });

      setRequests(Array.from(uniqueMap.values()));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch maintenance requests.");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (e, req) => {
    e.preventDefault();
    e.stopPropagation();
    setEditError(null);
    setEditingRequest(req);
    setEditFormData({
      issueType: req.issueType || "PumpDamage",
      priority: req.priority || "Medium",
      status: req.status || "Pending",
      description: req.description || "",
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRequest) return;

    try {
      setIsSubmittingEdit(true);
      setEditError(null);

      const res = await api.put(`/maintenance/${editingRequest._id}`, editFormData);
      
      // Update local state with updated request
      setRequests(prev => prev.map(item => item._id === editingRequest._id ? res.data : item));
      setSuccessMsg("Maintenance request updated successfully!");
      setEditingRequest(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Failed to update request.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (e, req) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError(null);
    setDeletingRequest(req);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRequest) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      await api.delete(`/maintenance/${deletingRequest._id}`);
      
      // Remove from local state
      setRequests(prev => prev.filter(item => item._id !== deletingRequest._id));
      setSuccessMsg("Maintenance request deleted successfully!");
      setDeletingRequest(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete request.");
    } finally {
      setIsDeleting(false);
    }
  };

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
      case "Pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "InProgress": return <Zap className="w-4 h-4 text-blue-500" />;
      case "Completed": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getIssueTypeIcon = (type) => {
    switch (type) {
      case "PumpDamage": return <Zap className="w-4 h-4 text-amber-600" />;
      case "Contamination": return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "DryWell": return <Droplet className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter requests based on tab and search
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      (req.wellId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.issueType || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "pending_customer") {
      // Customer/new submissions: Pending status or unassigned
      return req.status === "Pending";
    }
    if (activeTab === "my_tasks") {
      const assignedId = req.assignedTo?._id || req.assignedTo;
      return assignedId === currentUserId;
    }
    if (activeTab === "in_progress") {
      return req.status === "InProgress";
    }
    if (activeTab === "completed") {
      return req.status === "Completed";
    }
    return true;
  });

  // Tab counts
  const pendingCount = requests.filter(r => r.status === "Pending").length;
  const myTasksCount = requests.filter(r => (r.assignedTo?._id || r.assignedTo) === currentUserId).length;
  const inProgressCount = requests.filter(r => r.status === "InProgress").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Maintenance <span className="text-blue-600">Tasks</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            {isOfficerOrAdmin 
              ? "Monitor customer submissions, manage repairs, and track task resolutions." 
              : "Track and report well maintenance requests."}
          </p>
        </div>

        {["customer", "communityUser", "admin", "field_officer"].includes(user?.role) && (
          <Link
            to="/maintenance/new"
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Link>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center text-emerald-800 text-sm font-medium shadow-sm animate-fade-in">
          <Check className="w-5 h-5 mr-3 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700 text-sm shadow-sm">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          {error}
        </div>
      )}

      {/* Officer & Admin Tabs and Search */}
      {isOfficerOrAdmin && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Tasks ({requests.length})
              </button>

              <button
                onClick={() => setActiveTab("pending_customer")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "pending_customer"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Customer / New Requests ({pendingCount})
              </button>

              <button
                onClick={() => setActiveTab("my_tasks")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === "my_tasks"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Assigned to Me ({myTasksCount})
              </button>

              <button
                onClick={() => setActiveTab("in_progress")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "in_progress"
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                In Progress ({inProgressCount})
              </button>

              <button
                onClick={() => setActiveTab("completed")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "completed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Completed
              </button>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search well or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No maintenance requests found</h3>
          <p className="text-slate-500 text-sm mb-6">
            {activeTab === "pending_customer"
              ? "No pending customer requests at the moment."
              : "There are currently no maintenance tasks matching your criteria."}
          </p>
          {["customer", "communityUser"].includes(user?.role) && (
            <Link
              to="/maintenance/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Report an Issue
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group"
            >
              <div className="p-5 grow">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold border ${getPriorityColor(request.priority)}`}>
                    {request.priority} Priority
                  </span>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                    {getStatusIcon(request.status)}
                    <span className="font-bold text-slate-700">{request.status}</span>
                  </div>
                </div>

                <Link to={`/maintenance/${request._id}`} className="block">
                  <h3 className="text-lg font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {request.wellId?.name || "Unknown Well"}
                  </h3>
                </Link>
                
                <div className="flex items-center text-slate-500 mb-3 text-xs font-semibold">
                  {getIssueTypeIcon(request.issueType)}
                  <span className="ml-1.5">{request.issueType.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>From: <strong className="text-slate-700">{request.requestedBy?.username || "Customer"}</strong></span>
                </div>

                <p className="text-slate-600 text-xs line-clamp-3 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  {request.description}
                </p>
              </div>

              {/* Card Footer & Officer Actions */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-xs flex justify-between items-center">
                <span className="text-slate-400 font-medium">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/maintenance/${request._id}`}
                    className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                  >
                    View
                  </Link>

                  {/* Edit and Delete buttons for field officer and admin */}
                  {isOfficerOrAdmin && (
                    <>
                      <button
                        onClick={(e) => handleOpenEdit(e, request)}
                        title="Edit Maintenance Task"
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleOpenDelete(e, request)}
                        title="Delete Maintenance Task"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Maintenance Request</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Well: {editingRequest.wellId?.name || "Well"}
                </p>
              </div>
              <button
                onClick={() => setEditingRequest(null)}
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
                  onClick={() => setEditingRequest(null)}
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
      {deletingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Delete Maintenance Request?</h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              Are you sure you want to delete this maintenance task for{" "}
              <strong className="text-slate-800">{deletingRequest.wellId?.name || "this well"}</strong>?
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
                onClick={() => setDeletingRequest(null)}
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

export default MaintenanceList;
