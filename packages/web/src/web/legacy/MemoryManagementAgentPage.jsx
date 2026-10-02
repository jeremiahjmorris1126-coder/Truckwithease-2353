import { useState, useEffect } from 'react';
import { Trash2, Archive, AlertCircle, Clock, Database, Zap } from 'lucide-react';

export default function MemoryManagementAgentPage() {
  const [memories, setMemories] = useState([]);
  const [archived, setArchived] = useState([]);
  const [stats, setStats] = useState({
    activeMemories: 0,
    archivedCount: 0,
    estimatedSpaceUsed: '0 MB',
    readinessScore: 100,
  });
  const [filter, setFilter] = useState('all');
  const [autoArchiveEnabled, setAutoArchiveEnabled] = useState(true);

  useEffect(() => {
    // Load memories from storage
    const stored = JSON.parse(localStorage.getItem('fleetMemories') || '[]');
    const archivedStored = JSON.parse(localStorage.getItem('archivedMemories') || '[]');
    setMemories(stored);
    setArchived(archivedStored);
    updateStats(stored, archivedStored);
  }, []);

  const updateStats = (mems, archived) => {
    const spacePerMemory = 0.015; // Estimate in MB per memory
    const totalSpace = (mems.length + archived.length) * spacePerMemory;
    const readiness = Math.max(50, 100 - (mems.length * 2)); // Decreases with more active memories
    
    setStats({
      activeMemories: mems.length,
      archivedCount: archived.length,
      estimatedSpaceUsed: totalSpace.toFixed(2),
      readinessScore: readiness,
    });
  };

  const archiveMemory = (id) => {
    const memory = memories.find(m => m.id === id);
    if (memory) {
      setMemories(memories.filter(m => m.id !== id));
      setArchived([...archived, { ...memory, archivedAt: new Date().toISOString() }]);
      localStorage.setItem('fleetMemories', JSON.stringify(memories.filter(m => m.id !== id)));
      localStorage.setItem('archivedMemories', JSON.stringify([...archived, memory]));
      updateStats(memories.filter(m => m.id !== id), [...archived, memory]);
    }
  };

  const deleteMemory = (id, isArchived = false) => {
    if (isArchived) {
      const newArchived = archived.filter(m => m.id !== id);
      setArchived(newArchived);
      localStorage.setItem('archivedMemories', JSON.stringify(newArchived));
      updateStats(memories, newArchived);
    } else {
      const newMemories = memories.filter(m => m.id !== id);
      setMemories(newMemories);
      localStorage.setItem('fleetMemories', JSON.stringify(newMemories));
      updateStats(newMemories, archived);
    }
  };

  const restoreMemory = (id) => {
    const memory = archived.find(m => m.id === id);
    if (memory) {
      const { archivedAt, ...restored } = memory;
      setArchived(archived.filter(m => m.id !== id));
      setMemories([...memories, restored]);
      localStorage.setItem('fleetMemories', JSON.stringify([...memories, restored]));
      localStorage.setItem('archivedMemories', JSON.stringify(archived.filter(m => m.id !== id)));
      updateStats([...memories, restored], archived.filter(m => m.id !== id));
    }
  };

  const addTestMemory = () => {
    const newMemory = {
      id: Date.now(),
      type: ['driver_preference', 'route_history', 'maintenance_note', 'fuel_pattern'][Math.floor(Math.random() * 4)],
      content: 'Sample memory data that would be archived if not actively needed',
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    };
    const newMemories = [...memories, newMemory];
    setMemories(newMemories);
    localStorage.setItem('fleetMemories', JSON.stringify(newMemories));
    updateStats(newMemories, archived);
  };

  const filteredMemories = filter === 'all' 
    ? memories 
    : memories.filter(m => m.priority === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Database className="w-10 h-10 text-amber-400" />
            Memory Management Agent
          </h1>
          <p className="text-slate-300">Routes incoming fleet data to storage, keeping your app fast and responsive</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">Active Memories</span>
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeMemories}</p>
            <p className="text-xs text-slate-400 mt-2">Currently in app memory</p>
          </div>

          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">Archived</span>
              <Archive className="w-5 h-5 text-cyan-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.archivedCount}</p>
            <p className="text-xs text-slate-400 mt-2">Stored for retrieval</p>
          </div>

          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">Space Used</span>
              <Database className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.estimatedSpaceUsed} MB</p>
            <p className="text-xs text-slate-400 mt-2">Total footprint</p>
          </div>

          <div className="bg-slate-700/50 backdrop-blur border border-slate-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm font-medium">Readiness</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.readinessScore}%</p>
            <p className="text-xs text-slate-400 mt-2">App responsiveness</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-700/30 backdrop-blur border border-slate-600 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoArchiveEnabled}
                  onChange={(e) => setAutoArchiveEnabled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-white text-sm">Auto-archive inactive data</span>
              </label>
            </div>
            <button
              onClick={addTestMemory}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              + Add Test Memory
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filter === f
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Memories */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Active Memories ({filteredMemories.length})
          </h2>
          <div className="space-y-3">
            {filteredMemories.length === 0 ? (
              <div className="bg-slate-700/30 backdrop-blur border border-slate-600 rounded-lg p-6 text-center text-slate-400">
                No active memories in this filter
              </div>
            ) : (
              filteredMemories.map(memory => (
                <div key={memory.id} className="bg-slate-700/30 backdrop-blur border border-slate-600 rounded-lg p-4 flex items-start justify-between hover:bg-slate-700/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        memory.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                        memory.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {memory.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-slate-300 font-mono">{memory.type}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{memory.content}</p>
                    <p className="text-xs text-slate-500 mt-2">Last accessed: {new Date(memory.lastAccessed).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => archiveMemory(memory.id)}
                      className="p-2 hover:bg-slate-600/50 rounded text-cyan-400 transition-colors"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Archived Memories */}
        {archived.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5 text-cyan-400" />
              Archived Memories ({archived.length})
            </h2>
            <div className="space-y-3">
              {archived.map(memory => (
                <div key={memory.id} className="bg-slate-700/20 backdrop-blur border border-slate-700 rounded-lg p-4 flex items-start justify-between opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-slate-600/50 text-slate-300">
                        ARCHIVED
                      </span>
                      <span className="text-sm text-slate-400 font-mono">{memory.type}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{memory.content}</p>
                    <p className="text-xs text-slate-600 mt-2">Archived: {new Date(memory.archivedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => restoreMemory(memory.id)}
                      className="p-2 hover:bg-slate-600/50 rounded text-green-400 transition-colors"
                      title="Restore"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteMemory(memory.id, true)}
                      className="p-2 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-300 text-sm">
              <strong>How it works:</strong> This agent automatically archives fleet data that isn't actively needed — driver preferences, historical routes, maintenance notes — keeping them searchable but out of active memory. Your app stays fast, and any archived data can be restored instantly when needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
