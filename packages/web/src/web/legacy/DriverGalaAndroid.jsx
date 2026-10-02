import React, { useState, useEffect } from 'react';
import { MapPin, MessageSquare, Phone, Video, Users, AlertCircle, CheckCircle, Share2, Upload } from 'lucide-react';
import WorldNewsFeed from "./WorldNewsFeed";

export default function DriverGalaAndroid() {
  const [activeTab, setActiveTab] = useState('locations');
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Mike Chen',
      location: 'Memphis, TN',
      phone: '615-555-0142',
      android: 'mike.chen.trucker',
      distance: 2.3,
      heading: 'Atlanta, GA',
      vehicle: '2022 Peterbilt 579',
      status: 'Available',
      lastSeen: '5 min ago',
      rating: 4.9,
      loadHistory: 245,
      hosLogs: 8,
      interesting: 'Just recovered $1,200 detention claim'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      location: 'Nashville, TN',
      phone: '615-555-0156',
      android: 'sarah.j.driver',
      distance: 45.2,
      heading: 'Birmingham, AL',
      vehicle: '2020 Volvo VNL',
      status: 'In convoy',
      lastSeen: '2 min ago',
      rating: 4.8,
      loadHistory: 312,
      hosLogs: 12,
      interesting: 'New fuel efficiency record: 6.8 MPG'
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      location: 'Knoxville, TN',
      phone: '865-555-0198',
      android: 'carlos.rod.driver',
      distance: 78.5,
      heading: 'Jacksonville, FL',
      vehicle: '2019 Freightliner Cascadia',
      status: 'Available',
      lastSeen: '18 min ago',
      rating: 4.7,
      loadHistory: 428,
      hosLogs: 15,
      interesting: 'Crossed country in 4 days, all compliant'
    }
  ]);

  const [blogs, setBlogs] = useState([
    {
      id: 'B001',
      author: 'Mike Chen',
      title: 'How I Recovered $1,200 in Detention Pay This Month',
      category: 'HOS Logs & Earnings',
      posted: '2 hours ago',
      excerpt: 'Every detention minute counts. Here\'s how I tracked and claimed every penny...',
      hosLogsIncluded: 8,
      views: 342,
      likes: 89
    },
    {
      id: 'B002',
      author: 'Sarah Johnson',
      title: 'Fuel Efficiency Challenge: Breaking the 6.8 MPG Barrier',
      category: 'HOS Logs & Performance',
      posted: '5 hours ago',
      excerpt: 'My complete breakdown of tire pressure, idle reduction, and route planning...',
      hosLogsIncluded: 12,
      views: 567,
      likes: 134
    },
    {
      id: 'B003',
      author: 'Carlos Rodriguez',
      title: 'Cross-Country Run: 4,200 Miles in 4 Days, All Compliant',
      category: 'HOS Challenge',
      posted: '1 day ago',
      excerpt: 'Full HOS log analysis showing how to maximize efficiency without violating limits...',
      hosLogsIncluded: 15,
      views: 1204,
      likes: 298
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [videoCallActive, setVideoCallActive] = useState(false);
  const [showBlogUpload, setShowBlogUpload] = useState(false);

  const initiateVideoCall = (driver) => {
    setVideoCallActive(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Driver Gala</h1>
          <p className="text-lg text-gray-400">Connect face-to-face with Android, iOS, and Mac</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 flex-wrap justify-center mb-6 overflow-x-auto">
          {[
            { id: 'locations', label: 'Live Locations', icon: MapPin },
            { id: 'blogs', label: 'HOS & Stories', icon: Upload },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'community', label: 'Community', icon: Users },
            { id: 'news', label: 'Industry News', icon: AlertCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap text-sm md:text-base ${
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

      {/* Live Locations - Face-to-Face Video Ready */}
      {activeTab === 'locations' && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Drivers Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drivers.map(driver => (
              <div
                key={driver.id}
                className="bg-gray-900 border border-amber-500/30 rounded-lg p-4 hover:border-amber-500 transition cursor-pointer"
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{driver.name}</h3>
                    <p className="text-amber-400 font-semibold text-sm">{driver.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{driver.distance} mi away</p>
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded mt-1">
                      {driver.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 mb-3 text-xs text-gray-300">
                  <p><strong>→</strong> {driver.heading}</p>
                  <p><strong>🚛</strong> {driver.vehicle}</p>
                  <p><strong>⭐</strong> {driver.rating} ({driver.loadHistory} loads)</p>
                </div>

                {/* Video & Contact Options */}
                <div className="space-y-2 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 font-semibold">CONNECT FACE-TO-FACE</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateVideoCall(driver);
                      }}
                      className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-2 rounded text-xs font-semibold transition"
                    >
                      <Video size={14} />
                      Video
                    </button>
                    <a
                      href={`tel:${driver.phone}`}
                      className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 px-2 py-2 rounded text-xs font-semibold transition"
                    >
                      <Phone size={14} />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOS Logs & Driver Stories Blog */}
      {activeTab === 'blogs' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">HOS Logs & Driver Stories</h2>
            <button
              onClick={() => setShowBlogUpload(true)}
              className="flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded font-bold hover:bg-amber-600 transition text-sm"
            >
              <Upload size={18} />
              Share Your Story
            </button>
          </div>

          <div className="space-y-4">
            {blogs.map(blog => (
              <div key={blog.id} className="bg-gray-900 border border-amber-500/30 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold">{blog.title}</h3>
                    <p className="text-amber-400 text-sm mt-1">by {blog.author}</p>
                  </div>
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded whitespace-nowrap">
                    {blog.category}
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-3">{blog.excerpt}</p>

                <div className="grid grid-cols-3 gap-3 text-center text-xs mb-3 p-3 bg-gray-800 rounded">
                  <div>
                    <p className="text-gray-400">HOS Logs</p>
                    <p className="font-bold text-amber-400">{blog.hosLogsIncluded}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Views</p>
                    <p className="font-bold">{blog.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Likes</p>
                    <p className="font-bold text-red-400">❤️ {blog.likes}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm transition">
                    Read Full Story
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded text-sm transition">
                    ❤️ Like
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Direct Messages</h2>
          <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 text-center">
            <MessageSquare size={48} className="mx-auto mb-4 text-amber-400" />
            <p className="text-gray-300 mb-4">Select a driver to send a direct message via the app</p>
            <button className="bg-amber-500 text-black font-bold px-6 py-3 rounded hover:bg-amber-600 transition">
              Start a Conversation
            </button>
          </div>
        </div>
      )}

      {/* Community */}
      {activeTab === 'community' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Driver Community</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <p className="font-bold text-amber-400 mb-2">💡 HOS & Compliance Tips</p>
              <p className="text-gray-300 text-sm">Share best practices, ask questions, learn from experienced drivers.</p>
            </div>
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <p className="font-bold text-amber-400 mb-2">🚛 Equipment & Maintenance</p>
              <p className="text-gray-300 text-sm">Truck problems? Mechanical advice from drivers who've fixed it.</p>
            </div>
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <p className="font-bold text-amber-400 mb-2">💰 Earnings & Load Strategy</p>
              <p className="text-gray-300 text-sm">Which loads pay best? Where are the hidden detention fees?</p>
            </div>
            <div className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
              <p className="font-bold text-amber-400 mb-2">🛑 Shippers & Receivers</p>
              <p className="text-gray-300 text-sm">Real reviews: which stops are driver-friendly? Who pays on time?</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Driver Modal */}
      {selectedDriver && !videoCallActive && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-md w-full p-5">
            <h3 className="text-2xl font-bold mb-4">{selectedDriver.name}</h3>
            
            <div className="space-y-2 mb-5 text-sm">
              <div>
                <p className="text-gray-400">Location</p>
                <p className="font-semibold">{selectedDriver.location}</p>
              </div>
              <div>
                <p className="text-gray-400">Heading To</p>
                <p className="font-semibold">{selectedDriver.heading}</p>
              </div>
              <div>
                <p className="text-gray-400">Android Handle</p>
                <p className="font-semibold text-blue-400">{selectedDriver.android}</p>
              </div>
              <div>
                <p className="text-gray-400">Interesting</p>
                <p className="font-semibold text-amber-400">{selectedDriver.interesting}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <button
                onClick={() => initiateVideoCall(selectedDriver)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition text-sm"
              >
                📹 Start Video Call
              </button>
              <a
                href={`tel:${selectedDriver.phone}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition text-sm"
              >
                📱 Call Now
              </a>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition text-sm">
                💬 Send Message
              </button>
            </div>

            <button
              onClick={() => setSelectedDriver(null)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Video Call Active */}
      {videoCallActive && (
        <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{selectedDriver?.name}</h2>
            <p className="text-amber-400">Video call in progress...</p>
          </div>

          <div className="w-full max-w-2xl aspect-video bg-gray-800 rounded-lg mb-6 flex items-center justify-center border-2 border-amber-500">
            <div className="text-center">
              <Video size={64} className="mx-auto mb-4 text-amber-400" />
              <p className="text-gray-300">Camera Feed Active</p>
              <p className="text-xs text-gray-500 mt-2">Both drivers can see and hear each other</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full transition">
              End Call
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-full transition">
              🔇 Mute
            </button>
          </div>

          <button
            onClick={() => {
              setVideoCallActive(false);
              setSelectedDriver(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* Blog Upload Modal */}
      {showBlogUpload && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-xl w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Share Your HOS Story</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Story Title</label>
                <input
                  type="text"
                  placeholder="e.g., How I Recovered $1,200 in Detention Pay"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Your Story</label>
                <textarea
                  placeholder="Share your HOS logs, earnings breakdown, or interesting experience on the road..."
                  rows="5"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:border-amber-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Attach HOS Logs (Optional)</label>
                <div className="border-2 border-dashed border-amber-500 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-800 transition">
                  <Upload className="mx-auto mb-2 text-amber-400" />
                  <p className="text-sm text-gray-300">Upload HOS log screenshots or files</p>
                  <input type="file" className="hidden" accept="image/*,.pdf" />
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-amber-500 text-black font-bold py-2 px-4 rounded hover:bg-amber-600 transition">
                  Publish Story
                </button>
                <button
                  onClick={() => setShowBlogUpload(false)}
                  className="bg-gray-700 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'news' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Industry News</h2>
          <p className="text-gray-400 mb-4">Live freight, fuel, weather, and regulatory updates — all in one place.</p>
          <WorldNewsFeed compact={false} />
        </div>
      )}
    </div>
  );
}
