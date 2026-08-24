import React, { useState } from 'react';
import { Save, RotateCcw, Plus, Trash2, Edit2 } from 'lucide-react';

export default function DreamTeamAdmin() {
  const [agents, setAgents] = useState([
    {
      id: 'routing-robbie',
      name: 'Routing Robbie',
      emoji: '🗺️',
      role: 'Routing & Navigation AI',
      tagline: 'Truck-legal routing, low bridges, weigh stations',
      accent: '#38BDF8',
    },
    {
      id: 'compliant-kathy',
      name: 'Compliant Kathy',
      emoji: '📋',
      role: 'Compliance AI',
      tagline: 'HOS clock, DVIR, inspections, expiring docs',
      accent: '#FB923C',
    },
    {
      id: 'dispatch-darryl',
      name: 'Dispatch Darryl',
      emoji: '📡',
      role: 'Dispatch AI',
      tagline: 'Load board, best-paying loads, cost-per-mile',
      accent: '#34D399',
    },
    {
      id: 'money-marisol',
      name: 'Money Marisol',
      emoji: '💎',
      role: 'Revenue & Tax AI',
      tagline: 'Settlements, per diem, deductions, taxes',
      accent: '#A3E635',
    },
    {
      id: 'safety-sarge',
      name: 'Safety Sarge',
      emoji: '🪖',
      role: 'Safety & Health Coach',
      tagline: 'Safety score, driving behavior, DOT physical',
      accent: '#F87171',
    },
    {
      id: 'weather-wanda',
      name: 'Weather Wanda',
      emoji: '🌧️',
      role: 'Weather & Hazard AI',
      tagline: 'Road conditions, weather alerts, hazmat routing',
      accent: '#EC4899',
    },
    {
      id: 'maintenance-marco',
      name: 'Maintenance Marco',
      emoji: '🔧',
      role: 'Maintenance & Uptime AI',
      tagline: 'Vehicle health, predictive maintenance, repairs',
      accent: '#8B5CF6',
    },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savedMessage, setSavedMessage] = useState('');

  const handleEdit = (agent) => {
    setEditingId(agent.id);
    setEditForm({ ...agent });
  };

  const handleSave = () => {
    setAgents(agents.map(a => a.id === editingId ? editForm : a));
    setEditingId(null);
    setSavedMessage('Dream Team member updated!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleReset = (agent) => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (id) => {
    setAgents(agents.filter(a => a.id !== id));
  };

  const handleAddNew = () => {
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: 'New Agent',
      emoji: '🤖',
      role: 'New Role',
      tagline: 'Agent tagline',
      accent: '#6366F1',
    };
    setAgents([...agents, newAgent]);
    setEditingId(newAgent.id);
    setEditForm(newAgent);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 The Dream Team Admin</h1>
          <p className="text-gray-400">Edit agent names, roles, emojis, and settings</p>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded mb-6 font-semibold">
            ✓ {savedMessage}
          </div>
        )}

        {/* Add New Agent Button */}
        <div className="mb-6">
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-3 rounded transition"
          >
            <Plus size={20} />
            Add New Agent
          </button>
        </div>

        {/* Agents Grid */}
        <div className="space-y-4">
          {agents.map(agent => (
            <div
              key={agent.id}
              className="bg-gray-900 border border-amber-500/30 rounded-lg p-6"
            >
              {editingId === agent.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-amber-400">Editing Agent</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Emoji</label>
                      <input
                        type="text"
                        value={editForm.emoji || ''}
                        onChange={(e) => setEditForm({ ...editForm, emoji: e.target.value })}
                        maxLength="2"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition text-center text-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Agent Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Role</label>
                      <input
                        type="text"
                        value={editForm.role || ''}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={editForm.accent || '#6366F1'}
                          onChange={(e) => setEditForm({ ...editForm, accent: e.target.value })}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editForm.accent || '#6366F1'}
                          onChange={(e) => setEditForm({ ...editForm, accent: e.target.value })}
                          className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition text-sm"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Tagline</label>
                      <input
                        type="text"
                        value={editForm.tagline || ''}
                        onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition"
                    >
                      <Save size={18} />
                      Save Changes
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                    >
                      <RotateCcw size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{agent.emoji}</div>
                    <div>
                      <h3 className="text-xl font-bold">{agent.name}</h3>
                      <p className="text-amber-400 font-semibold text-sm">{agent.role}</p>
                      <p className="text-gray-400 text-sm mt-1">{agent.tagline}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-6 h-6 rounded border-2"
                          style={{ backgroundColor: agent.accent, borderColor: agent.accent }}
                        />
                        <span className="text-xs text-gray-500">{agent.accent}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(agent)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-amber-400 rounded transition"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="p-2 bg-gray-800 hover:bg-red-900 text-red-400 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 p-6 bg-gray-900 border border-amber-500/30 rounded-lg">
          <h3 className="font-bold text-amber-400 mb-3">The Dream Team Summary</h3>
          <p className="text-gray-300 text-sm">
            You have <strong>{agents.length} agents</strong> on The Dream Team, each with unique expertise.
            Edit their names, roles, and colors here — changes update across the platform instantly.
          </p>
        </div>
      </div>
    </div>
  );
}
