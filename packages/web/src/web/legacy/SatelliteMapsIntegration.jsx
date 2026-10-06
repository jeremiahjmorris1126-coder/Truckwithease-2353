import { useState, useEffect } from 'react';
import { MapPin, Cloud, AlertTriangle, Eye, Layers, Gauge } from "lucide-react";
import { pb } from '@/lib/pb';

export default function SatelliteMapsIntegration() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mapLayers, setMapLayers] = useState([]);
  const [liveFeeds, setLiveFeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadSatelliteData();
  }, []);

  const loadSatelliteData = () => {
    setMapLayers([
      {
        name: 'Real-Time Traffic',
        source: 'Google Maps / HERE Maps',
        status: 'live',
        coverage: '50 states',
        latency: '2-5 seconds',
        icon: '🚗',
      },
      {
        name: 'Weather Radar',
        source: 'NOAA / National Weather Service',
        status: 'live',
        coverage: 'Continental US + Alaska',
        latency: '30 seconds',
        icon: '⛈️',
      },
      {
        name: 'Satellite Imagery',
        source: 'Sentinel-2 / Landsat 8',
        status: 'live',
        coverage: 'Global',
        latency: '1-2 hours',
        icon: '🛰️',
      },
      {
        name: 'Road Hazards',
        source: 'WAZE / DOT Reports / Crowdsourced',
        status: 'live',
        coverage: '50 states',
        latency: '5-15 minutes',
        icon: '⚠️',
      },
      {
        name: 'Parking Availability',
        source: 'Love\'s / Pilot / Parking APIs',
        status: 'live',
        coverage: 'Major chains nationwide',
        latency: '10 minutes',
        icon: '🅿️',
      },
      {
        name: 'Fuel Prices',
        source: 'RJ O\'Brien / GasBuddy API',
        status: 'live',
        coverage: '50 states',
        latency: '15 minutes',
        icon: '⛽',
      },
      {
        name: 'Construction Zones',
        source: 'State DOT APIs / FHWA',
        status: 'live',
        coverage: '50 states',
        latency: '1 hour',
        icon: '🚧',
      },
      {
        name: 'Accident & Incident Data',
        source: 'CHP / State Police / NHTSA',
        status: 'live',
        coverage: '50 states',
        latency: '5-10 minutes',
        icon: '🚨',
      },
    ]);

    setLiveFeeds([
      {
        feed: 'I-95 Northbound (FL)',
        metric: 'Traffic Flow',
        current: '45 mph avg',
        normal: '65 mph',
        reason: 'Heavy congestion',
      },
      {
        feed: 'US-70 (NC)',
        metric: 'Weather Condition',
        current: 'Heavy rain',
        visibility: '0.5 mi',
        alert: 'Flash flood watch',
      },
      {
        feed: 'I-40 (TN)',
        metric: 'Construction',
        status: 'Lane closures',
        delay: '+15 minutes',
        duration: 'Until Sept 15',
      },
      {
        feed: 'Love\'s Travel Stop (TX)',
        metric: 'Parking',
        available: '23 spots',
        total: '156 total',
        fuel: 'Diesel $3.49/gal',
      },
    ]);

    setAlerts([
      {
        type: 'Weather',
        severity: 'high',
        message: 'Severe thunderstorm warning I-75 (GA/SC border)',
        recommendation: 'Delay departure 2 hours or use alternate route',
      },
      {
        type: 'Accident',
        severity: 'high',
        message: 'Multi-vehicle accident I-10 westbound near Houston',
        recommendation: 'Use US-90 bypass, adds 20 minutes',
      },
      {
        type: 'Traffic',
        severity: 'medium',
        message: 'Rush hour congestion I-405 (Los Angeles)',
        recommendation: 'Recommend delay to 8:00 PM departure',
      },
      {
        type: 'Hazmat',
        severity: 'high',
        message: 'Chemical spill cleanup US-52 (Iowa)',
        recommendation: 'Road closed until 6 PM; use IA-30 detour',
      },
    ]);
  };

  const integrations = [
    {
      name: 'Google Maps Platform',
      apis: ['Directions API', 'Distance Matrix', 'Real-time traffic'],
      dataPoints: 'Vehicle location, route optimization, ETA',
    },
    {
      name: 'HERE Maps',
      apis: ['Routing', 'Traffic Flow', 'Truck Routing'],
      dataPoints: 'Weight restrictions, hazmat routes',
    },
    {
      name: 'NOAA / NWS',
      apis: ['Weather API', 'Alerts API', 'Radar data'],
      dataPoints: 'Storm tracking, visibility, road conditions',
    },
    {
      name: 'OpenWeather',
      apis: ['Current Weather', 'Forecast API'],
      dataPoints: 'Temperature, wind, precipitation per location',
    },
    {
      name: 'Sentinel-2 & Landsat',
      apis: ['Copernicus Open Access Hub', 'USGS EarthExplorer'],
      dataPoints: 'Road surface conditions, flooding detection',
    },
    {
      name: 'WAZE',
      apis: ['Traffic Alerts', 'Incident Reports'],
      dataPoints: 'User-reported hazards, closures, delays',
    },
    {
      name: 'State DOT APIs',
      apis: ['Construction data', 'Road closure alerts'],
      dataPoints: 'Lane closures, detours, timeline',
    },
    {
      name: 'GasBuddy / Oil Price APIs',
      apis: ['Real-time fuel prices', 'Station inventory'],
      dataPoints: 'Cheapest fuel by route, station availability',
    },
    {
      name: 'Love\'s / Pilot APIs',
      apis: ['Parking availability', 'Amenity listings'],
      dataPoints: 'Available spots, showers, dining',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2A6B] to-[#1a1a1a] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-black">Satellite Maps & Visual Intelligence</h1>
          </div>
          <p className="text-xl text-gray-300">
            Every road condition, weather pattern, traffic jam, and parking spot — live from satellites and IoT feeds into your fleet map.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-blue-500/30 overflow-x-auto">
          {['overview', 'feeds', 'integrations', 'alerts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Map Layers */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-blue-400" />
                Live Map Layers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mapLayers.map((layer, i) => (
                  <div
                    key={i}
                    className="bg-gray-900/50 border border-blue-500/20 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-3xl mb-2">{layer.icon}</div>
                        <h3 className="text-lg font-bold">{layer.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{layer.source}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                        {layer.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-gray-500">Coverage:</span> {layer.coverage}
                      </p>
                      <p className="text-gray-300">
                        <span className="text-gray-500">Latency:</span> {layer.latency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Feeds Tab */}
        {activeTab === 'feeds' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="w-6 h-6 text-blue-400" />
              Real-Time Data Feeds
            </h2>
            {liveFeeds.map((feed, i) => (
              <div
                key={i}
                className="bg-gray-900/50 border border-blue-500/20 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold mb-4">{feed.feed}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">{feed.metric}</p>
                    <p className="text-xl font-bold text-blue-400">
                      {feed.current}
                    </p>
                  </div>
                  {feed.normal && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Normal</p>
                      <p className="font-bold">{feed.normal}</p>
                    </div>
                  )}
                  {feed.reason && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Reason</p>
                      <p className="font-bold">{feed.reason}</p>
                    </div>
                  )}
                  {feed.visibility && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Visibility</p>
                      <p className="font-bold">{feed.visibility}</p>
                    </div>
                  )}
                  {feed.alert && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Alert</p>
                      <p className="font-bold text-yellow-400">{feed.alert}</p>
                    </div>
                  )}
                  {feed.delay && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Delay</p>
                      <p className="font-bold text-orange-400">{feed.delay}</p>
                    </div>
                  )}
                  {feed.available && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Available</p>
                      <p className="font-bold text-green-400">
                        {feed.available}
                      </p>
                    </div>
                  )}
                  {feed.fuel && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Fuel</p>
                      <p className="font-bold">{feed.fuel}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Data Source Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((int, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 border border-blue-500/20 rounded-lg p-6"
                >
                  <h3 className="text-lg font-bold mb-3">{int.name}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">APIs</p>
                      <div className="flex flex-wrap gap-2">
                        {int.apis.map((api, j) => (
                          <span
                            key={j}
                            className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded"
                          >
                            {api}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data Points</p>
                      <p className="text-sm text-gray-300">{int.dataPoints}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Active Alerts & Recommendations
            </h2>
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`border rounded-lg p-6 ${
                    alert.severity === 'high'
                      ? 'bg-red-950/30 border-red-500/30'
                      : 'bg-yellow-950/30 border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        alert.severity === 'high'
                          ? 'bg-red-500/20'
                          : 'bg-yellow-500/20'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-5 h-5 ${
                          alert.severity === 'high'
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{alert.type}</h3>
                      <p className="text-gray-300 mb-3">{alert.message}</p>
                      <p
                        className={`text-sm font-semibold ${
                          alert.severity === 'high'
                            ? 'text-red-300'
                            : 'text-yellow-300'
                        }`}
                      >
                        → {alert.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map View Indicator */}
        <div className="mt-12 bg-gray-900/50 border border-blue-500/20 rounded-lg p-8">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold">Live Map Dashboard</h3>
          </div>
          <p className="text-gray-300 mb-6">
            Drivers and fleet managers see all eight map layers fused into one live view. Click any truck icon to see its current conditions: traffic speed, weather, nearest fuel/parking, road hazards, and ETA to destination with all variables calculated.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded p-4 border border-blue-500/10">
              <p className="text-sm text-gray-400 mb-2">For Drivers</p>
              <p className="font-semibold">Navigate safely with real-time conditions</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Weather alerts before you hit the storm</li>
                <li>• Cheapest fuel on your route</li>
                <li>• Safe parking with availability</li>
                <li>• Hazmat road restrictions</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded p-4 border border-blue-500/10">
              <p className="text-sm text-gray-400 mb-2">For Fleet Managers</p>
              <p className="font-semibold">Optimize operations across your entire fleet</p>
              <ul className="text-xs text-gray-400 mt-2 space-y-1">
                <li>• Real-time ETA accuracy (±5 minutes)</li>
                <li>• Automatic route rerouting on incidents</li>
                <li>• Predictive fuel consumption</li>
                <li>• Proactive weather/hazard alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
