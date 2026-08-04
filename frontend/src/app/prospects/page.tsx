'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Upload, Search, Globe, Mail, Building, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Prospect } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newFirstName, setNewFirstName] = useState<string>('');
  const [newCompany, setNewCompany] = useState<string>('');
  const [newWebsite, setNewWebsite] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // CSV upload
  const [uploading, setUploading] = useState<boolean>(false);

  const fetchProspects = async () => {
    setLoading(true);
    try {
      const data = await api.getProspects();
      setProspects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setSubmitting(true);
    try {
      await api.createProspect({
        email: newEmail,
        first_name: newFirstName,
        company: newCompany,
        website: newWebsite,
        title: newTitle
      });
      setShowAddModal(false);
      setNewEmail('');
      setNewFirstName('');
      setNewCompany('');
      setNewWebsite('');
      setNewTitle('');
      fetchProspects();
    } catch (err) {
      alert("Failed to create prospect. Check if email already exists.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadCsv(file);
      alert(res.message);
      fetchProspects();
    } catch (err) {
      alert("Failed to upload CSV.");
    } finally {
      setUploading(false);
    }
  };

  const filtered = prospects.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.company && p.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.first_name && p.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-full w-full px-2 lg:px-4">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black">Prospects Ingestion</h1>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-black text-sm font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition">
            <Upload className="w-4 h-4 text-violet-600" />
            {uploading ? 'Uploading...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button 
            onClick={() => setShowAddModal(true)}
            className="clean-btn flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="clean-card p-3 flex items-center gap-3">
        <Search className="w-5 h-5 text-black ml-2" />
        <input 
          type="text" 
          placeholder="Search by email, name, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent !border-none !shadow-none focus:!shadow-none focus:!transform-none focus:!border-none !outline-none text-black placeholder-gray-500 text-sm w-full font-bold"
        />
      </div>

      {/* Prospects Table */}
      <div className="clean-card overflow-hidden !p-0">
        <table className="w-full text-left text-sm text-black">
          <thead className="bg-violet-100 text-black text-xs uppercase tracking-wider border-b-2 border-black font-black">
            <tr>
              <th className="py-4 px-6 border-r-2 border-black">Prospect</th>
              <th className="py-4 px-6 border-r-2 border-black">Company & Title</th>
              <th className="py-4 px-6 border-r-2 border-black">Website</th>
              <th className="py-4 px-6 border-r-2 border-black">Pipeline Status</th>
              <th className="py-4 px-6 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-black font-bold">Loading prospects...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-black font-bold">
                  No prospects found. Add a prospect or import CSV to start.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-bold text-black border-r-2 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-200 text-violet-800 flex items-center justify-center font-black text-xs border-2 border-black">
                        {p.first_name?.[0] || p.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black">{p.first_name ? `${p.first_name} ${p.last_name || ''}` : 'Lead'}</div>
                        <div className="text-xs text-black font-mono font-bold mt-0.5">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 border-r-2 border-black">
                    <div className="text-black font-black">{p.company || '—'}</div>
                    <div className="text-xs text-black font-bold mt-0.5">{p.title || '—'}</div>
                  </td>
                  <td className="py-4 px-6 border-r-2 border-black">
                    {p.website ? (
                      <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="text-violet-700 hover:underline flex items-center gap-1 text-xs font-black">
                        <Globe className="w-3 h-3" />
                        {p.website.replace('https://', '').replace('http://', '')}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="py-4 px-6 border-r-2 border-black">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-black font-mono font-bold">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Prospect Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="clean-card w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <h3 className="text-xl font-black text-black">Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-black font-black hover:scale-110 transition">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="alex@targetcompany.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Alex" 
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="VP of Growth" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Acme Corp" 
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wider">Website URL</label>
                  <input 
                    type="text" 
                    placeholder="acme.com" 
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="w-full px-3 py-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="clean-btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="clean-btn px-4 py-2 text-sm"
                >
                  {submitting ? 'Ingesting...' : 'Ingest & Trigger AI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
