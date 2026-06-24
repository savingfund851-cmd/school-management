"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, Trash2, Pencil, X, CheckCircle } from "lucide-react";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_students", label: "Students Management" },
  { id: "manage_teachers", label: "Teachers Management" },
  { id: "manage_admissions", label: "Admissions" },
  { id: "manage_fees", label: "Fee Status" },
  { id: "manage_notices", label: "Notice Board" },
  { id: "manage_results", label: "Results Management" },
];

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admins");
      if (res.ok) setAdmins(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleTogglePerm = (id: string, perms: string[], setPerms: (p: string[]) => void) => {
    setPerms(perms.includes(id) ? perms.filter(p => p !== id) : [...perms, id]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, permissions: selectedPerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create admin");
      setAdmins(prev => [...prev, data]);
      setIsCreating(false);
      setEmail(""); setPassword(""); setSelectedPerms([]);
      showMessage("Admin account created successfully!", "success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (admin: any) => {
    setEditingId(admin.id);
    try {
      setEditPerms(admin.permissions ? JSON.parse(admin.permissions) : []);
    } catch {
      setEditPerms([]);
    }
  };

  const handleEditSave = async (id: string) => {
    setEditSubmitting(true);
    try {
      const res = await fetch("/api/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, permissions: editPerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setAdmins(prev => prev.map(a => a.id === id ? data : a));
      setEditingId(null);
      showMessage("Permissions updated successfully!", "success");
    } catch (err: any) {
      showMessage(err.message, "error");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete admin "${email}"? This cannot be undone.`)) return;
    try {
      const res = await fetch("/api/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setAdmins(prev => prev.filter(a => a.id !== id));
        showMessage("Admin deleted.", "success");
      }
    } catch (err) {
      showMessage("Delete failed.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const PermCheckboxes = ({ perms, setPerms }: { perms: string[]; setPerms: (p: string[]) => void }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {AVAILABLE_PERMISSIONS.map(perm => (
        <label key={perm.id} className="flex items-center gap-3 bg-navy-light/30 border border-gold/10 p-3 rounded-md cursor-pointer hover:border-gold/30 transition-colors">
          <input
            type="checkbox"
            checked={perms.includes(perm.id)}
            onChange={() => handleTogglePerm(perm.id, perms, setPerms)}
            className="accent-gold w-4 h-4"
          />
          <span className="text-sm text-cream/90">{perm.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gold-light mb-1">Admin Management</h1>
          <p className="text-sm text-cream/60">Create, manage, and control admin permissions.</p>
        </div>
        <button
          onClick={() => { setIsCreating(!isCreating); setError(""); }}
          className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          {isCreating ? <X size={18} /> : <Plus size={18} />}
          {isCreating ? "Cancel" : "New Admin"}
        </button>
      </div>

      {/* Global message */}
      {message.text && (
        <div className={`p-4 rounded-sm flex items-center gap-3 text-sm ${message.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
          <CheckCircle size={18} /> {message.text}
        </div>
      )}

      {/* Create form */}
      {isCreating && (
        <div className="bg-navy border border-gold/20 rounded-xl p-6 shadow-xl animate-fade-up">
          <h2 className="text-lg font-serif font-semibold text-cream mb-4">Create New Admin</h2>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded">{error}</p>}
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block mb-2">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold outline-none rounded-sm px-4 py-3 text-cream text-sm transition-all"
                  placeholder="admin@school.com" />
              </div>
              <div>
                <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block mb-2">Password</label>
                <input type="text" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full bg-navy-light/50 border border-gold/20 focus:border-gold outline-none rounded-sm px-4 py-3 text-cream text-sm transition-all"
                  placeholder="Secure password" />
              </div>
            </div>
            <div>
              <label className="text-xs font-display font-semibold uppercase tracking-widest text-gold block mb-3">Permissions</label>
              <PermCheckboxes perms={selectedPerms} setPerms={setSelectedPerms} />
            </div>
            <div className="flex justify-end pt-2 border-t border-gold/10">
              <button type="submit" disabled={submitting}
                className="bg-gold hover:bg-gold-light text-navy-deep font-display font-bold px-6 py-2 rounded-sm transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admins table */}
      <div className="bg-navy border border-gold/20 rounded-xl shadow-xl overflow-hidden">
        {admins.length === 0 ? (
          <p className="text-cream/50 text-sm text-center py-8 italic">No admin accounts found. Create one to grant access.</p>
        ) : (
          <div className="divide-y divide-gold/5">
            {admins.map(admin => {
              const perms: string[] = (() => {
                try { return admin.permissions ? JSON.parse(admin.permissions) : []; } catch { return []; }
              })();
              const isEditing = editingId === admin.id;

              return (
                <div key={admin.id} className={`p-6 transition-colors ${isEditing ? "bg-navy-light/20" : "hover:bg-navy-light/10"}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-cream">{admin.email}</p>
                      <p className="text-xs text-cream/40 mt-0.5">Created {new Date(admin.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isEditing ? (
                        <>
                          <button onClick={() => startEdit(admin)}
                            className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-gold hover:bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-sm transition-colors">
                            <Pencil size={13} /> Edit Permissions
                          </button>
                          <button onClick={() => handleDelete(admin.id, admin.email)}
                            className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-red-400 hover:bg-red-500/10 border border-red-400/20 px-3 py-1.5 rounded-sm transition-colors">
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditSave(admin.id)} disabled={editSubmitting}
                            className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-emerald-400 hover:bg-emerald-500/10 border border-emerald-400/20 px-3 py-1.5 rounded-sm transition-colors disabled:opacity-50">
                            {editSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1.5 text-xs font-display uppercase tracking-widest text-cream/50 hover:text-cream border border-cream/10 px-3 py-1.5 rounded-sm transition-colors">
                            <X size={13} /> Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <PermCheckboxes perms={editPerms} setPerms={setEditPerms} />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {perms.length > 0 ? perms.map(p => {
                        const lbl = AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label || p;
                        return (
                          <span key={p} className="bg-gold/10 text-gold-light text-xs px-2 py-1 rounded-full border border-gold/20">
                            {lbl}
                          </span>
                        );
                      }) : (
                        <span className="text-cream/40 text-xs italic">No permissions assigned</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
