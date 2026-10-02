import React, { useState, useEffect } from 'react';
import { MapPin, MessageSquare, Phone, Video, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function DriverGalaFaceTime() {
  const [activeTab, setActiveTab] = useState('locations');
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Mike Chen',
      location: 'Memphis, TN',
      phone: '615-555-0142',
      faceTimeHandle: 'mchen.trucker@icloud.com',
      distance: 2.3,
      heading: 'Atlanta, GA',
      vehicle: '2022 Peterbilt 579',
      status: 'Available',
      lastSeen: '5 min ago',
      rating: 4.9,
      loadHistory: 245
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      location: 'Nashville, TN',
      phone: '615-555-0156',
      faceTimeHandle: 'sarah.j.driver@icloud.com',
      distance: 45.2,
      heading: 'Birmingham, AL',
      vehicle: '2020 Volvo VNL',
      status: 'In convoy',
      lastSeen: '2 min ago',
      rating: 4.8,
      loadHistory: 312
    },
    {
      id: 3,
      name: 'Carlos Rodriguez',
      location: 'Knoxville, TN',
      phone: '865-555-0198',
      faceTimeHandle: 'carlos.rod.driver@icloud.com',
      distance: 78.5,
      heading: 'Jacksonville, FL',
      vehicle: '2019 Freightliner Cascadia',
      status: 'Available',
      lastSeen: '18 min ago',
      rating: 4.7,
      loadHistory: 428
    }
  ]);

  const [loads, setLoads] = useState([
    {
      id: 'L001',
      poster: 'Mike Chen',
      origin: 'Memphis, TN',
      destination: 'Atlanta, GA',
      posted: '2 hours ago',
      type: 'Looking for backhaul',
      details: '8 hours available, refrigerated capable',
      weight: '2,400 lbs',
      rate: '$1,200'
    },
    {
      id: 'L002',
      poster: 'Sarah Johnson',
      origin: 'Nashville, TN',
      destination: 'Birmingham, AL',
      posted: '45 min ago',
      type: 'Just completed',
      details: 'Amazon Fresh pickup — fast, professional, on time',
      weight: '1,800 lbs',
      rate: '$980'
    }
  ]);

  const [shippers, setShippers] = useState([
    {
      id: 'S001',
      name: 'Love\'s Travel Stop - Amarillo',
      rating: 4.9,
      reviews: 342,
      feedback: '15-minute unload, free showers, driver friendly',
      lastVisit: '1 week ago',
      author: 'Mike Chen',
      verified: true
    },
    {
      id: 'S002',
      name: 'Amazon Warehouse - Dallas',
      rating: 4.7,
      reviews: 156,
      feedback: '2.5-hour unload, good equipment, helpful staff',
      lastVisit: '3 days ago',
      author: 'Sarah Johnson',
      verified: true
    }
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [contactMethod, setContactMethod] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">Driver Gala</h1>
          <p className="text-xl text-gray-400">Where drivers connect, share loads, and own the road</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 flex-wrap justify-center mb-8">
          {[
            { id: 'locations', label: 'Live Locations', icon: MapPin },
            { id: 'loads', label: 'Load Feed', icon: MessageSquare },
            { id: 'shippers', label: 'Shipper Reviews', icon: CheckCircle },
            { id: 'chat', label: 'Driver Chat', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Locations */}
      {activeTab === 'locations' && (
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Drivers Near You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map(driver => (
              <div
                key={driver.id}
                className="bg-gray-900 border border-amber-500/30 rounded-lg p-6 hover:border-amber-500 transition cursor-pointer"
                onClick={() => setSelectedDriver(driver)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{driver.name}</h3>
                    <p className="text-amber-400 font-semibold">{driver.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{driver.distance} miles away</p>
                    <span className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded mt-1">
                      {driver.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-300">
                  <p><strong>Heading:</strong> {driver.heading}</p>
                  <p><strong>Vehicle:</strong> {driver.vehicle}</p>
                  <p><strong>Rating:</strong> ⭐ {driver.rating} ({driver.loadHistory} loads)</p>
                </div>

                {/* Contact Options */}
                <div className="space-y-2 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-400 font-semibold">CONTACT THIS DRIVER</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={`tel:${driver.phone}`}
                      className="flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                    <a
                      href={`facetime://${driver.faceTimeHandle}`}
                      className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      <Video size={16} />
                      FaceTime
                    </a>
                    <a
                      href={`sms:${driver.phone}?body=Hi%20${encodeURIComponent(driver.name)}%2C%20saw%20you%20on%20Driver%20Gala`}
                      className="flex items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm font-semibold transition"
                    >
                      <MessageSquare size={16} />
                      Text
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Load Feed */}
      {activeTab === 'loads' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Driver Load Board</h2>
          <div className="space-y-4">
            {loads.map(load => (
              <div key={load.id} className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{load.poster}</h3>
                    <p className="text-amber-400">{load.origin} → {load.destination}</p>
                  </div>
                  <p className="text-sm text-gray-400">{load.posted}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-400">Type</p>
                    <p className="font-semibold">{load.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Details</p>
                    <p className="font-semibold">{load.details}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Weight</p>
                    <p className="font-semibold">{load.weight}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Rate</p>
                    <p className="font-semibold text-green-400">{load.rate}</p>
                  </div>
                </div>
                <button className="w-full bg-amber-500 text-black font-bold py-2 rounded hover:bg-amber-600 transition">
                  Reply to {load.poster}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipper Reviews */}
      {activeTab === 'shippers' && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Shipper & Receiver Reviews</h2>
          <div className="space-y-4">
            {shippers.map(shipper => (
              <div key={shipper.id} className="bg-gray-900 border border-amber-500/30 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{shipper.name}</h3>
                      {shipper.verified && (
                        <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Verified</span>
                      )}
                    </div>
                    <p className="text-amber-400 mt-1">⭐ {shipper.rating} ({shipper.reviews} reviews)</p>
                  </div>
                  <p className="text-sm text-gray-400">by {shipper.author}</p>
                </div>
                <p className="text-gray-300 mb-2">"{shipper.feedback}"</p>
                <p className="text-xs text-gray-500">Last visit: {shipper.lastVisit}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat */}
      {activeTab === 'chat' && (
        <div className="max-w-4xl mx-auto bg-gray-900 border border-amber-500/30 rounded-lg p-6">
          <h2 className="text-3xl font-bold mb-6">Driver Chat & Help</h2>
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded">
              <p className="font-bold text-amber-400">Questions about HOS rules by state?</p>
              <p className="text-gray-300 mt-2">Post your question and experienced drivers answer in real time.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="font-bold text-amber-400">Mechanical advice & truck tips</p>
              <p className="text-gray-300 mt-2">Share problems, get solutions from drivers who've been there.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="font-bold text-amber-400">Best parking spots & fuel deals</p>
              <p className="text-gray-300 mt-2">Where to stop, what to avoid, real feedback from real drivers.</p>
            </div>
            <div className="bg-gray-800 p-4 rounded">
              <p className="font-bold text-amber-400">Report hazards & safety concerns</p>
              <p className="text-gray-300 mt-2">Help each other stay safe on the road.</p>
            </div>
          </div>
          <button className="w-full mt-6 bg-amber-500 text-black font-bold py-3 rounded hover:bg-amber-600 transition">
            Start a Conversation
          </button>
        </div>
      )}

      {/* FaceTime Info Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-amber-500 rounded-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">{selectedDriver.name}</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Current Location</p>
                <p className="font-semibold">{selectedDriver.location}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Heading To</p>
                <p className="font-semibold">{selectedDriver.heading}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">FaceTime Handle</p>
                <p className="font-semibold text-green-400">{selectedDriver.faceTimeHandle}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-400">Choose how to connect:</p>
              <a
                href={`tel:${selectedDriver.phone}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center transition"
              >
                📱 Call {selectedDriver.phone}
              </a>
              <a
                href={`facetime://${selectedDriver.faceTimeHandle}`}
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center transition"
              >
                📹 FaceTime Call
              </a>
              <a
                href={`sms:${selectedDriver.phone}?body=Hi%20${encodeURIComponent(selectedDriver.name)}%2C%20saw%20you%20on%20Driver%20Gala`}
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center transition"
              >
                💬 Text Message
              </a>
              <button
                onClick={() => setSelectedDriver(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
