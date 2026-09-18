import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CommentsPage = () => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // UI & Logic States
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [confirmModal, setConfirmModal] = useState({ show: false, commentId: null, reportId: null });
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchComments();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ ...notification, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchComments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/reports/comments/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
      setLoading(false);
    } catch (err) {
      showStatus("Failed to load comments", "error");
      setLoading(false);
    }
  };

  const showStatus = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  // --- DELETE LOGIC ---
  const handleConfirmDelete = async () => {
    const { reportId, commentId } = confirmModal;
    try {
      await axios.delete(`http://localhost:5000/api/reports/${reportId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c.commentId !== commentId));
      showStatus("Comment deleted");
      setConfirmModal({ show: false, commentId: null, reportId: null });
    } catch (err) {
      showStatus(err.response?.data?.message || "Unauthorized", "error");
      setConfirmModal({ show: false, commentId: null, reportId: null });
    }
  };

  // --- UPDATE LOGIC ---
  const handleUpdateComment = async (reportId, commentId) => {
    if (editCommentText.trim().length < 3) {
      showStatus("Too short!", "error");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5000/api/reports/${reportId}/comments/${commentId}`,
        { message: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map(c => c.commentId === commentId ? { ...c, message: editCommentText } : c));
      setEditingCommentId(null);
      showStatus("Comment updated");
    } catch (err) {
      showStatus("Failed to update", "error");
    }
  };

  const filteredComments = comments.filter((comment) =>
    comment.wellId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center font-black text-blue-600 animate-pulse uppercase tracking-tighter">Synchronizing Feed...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      
      {/* NOTIFICATION */}
      {notification.show && (
        <div className={`fixed top-20 right-5 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-l-4 ${
          notification.type === "error" ? "bg-white border-red-500 text-red-600" : "bg-white border-emerald-500 text-emerald-600"
        }`}>
          <span className="font-black uppercase text-[10px] tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase mb-2">Delete Comment?</h3>
            <p className="text-slate-500 text-xs mb-6">This action cannot be undone and will be logged.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({show:false, id:null})} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase">Cancel</button>
              <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Global Feed</h1>
            <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest italic">Live communication logs across all assets</p>
          </div>

          <div className="relative group">
            <input
              type="text"
              placeholder="Search Well ID (e.g. WELL-001)"
              className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none w-full md:w-80 font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-4 top-4.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {/* FEED GRID */}
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center border-4 border-dashed border-slate-100">
            <p className="text-slate-300 font-black uppercase tracking-[0.3em]">No communication history found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredComments.map((comment) => (
              <div 
                key={comment.commentId} 
                className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative group"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                      {comment.wellId}
                    </span>
                    <span className="text-slate-400 text-[10px] font-mono font-bold uppercase">
                      {new Date(comment.commentedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingCommentId === comment.commentId ? (
                    <div className="mb-6 space-y-3">
                      <textarea 
                        className="w-full p-4 bg-slate-50 border-2 border-blue-500 rounded-2xl text-sm font-medium focus:outline-none"
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateComment(comment.reportId, comment.commentId)} className="flex-1 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase">Save</button>
                        <button onClick={() => setEditingCommentId(null)} className="flex-1 py-2 bg-slate-200 text-slate-600 text-[10px] font-black rounded-xl uppercase">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 font-medium mb-8 text-base leading-relaxed">
                      {comment.message}
                    </p>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-sm uppercase">
                      {comment.commentedBy?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{comment.commentedBy}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Personnel</p>
                    </div>
                  </div>

                  {/* ACTIONS - Only show for comment owner or admin */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingCommentId(comment.commentId); setEditCommentText(comment.message); }}
                      className="p-2.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => setConfirmModal({ show: true, commentId: comment.commentId, reportId: comment.reportId })}
                      className="p-2.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;