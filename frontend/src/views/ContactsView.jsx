import React, { useState } from 'react';
import { Users, UserPlus, Phone, Trash2, Edit3, CheckCircle2, Send, Lock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function ContactsView() {
  const { contacts, setContacts, user, setUser, addNotification } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relation: 'Sister',
    is_primary: false,
  });

  const [loading, setLoading] = useState(false);
  const [testingDispatch, setTestingDispatch] = useState(false);

  const badgeColors = [
    "bg-[#E0F2FE] text-[#0284C7]", // Light blue
    "bg-[#FFE9D6] text-[#EA580C]", // Peach
    "bg-[#FCE7F3] text-[#DB2777]", // Pink
    "bg-[#FFE4E6] text-[#E11D48]", // Salmon
    "bg-[#E2E8F0] text-[#475569]", // Slate
  ];

  // Toggle location consent
  const toggleConsent = async () => {
    try {
      const nextVal = !user?.consent_location;
      await api.auth.setConsent(nextVal);
      setUser((prev) => ({ ...prev, consent_location: nextVal }));
      addNotification(
        nextVal ? 'Consent granted' : 'Consent suspended',
        nextVal ? 'Location will be shared with trusted contacts during active commutes.' : 'Location sharing paused.',
        nextVal ? 'success' : 'warning'
      );
    } catch (e) {
      console.error(e);
    }
  };

  const openAdd = () => {
    setEditingContact(null);
    setFormData({ name: '', phone: '', relation: 'Sister', is_primary: false });
    setShowAddModal(true);
  };

  const openEdit = (c) => {
    setEditingContact(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      relation: c.relation,
      is_primary: !!c.is_primary,
    });
    setShowAddModal(true);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setLoading(true);
    try {
      if (editingContact) {
        await api.contacts.edit(editingContact.id, formData);
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? { ...c, ...formData } : c))
        );
        addNotification('Contact updated', `${formData.name} updated successfully.`, 'success');
      } else {
        const res = await api.contacts.add(formData);
        setContacts((prev) => [...prev, res]);
        addNotification('Contact added', `${formData.name} added to trusted guardians.`, 'success');
      }
      setShowAddModal(false);
    } catch (err) {
      addNotification('Error', 'Could not save contact', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name} from your trusted contacts?`)) return;
    try {
      await api.contacts.delete(id);
      setContacts((prev) => prev.filter((c) => c.id !== id));
      addNotification('Contact removed', `${name} removed from your safety circle.`, 'info');
    } catch (e) {
      addNotification('Error', 'Could not delete contact', 'error');
    }
  };

  const handleTestDispatch = () => {
    setTestingDispatch(true);
    setTimeout(() => {
      setTestingDispatch(false);
      addNotification(
        'Guardian test alert sent',
        `Simulated test ping delivered to ${contacts.length} contacts.`,
        'success'
      );
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#F1F0FA] overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold">
            <Users className="w-4 h-4" />
            <span>Trusted safety circle</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1B1B3A] mt-1 tracking-tight">
            Guardians & trusted contacts
          </h2>
          <p className="text-xs text-[#8A8AA8]">
            Designated contacts automatically alerted during missed arrivals and emergency triggers.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleTestDispatch}
            disabled={testingDispatch || contacts.length === 0}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-[#1B1B3A] flex items-center gap-2 transition shadow-sm"
          >
            <Send className={`w-3.5 h-3.5 text-[#8B5CF6] ${testingDispatch ? 'animate-bounce' : ''}`} />
            <span>{testingDispatch ? 'Sending...' : 'Test alert ping'}</span>
          </button>

          <button
            onClick={openAdd}
            className="px-5 py-2 rounded-full gradient-violet-blue text-white text-xs font-bold flex items-center gap-2 shadow-btn hover:brightness-110 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add guardian</span>
          </button>
        </div>
      </div>

      {/* Consent & Profile Card */}
      <div className="saas-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl gradient-pink-violet p-0.5 shadow-md shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-bold text-[#8B5CF6] text-sm">
              {user?.full_name?.slice(0, 2).toUpperCase() || 'ER'}
            </div>
          </div>
          <div>
            <div className="font-bold text-[#1B1B3A] text-sm">{user?.full_name}</div>
            <div className="text-xs text-[#8A8AA8]">{user?.email} &bull; End-to-end consent encryption</div>
          </div>
        </div>

        {/* Location Consent Switch */}
        <div className="flex items-center gap-3 bg-[#F8F7FD] p-3 rounded-2xl border border-slate-100">
          <div className="text-right">
            <div className="text-xs font-bold text-[#1B1B3A]">Location sharing consent</div>
            <div className="text-[10px] text-[#8A8AA8]">Shared solely during active commutes</div>
          </div>

          <div
            onClick={toggleConsent}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              user?.consent_location ? 'bg-[#16A34A] justify-end' : 'bg-slate-300 justify-start'
            }`}
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((c, idx) => (
          <div
            key={c.id}
            className={`saas-card p-5 flex flex-col justify-between space-y-4 ${
              c.is_primary ? 'ring-2 ring-[#8B5CF6]' : ''
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {/* Tinted Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${badgeColors[idx % badgeColors.length]}`}>
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1B1B3A]">{c.name}</h3>
                      {c.is_primary ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[9px] font-bold">
                          Primary
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-[#8A8AA8] mt-0.5">{c.relation}</div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-1.5 text-slate-400 hover:text-[#8B5CF6] hover:bg-slate-50 rounded-full transition"
                    title="Edit contact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-1.5 text-slate-400 hover:text-[#FF4D4F] hover:bg-slate-50 rounded-full transition"
                    title="Delete contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#8A8AA8] font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>{c.phone}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold">
                  Ready
                </span>
              </div>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="col-span-full saas-card p-8 text-center text-xs text-[#8A8AA8]">
            No trusted contacts added yet. Click "Add guardian" above.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9995] flex items-center justify-center bg-[#1B1B3A]/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-card-lg p-6 md:p-8 shadow-2xl text-[#1B1B3A] space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1B1B3A]">
                {editingContact ? 'Edit trusted guardian' : 'Add new trusted guardian'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">Full name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F7FD] rounded-full text-xs font-semibold text-[#1B1B3A] border border-slate-200 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">Phone number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F7FD] rounded-full text-xs font-semibold text-[#1B1B3A] border border-slate-200 focus:outline-none focus:border-[#8B5CF6]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">Relationship</label>
                <select
                  value={formData.relation}
                  onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#F8F7FD] rounded-full text-xs font-semibold text-[#1B1B3A] border border-slate-200 focus:outline-none focus:border-[#8B5CF6]"
                >
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Partner">Partner</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Friend">Friend</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-0"
                />
                <label htmlFor="is_primary" className="text-xs text-[#1B1B3A] cursor-pointer">
                  Set as primary emergency contact
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#8A8AA8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-full gradient-violet-blue text-white text-xs font-bold hover:brightness-110 shadow-btn transition"
                >
                  {loading ? 'Saving...' : 'Save contact'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
