import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Navigation, Zap, TrendingUp, MapPin, Clock, AlertTriangle, CheckCircle, Phone, MessageSquare } from 'lucide-react';
import { pb } from '../lib/pb';

const RoadContextPage = () => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentLoad, setCurrentLoad] = useState(null);
  const [contextIntel, setContextIntel] = useState({
    dangerNearby: [],
    brokerFlags: [],
    topStopsAhead: [],
    weatherAlerts: [],
    brokerMessages: [],
    recentActivityNearby: [],
  });
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const mapRef = useRef(null);

  // Simulate live GPS tracking
  useEffect(() => {
    const simulateGPS = setInterval(() => {
      // Random location in US (simulated)
      setDriverLocation({
        lat: 40.7 + (Math.random() - 0.5) * 5,
        lng: -95.4 + (Math.random() - 0.5) * 5,
        speed: Math.floor(Math.random() * 75) + 20,
        bearing: Math.floor(Math.random() * 360),
      });
    }, 5000);
    return () => clearInterval(simulateGPS);
  }, []);

  // Fetch context intelligence based on location
  useEffect(() => {
    const fetchContextIntel = async () => {
      if (!driverLocation) return;
      setLoading(true);
      try {
        // Fetch danger reports nearby
        const dangerReports = await pb.collection('road_danger_reports').getList(1, 50);
        const dangerNearby = dangerReports.items.filter(report => {
          // Rough proximity check (in real app, parse coordinates)
          return Math.random() > 0.7; // Simulate finding nearby dangers
        }).slice(0, 3);

        // Fetch broker flags for current load
        let brokerFlags = [];
        if (currentLoad?.shipper) {
          const brokerRatings = await pb.collection('shipper_broker_ratings').getList(1, 50, {
            filter: `company_name = "${currentLoad.shipper}"`,
          });
          brokerFlags = brokerRatings.items.filter(r => r.rating <= 2);
        }

        // Fetch top nearby charge stops
        const topStops = await pb.collection('route_stop_feedback').getList(1, 50);
        const topStopsAhead = topStops.items
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4);

        // Fetch recent activity nearby (simulated)
        const recentActivity = await pb.collection('user_activity_index').getList(1, 50);

        setContextIntel({
          dangerNearby,
          brokerFlags,
          topStopsAhead,
          weatherAlerts: [
            { type: 'snow', region: 'I-80 East', severity: 'high', details: 'Heavy snow expected next 2 hrs' },
            { type: 'wind', region: 'I-25', severity: 'medium', details: 'Gusts to 45 mph' },
          ],
          brokerMessages: currentLoad ? [
            { from: currentLoad.shipper, subject: 'Load Confirmed', time: '2m ago' },
          ] : [],
          recentActivityNearby: recentActivity.items.slice(0, 5),
        });
      } catch (err) {
        console.log('Context fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContextIntel();
  }, [driverLocation, currentLoad]);

  const AlertCard = ({ alert, icon: Icon, severity = 'medium' }) => {
    const severityColor = {
      critical: 'border-red-500 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-blue-500 bg-blue-50',
    };

    return (
      <div
        onClick={() => setSelectedAlert(alert)}
        className={`border-l-4 p-4 rounded cursor-pointer hover:shadow-md transition ${
          severityColor[severity] || severityColor.medium
        }`}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">{alert.title || alert.type}</h4>
            <p className="text-xs text-gray-700 mt-1">{alert.description || alert.details}</p>
            {alert.time && <p className="text-xs text-gray-500 mt-2">{alert.time}</p>}
          </div>
        </div>
      </div>
    );
  };

  const DangerBanner = () => {
    if (contextIntel.dangerNearby.length === 0) return null;
    return (
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg mb-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold">⚠️ DANGER AHEAD</h3>
          <p className="text-sm mt-1">
            {contextIntel.dangerNearby[0]?.description || 'Road hazard reported on your route'}
          </p>
          <p className="text-xs opacity-90 mt-2">Confirmed by {contextIntel.dangerNearby[0]?.confirmed_count || 1} drivers</p>
        </div>
      </div>
    );
  };

  const BrokerFlagBanner = () => {
    if (contextIntel.brokerFlags.length === 0) return null;
    return (
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-4 rounded-lg mb-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold">🚩 BROKER ALERT</h3>
          <p className="text-sm mt-1">
            <strong>{currentLoad?.shipper}</strong> has multiple negative ratings
          </p>
          <p className="text-xs opacity-90 mt-1">
            {contextIntel.brokerFlags.length} low ratings • Pay issues reported • Consider follow-up
          </p>
        </div>
      </div>
    );
  };

  const TopStopsSection = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          Top Charge Stops Ahead
        </h3>
        <div className="space-y-2">
          {contextIntel.topStopsAhead.map((stop, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <div>
                <p className="font-semibold">{stop.stop_name || 'Stop ' + (i + 1)}</p>
                <p className="text-xs text-gray-600">{stop.vehicle_type}</p>
              </div>
              <div className="text-right">
                <p className="text-amber-600 font-bold">{stop.rating ? (stop.rating * 20) + '%' : '85%'}</p>
                <p className="text-xs text-gray-500">{stop.rating || 0} ratings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const WeatherSection = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-blue-500" />
          Weather & Road Conditions
        </h3>
        <div className="space-y-2">
          {contextIntel.weatherAlerts.map((alert, i) => (
            <div key={i} className="p-2 bg-blue-50 border-l-2 border-blue-400 rounded text-sm">
              <p className="font-semibold">{alert.region}</p>
              <p className="text-xs text-gray-700">{alert.details}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LocationHeader = () => {
    return (
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-lg mb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Road Context Live
            </h2>
            {driverLocation && (
              <p className="text-xs opacity-80 mt-2">
                Lat {driverLocation.lat.toFixed(2)}, Lng {driverLocation.lng.toFixed(2)} •{' '}
                {driverLocation.speed} mph
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75 mb-1">Connected</p>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  };

  const CurrentLoadCard = () => {
    if (!currentLoad)
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-center text-sm">
          <p className="text-gray-700">Load data will populate when you claim a load on the Load Board</p>
        </div>
      );

    return (
      <div className="bg-white border-2 border-blue-400 rounded-lg p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold">📦 Current Load</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Active</span>
        </div>
        <div className="text-sm space-y-1 text-gray-700">
          <p>
            <strong>{currentLoad.origin}</strong> → <strong>{currentLoad.destination}</strong>
          </p>
          <p>{currentLoad.miles} mi • ${currentLoad.rate}/mi</p>
          <p className="text-xs text-gray-600">{currentLoad.commodity}</p>
        </div>
      </div>
    );
  };

  const AlertsSidebar = () => {
    const allAlerts = [
      ...contextIntel.dangerNearby.map(d => ({
        ...d,
        type: 'danger',
        severity: 'critical',
        icon: AlertTriangle,
      })),
      ...contextIntel.brokerFlags.map(b => ({
        title: `${currentLoad?.shipper} - Low Rating`,
        description: `Rating: ${b.rating}/5`,
        type: 'broker',
        severity: 'high',
        icon: AlertCircle,
      })),
      ...contextIntel.weatherAlerts.map(w => ({
        title: `Weather: ${w.region}`,
        description: w.details,
        type: 'weather',
        severity: w.severity === 'high' ? 'high' : 'medium',
        icon: Navigation,
      })),
    ].sort((a, b) => {
      const severityRank = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityRank[a.severity] - severityRank[b.severity];
    });

    return (
      <div className="space-y-3">
        {allAlerts.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p>All clear on your route</p>
          </div>
        ) : (
          allAlerts.map((alert, i) => <AlertCard key={i} alert={alert} icon={alert.icon} severity={alert.severity} />)
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <LocationHeader />

        {/* Current Load */}
        <CurrentLoadCard />

        {/* Critical Alerts */}
        {(contextIntel.dangerNearby.length > 0 || contextIntel.brokerFlags.length > 0) && (
          <div className="space-y-3 mb-4">
            <DangerBanner />
            <BrokerFlagBanner />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Intelligence Feed */}
          <div className="lg:col-span-2 space-y-4">
            <TopStopsSection />
            <WeatherSection />

            {/* Broker Messages */}
            {contextIntel.brokerMessages.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  Messages
                </h3>
                <div className="space-y-2">
                  {contextIntel.brokerMessages.map((msg, i) => (
                    <div key={i} className="p-3 bg-purple-50 rounded border-l-2 border-purple-400 text-sm">
                      <p className="font-semibold text-purple-900">{msg.from}</p>
                      <p className="text-xs text-gray-600 mt-1">{msg.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {contextIntel.recentActivityNearby.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-bold flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-teal-500" />
                  Recent Fleet Activity Nearby
                </h3>
                <div className="space-y-2">
                  {contextIntel.recentActivityNearby.slice(0, 4).map((activity, i) => (
                    <div key={i} className="p-2 text-xs text-gray-700 bg-gray-50 rounded">
                      <p className="font-semibold">{activity.action_type}</p>
                      <p>{activity.module}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Alerts Sidebar */}
          <div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Active Alerts
              </h3>
              <AlertsSidebar />

              {/* Driver Support */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded font-semibold text-sm hover:bg-blue-700 transition">
                  <Phone className="w-4 h-4" />
                  Call Support
                </button>
                <button className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-2 rounded font-semibold text-sm hover:bg-gray-300 transition">
                  <MessageSquare className="w-4 h-4" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for selected alert */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-3">{selectedAlert.title || selectedAlert.type}</h2>
            <p className="text-gray-700 mb-4">{selectedAlert.description || selectedAlert.details}</p>
            <button
              onClick={() => setSelectedAlert(null)}
              className="w-full bg-gray-900 text-white py-2 rounded font-semibold hover:bg-gray-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoadContextPage;
