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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Prospects Ingestion</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage prospects and trigger Firecrawl scraping + LangGraph 2-Pass AI Agent
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium border border-gray-700/60 transition">
            <Upload className="w-4 h-4 text-cyan-400" />
            {uploading ? 'Uploading...' : 'Import CSV'}
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient hover:opacity-90 text-white text-sm font-semibold shadow-glow transition"
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by email, name, or company..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm w-full"
        />
      </div>

      {/* Prospects Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-800/80 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="py-3.5 px-6">Prospect</th>
              <th className="py-3.5 px-6">Company & Title</th>
              <th className="py-3.5 px-6">Website</th>
              <th className="py-3.5 px-6">Pipeline Status</th>
              <th className="py-3.5 px-6 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">Loading prospects...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  No prospects found. Add a prospect or import CSV to start.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800/30 transition">
                  <td className="py-4 px-6 font-medium text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                        {p.first_name?.[0] || p.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div>{p.first_name ? `${p.first_name} ${p.last_name || ''}` : 'Lead'}</div>
                        <div className="text-xs text-gray-400 font-mono">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-200">{p.company || '—'}</div>
                    <div className="text-xs text-gray-400">{p.title || '—'}</div>
                  </td>
                  <td className="py-4 px-6">
                    {p.website ? (
                      <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1 text-xs">
                        <Globe className="w-3 h-3" />
                        {p.website.replace('https://', '').replace('http://', '')}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-4 px-6 text-right text-xs text-gray-500 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl space-y-5 border border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white">Add New Lead</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  placeholder="alex@targetcompany.com" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:border-brand-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">First Name</label>
                  <input 
                    type="text" 
                    placeholder="Alex" 
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="VP of Growth" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Company Name</label>
                  <input 
                    type="text" 
                    placeholder="Acme Corp" 
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Website URL</label>
                  <input 
                    type="text" 
                    placeholder="acme.com" 
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-100 text-sm focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-glow hover:opacity-90"
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
