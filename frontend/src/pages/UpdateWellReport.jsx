import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateWellReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    waterLevel: "",
    pumpStatus: "",
    severity: "",
    description: "",
  });
  const [comments, setComments] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Custom UI States
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, type: "" });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const token = localStorage.getItem("token");

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ ...notification, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch initial data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { waterLevel, pumpStatus, severity, description, photos, comments } = res.data;
        setFormData({ waterLevel, pumpStatus, severity, description });
        setComments(comments || []);
        if (photos?.length > 0) setPreview(photos[0]);
        setLoading(false);
      } catch (err) {
        setNotification({ show: true, message: "Failed to load report data", type: "error" });
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, token]);

  const showStatus = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  // --- CONSOLIDATED DELETE LOGIC (REPORT & COMMENTS) ---
  const handleConfirmAction = async () => {
    try {
      if (confirmModal.type === "comment") {
        await axios.delete(`http://localhost:5000/api/reports/${id}/comments/${confirmModal.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(comments.filter((c) => c._id !== confirmModal.id));
        showStatus("Comment removed permanently");
      } 
      else if (confirmModal.type === "report") {
        await axios.delete(`http://localhost:5000/api/reports/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showStatus("Report deleted successfully!");
        setTimeout(() => navigate("/reports"), 1500);
      }
      setConfirmModal({ show: false, id: null, type: "" });
    } catch (err) {
      showStatus(`Error deleting ${confirmModal.type}`, "error");
    }
  };

  // --- COMMENT ACTIONS ---
  const handleUpdateComment = async (commentId) => {
    if (editCommentText.trim().length < 3) {
      showStatus("Comment must be at least 3 characters", "error");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/reports/${id}/comments/${commentId}`,
        { message: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c._id === commentId ? { ...c, message: editCommentText } : c));
      setEditingCommentId(null);
      showStatus("Comment updated successfully!");
    } catch (err) {
      showStatus("Failed to update comment", "error");
    }
  };

  // --- SUBMIT REPORT UPDATE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    setUpdating(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (photo) data.append("photo", photo);

    try {
      await axios.put(`http://localhost:5000/api/reports/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      showStatus("Report updated successfully!");
      setTimeout(() => navigate(`/reports/${id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || "Update failed.");
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Loading Record Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 relative">
      
      {/* 1. TOAST NOTIFICATION */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 transition-all animate-bounce border-l-4 ${
          notification.type === "error" ? "bg-white border-red-500 text-red-600" : "bg-white border-emerald-500 text-emerald-600"
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${notification.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
            {notification.type === "error" ? "!" : "✓"}
          </div>
          <span className="font-black uppercase text-[10px] tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* 2. REUSABLE DELETE MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6 border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-800 uppercase italic">Confirm Action</h3>
              <p className="text-slate-500 text-xs font-medium">Are you sure you want to delete this {confirmModal.type}? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({show:false, id:null, type:""})} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleConfirmAction} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Main Update Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight leading-none">Update Report</h1>
              <p className="text-slate-400 text-[10px] mt-2 font-mono tracking-widest uppercase italic font-bold">Record ID: {id.slice(-8).toUpperCase()}</p>
            </div>
            {/* DELETE REPORT BUTTON */}
            <button 
              type="button" 
              onClick={() => setConfirmModal({ show: true, id: id, type: "report" })}
              className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-sm"
              title="Delete Entire Report"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-500/20 text-red-600 rounded-xl text-xs font-black flex items-center gap-3 animate-shake">
                <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center not-italic text-[10px]">!</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-700 font-bold">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Water Level</label>
                <select name="waterLevel" value={formData.waterLevel} onChange={(e) => setFormData({...formData, waterLevel: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pump Status</label>
                <select name="pumpStatus" value={formData.pumpStatus} onChange={(e) => setFormData({...formData, pumpStatus: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Working">Working</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Missing">Missing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Severity</label>
                <select name="severity" value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Field Observations</label>
                <span className={`text-[10px] font-black ${formData.description.length < 10 ? 'text-red-400' : 'text-emerald-500'}`}>
                  {formData.description.length}/10 Minimum
                </span>
              </div>
              <textarea 
                name="description" 
                rows="4" 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Detailed field report (10+ characters)..."
                className={`w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 outline-none text-slate-700 font-medium transition-all ${
                  formData.description.length < 10 ? 'border-red-200 focus:ring-red-50' : 'border-slate-200 focus:ring-blue-500'
                }`} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update Photo</label>
              <div className="flex items-center gap-6 p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:border-blue-400 transition-all cursor-pointer">
                {preview && <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-white shadow-lg" />}
                <input type="file" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setPhoto(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }} className="text-[10px] text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => navigate(-1)} className="flex-1 px-6 py-4 border border-slate-200 text-slate-400 text-[10px] uppercase tracking-widest font-black rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
              
              <button 
                type="submit" 
                disabled={updating || formData.description.length < 10} 
                className={`flex-[2] px-6 py-4 text-white text-[10px] uppercase tracking-widest font-black rounded-xl shadow-lg transition-all ${
                  updating || formData.description.length < 10 ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-100"
                }`}
              >
                {updating ? "UPDATING..." : "SAVE CHANGES"}
              </button>
            </div>
          </form>
        </div>

        {/* Manage Comments Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-100 px-8 py-4 border-b border-slate-200">
            <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Manage Comments ({comments.length})</h2>
          </div>
          <div className="p-6 space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                  {editingCommentId === comment._id ? (
                    <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                      <textarea 
                        value={editCommentText} 
                        onChange={(e) => setEditCommentText(e.target.value)} 
                        className="w-full p-4 bg-white border-2 border-blue-500 rounded-xl text-sm outline-none text-slate-700" 
                        rows="2" 
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateComment(comment._id)} className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg shadow-md hover:bg-blue-700">Save</button>
                        <button onClick={() => setEditingCommentId(null)} className="px-5 py-2 bg-slate-200 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-300">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="space-y-1 pr-4">
                        <p className="text-sm text-slate-700 font-bold leading-tight">{comment.message}</p>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">BY {comment.commentedBy?.username || 'Staff'} • {new Date(comment.commentedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => { setEditingCommentId(comment._id); setEditCommentText(comment.message); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={() => setConfirmModal({ show: true, id: comment._id, type: "comment" })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-6 text-slate-400 text-xs italic font-medium uppercase tracking-widest">No comments logged for this record.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateWellReport;