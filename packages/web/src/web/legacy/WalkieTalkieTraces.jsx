import React, { useState, useEffect } from 'react';
import { Radio, Upload, FileText, BarChart3, MapPin, AlertCircle, CheckCircle, Download, Send } from 'lucide-react';

export default function WalkieTalkieTraces() {
  const [activeTab, setActiveTab] = useState('walkie-talkie');
  const [messages, setMessages] = useState([
    { id: 1, driver: 'Mike Chen', message: 'On I-40, heading to Memphis warehouse', time: '2 min ago', location: 'Memphis, TN' },
    { id: 2, driver: 'Sarah Johnson', message: 'Breakdown reported at mile 245, waiting on tow', time: '5 min ago', location: 'Nashville, TN' },
    { id: 3, driver: 'Carlos Rodriguez', message: 'Fuel stop complete, resuming route', time: '8 min ago', location: 'Knoxville, TN' }
  ]);

  const [traces, setTraces] = useState([
    {
      id: 'TR001',
      driver: 'Mike Chen',
      date: '2026-08-04',
      documents: ['DOT Medical', 'License', 'Insurance Card'],
      hosLogs: 48,
      violations: 0,
      status: 'Compliant',
      lastUpdated: '2 hours ago'
    },
    {
      id: 'TR002',
      driver: 'Sarah Johnson',
      date: '2026-08-04',
      documents: ['DOT Medical', 'License', 'HAZMAT Endorsement'],
      hosLogs: 52,
      violations: 1,
      status: 'Minor Flag',
      lastUpdated: '1 hour ago'
    },
    {
      id: 'TR003',
      driver: 'Carlos Rodriguez',
      date: '2026-08-04',
      documents: ['DOT Medical', 'License', 'Insurance Card'],
      hosLogs: 56,
      violations: 0,
      status: 'Compliant',
      lastUpdated: '30 min ago'
    }
  ]);

  const [blogs, setBlogs] = useState([
    {
      id: 'B001',
      author: 'Mike Chen',
      title: 'Cross-Country Compliance: Every HOS Log Documented',
      date: '2026-08-04',
      hosLogs: 48,
      documents: 3,
      uploads: ['HOS_logs.pdf', 'Photos_Memphis_Stop.zip'],
      excerpt: 'Full documentation of 3,200-mile run with all compliance records...'
    },
    {
      id: 'B002',
      author: 'Sarah Johnson',
      title: 'HAZMAT Handling: Best Practices from the Road',
      date: '2026-08-03',
      hosLogs: 52,
      documents: 4,
      uploads: ['Training_Cert.pdf', 'Route_Plans.pdf'],
      excerpt: 'Complete guide to safe HAZMAT transport with documented evidence...'
    }
  ]);

  const [selectedTrace, setSelectedTrace] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const generateFullReport = (trace) => {
    return {
      driver: trace.driver,
      date: trace.date,
      hosLogCount: trace.hosLogs,
      violations: trace.violations,
      status: trace.status,
      documents: trace.documents,
      compliance: trace.violations === 0 ? 'PASS' : 'REVIEW',
      timestamp: new Date().toLocaleString()
    };
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Radio size={40} className="text-amber-400" />
            Walkie Talkie Traces
          </h1>
          <p className="text-lg text-gray-400">Real-time driver comms + Complete documentation & compliance records</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap justify-center mb-6">
          {[
            { id: 'walkie-talkie', label: 'Live Comms', icon: Radio },
            { id: 'traces', label: 'Driver Traces', icon: MapPin },
            { id: 'blogs', label: 'Story Blogs', icon: FileText },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-sm md:text-base ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Walkie Talkie - Live Communications */}
      {activeTab === 'walkie-talkie' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Live Driver Communications</h2>
          
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className="bg-gray-900 border border-amber-500/30 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{msg.driver}</h3>
                  <span className="text-xs text-gray-400">{msg.time}</span>
                </div>
                <p className="text-gray-300 mb-2">"{msg.message}"</p>
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <MapPin size={14} />
                  {msg.location}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Broadcast message to all drivers..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 outline-none transition"
              />
              <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-6 py-2 rounded transition flex items-center gap-2">
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Traces - Compliance & Documentation */}
      {activeTab === 'traces' && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Driver Traces & Records</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {traces.map(trace => (
              <div
                key={trace.id}
                className="bg-gray-900 border border-amber-500/30 rounded-lg p-4 cursor-pointer hover:border-amber-500 transition"
                onClick={() => setSelectedTrace(trace)}
              >
                <h3 className="text-lg font-bold mb-2">{trace.driver}</h3>
                
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">HOS Logs</span>
                    <span className="font-bold">{trace.hosLogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Documents</span>
                    <span className="font-bold">{trace.documents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Violations</span>
                    <span className={`font-bold ${trace.violations === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trace.violations}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-gray-800 rounded mb-3">
                  {trace.status === 'Compliant' ? (
                    <CheckCircle size={16} className="text-green-400" />
                  ) : (
                    <AlertCircle size={16} className="text-yellow-400" />
                  )}
                  <span className={trace.status === 'Compliant' ? 'text-green-400' : 'text-yellow-400'}>
                    {trace.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">Updated: {trace.lastUpdated}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrace(trace);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 rounded transition text-sm"
                >
                  View Full Record
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blogs with Uploads */}
      {activeTab === 'blogs' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Story Blogs & Documentation</h2>
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-bold hover:bg-amber-600 transition text-sm"
            >
              <Upload size={18} />
              New Blog
            </button>
          </div>

          <div className="space-y-4">
            {blogs.map(blog => (
              <div
                key={blog.id}
                className="bg-gray-900 border border-amber-500/30 rounded-lg p-5 cursor-pointer hover:border-amber-500 transition"
                onClick={() => setSelectedBlog(blog)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{blog.title}</h3>
                    <p className="text-amber-400 text-sm">by {blog.author}</p>
                  </div>
                  <span className="text-xs text-gray-400">{blog.date}</span>
                </div>

                <p className="text-gray-300 text-sm mb-3">{blog.excerpt}</p>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3 p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-gray-400">HOS Logs</p>
                    <p className="font-bold text-amber-400">{blog.hosLogs}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Documents</p>
                    <p className="font-bold">{blog.documents}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Uploads</p>
                    <p className="font-bold">{blog.uploads.length}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm transition">
                    Read Full Story
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm transition">
                    📁 Files
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports */}
      {activeTab === 'reports' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Compliance & Data Reports</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Generate Driver Report</h3>
              
              <div className="space-y-3 mb-4">
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition">
                  <option>Select Driver...</option>
                  {traces.map(trace => (
                    <option key={trace.id}>{trace.driver}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition">
                    <option>All Documents</option>
                    <option>HOS Logs Only</option>
                    <option>Compliance Docs</option>
                    <option>Medical Certs</option>
                  </select>

                  <select className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-amber-500 outline-none transition">
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>All Time</option>
                  </select>
                </div>
              </div>

              <button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded transition flex items-center justify-center gap-2">
                <Download size={20} />
                Generate Report
              </button>
            </div>

            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Fleet Compliance Dashboard</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded p-4 text-center">
                  <p className="text-gray-400 text-sm">Total Drivers</p>
                  <p className="text-3xl font-bold text-amber-400">47</p>
                </div>
                <div className="bg-gray-800 rounded p-4 text-center">
                  <p className="text-gray-400 text-sm">Compliant</p>
                  <p className="text-3xl font-bold text-green-400">46</p>
                </div>
                <div className="bg-gray-800 rounded p-4 text-center">
                  <p className="text-gray-400 text-sm">Flagged</p>
                  <p className="text-3xl font-bold text-yellow-400">1</p>
                </div>
                <div className="bg-gray-800 rounded p-4 text-center">
                  <p className="text-gray-400 text-sm">Violations</p>
                  <p className="text-3xl font-bold text-red-400">3</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trace Detail Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-4">{selectedTrace.driver} - Complete Record</h3>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Date</p>
                  <p className="font-semibold">{selectedTrace.date}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">HOS Logs</p>
                  <p className="font-semibold">{selectedTrace.hosLogs}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Documents on File</p>
                <div className="space-y-1">
                  {selectedTrace.documents.map((doc, idx) => (
                    <div key={idx} className="bg-gray-800 p-2 rounded flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <FileText size={14} className="text-amber-400" />
                        {doc}
                      </span>
                      <span className="text-xs text-green-400">✓ Verified</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Compliance Status</p>
                <div className="bg-gray-800 p-3 rounded flex items-center justify-between">
                  <span className={selectedTrace.violations === 0 ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>
                    {selectedTrace.status}
                  </span>
                  <span className="text-sm">Violations: {selectedTrace.violations}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const report = generateFullReport(selectedTrace);
                console.log('Full Report:', report);
                alert('Report generated and ready to download: ' + JSON.stringify(report, null, 2));
              }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded transition flex items-center justify-center gap-2 mb-3"
            >
              <Download size={20} />
              Download Complete Report
            </button>

            <button
              onClick={() => setSelectedTrace(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Blog Detail Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-2xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-2">{selectedBlog.title}</h3>
            <p className="text-amber-400 text-sm mb-4">by {selectedBlog.author} • {selectedBlog.date}</p>
            
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-800 rounded">
                <div>
                  <p className="text-gray-400 text-sm">HOS Logs</p>
                  <p className="font-bold">{selectedBlog.hosLogs}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Documents</p>
                  <p className="font-bold">{selectedBlog.documents}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Uploads</p>
                  <p className="font-bold">{selectedBlog.uploads.length}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Attached Files</p>
                <div className="space-y-2">
                  {selectedBlog.uploads.map((file, idx) => (
                    <div key={idx} className="bg-gray-800 p-2 rounded flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <FileText size={14} className="text-amber-400" />
                        {file}
                      </span>
                      <button className="text-xs bg-amber-500 hover:bg-amber-600 text-black px-2 py-1 rounded transition">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedBlog(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-4">Create Story Blog with Documentation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Story Title</label>
                <input
                  type="text"
                  placeholder="e.g., Complete Compliance Documentation"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Your Story</label>
                <textarea
                  placeholder="Share your experience with documentation, HOS logs, compliance..."
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Upload DOT Documents & Files</label>
                <div className="border-2 border-dashed border-amber-500 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-800 transition">
                  <Upload className="mx-auto mb-2 text-amber-400" size={32} />
                  <p className="text-sm text-gray-300 font-semibold">HOS logs, medical certs, inspection reports</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, Images, ZIP files accepted</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.png,.zip" multiple />
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-amber-500 text-black font-bold py-3 px-4 rounded hover:bg-amber-600 transition">
                  Publish Blog & Files
                </button>
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
