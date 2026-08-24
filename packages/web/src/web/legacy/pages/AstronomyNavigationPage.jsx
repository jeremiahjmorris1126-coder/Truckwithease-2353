import React, { useState, useEffect } from 'react';
import { Star, Moon, AlertTriangle, Eye, Navigation2, BookOpen, Compass } from 'lucide-react';

const AstronomyNavigationPage = () => {
  const [activeTab, setActiveTab] = useState('navigation');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [driverLocation, setDriverLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [nightDrivingAlert, setNightDrivingAlert] = useState(false);
  const [constellationView, setConstellationView] = useState('ursa-major');
  const [skyBrightness, setSkyBrightness] = useState(0.3);

  // Major constellations visible from North America
  const constellations = {
    'ursa-major': {
      name: 'The Big Dipper (Ursa Major)',
      visibility: 'Year-round, visible all night',
      navigation: 'Points to North Star (Polaris) - for true north navigation',
      stars: 7,
      brightness: 0.9,
      season: 'Circumpolar',
    },
    'ursa-minor': {
      name: 'The Little Dipper (Ursa Minor)',
      visibility: 'Year-round, circumpolar',
      navigation: 'Contains Polaris - the exact north point',
      stars: 7,
      brightness: 0.7,
      season: 'Circumpolar',
    },
    'cassiopeia': {
      name: 'Cassiopeia (The Queen)',
      visibility: 'Year-round',
      navigation: 'Opposite the Big Dipper, across Polaris',
      stars: 5,
      brightness: 0.85,
      season: 'Circumpolar',
    },
    'orion': {
      name: 'Orion (The Hunter)',
      visibility: 'Winter (Dec-Mar), best Dec-Feb',
      navigation: 'Belt points to sunrise direction (East)',
      stars: 10,
      brightness: 1.0,
      season: 'Winter',
    },
    'leo': {
      name: 'Leo (The Lion)',
      visibility: 'Spring (Mar-May), best Mar-Apr',
      navigation: 'Bright Regulus marks East-West line',
      stars: 15,
      brightness: 0.95,
      season: 'Spring',
    },
    'scorpius': {
      name: 'Scorpius (The Scorpion)',
      visibility: 'Summer (Jun-Aug), best Jul',
      navigation: 'Red star Antares marks South direction',
      stars: 18,
      brightness: 0.9,
      season: 'Summer',
    },
  };

  // James Webb infrared constellation views (simulated high-resolution data)
  const jamesWebbViews = {
    'ursa-major': {
      description: 'Reveals hidden star birth regions and nebulae within the Big Dipper',
      temperature: '6000-50000 K',
      discovery: '3 new stellar nurseries detected',
      imageDesc: 'Infrared heat signature showing stellar formation',
    },
    'orion': {
      description: 'Orion Nebula revealed in stunning detail - newborn stars and dust clouds',
      temperature: '7000-60000 K',
      discovery: 'Over 1000 young stellar objects catalogued',
      imageDesc: 'Deep infrared revealing star birth factory',
    },
    'leo': {
      description: 'Distant galaxies revealed behind Leo constellation',
      temperature: '3000-40000 K',
      discovery: 'Hubble Deep Field regions visible',
      imageDesc: 'Infrared penetrating dust to reveal ancient light',
    },
  };

  // Calculate twilight times based on location and season
  const calculateTwilightTimes = () => {
    const now = new Date();
    const month = now.getMonth();
    
    // Simplified twilight calculation (varies by latitude)
    let sunrise, sunset;
    if (month >= 2 && month <= 9) { // Spring/Summer/Early Fall
      sunrise = new Date(now);
      sunrise.setHours(5, 30);
      sunset = new Date(now);
      sunset.setHours(20, 30);
    } else { // Fall/Winter
      sunrise = new Date(now);
      sunrise.setHours(7, 0);
      sunset = new Date(now);
      sunset.setHours(17, 30);
    }
    
    return { sunrise, sunset };
  };

  const { sunrise, sunset } = calculateTwilightTimes();
  const isNight = currentTime < sunrise || currentTime > sunset;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setNightDrivingAlert(isNight);
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [isNight]);

  const constellation = constellations[constellationView];
  const jamesWeb = jamesWebbViews[constellationView] || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-white p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Star className="w-8 h-8 text-yellow-300" />
          <h1 className="text-4xl font-bold">Celestial Navigation & Night Driving Intelligence</h1>
        </div>
        <p className="text-slate-300 text-lg">Navigate by the stars. Stay safe in the dark.</p>
      </div>

      {/* Night Driving Alert */}
      {nightDrivingAlert && (
        <div className="max-w-6xl mx-auto mb-6 bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/50 rounded-lg p-4 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-orange-300 mb-1">Night Driving Active</h3>
            <p className="text-slate-300 text-sm">Sunrise: {sunrise.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} | Sunset: {sunset.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-slate-400 text-sm mt-1">Celestial navigation aids and fatigue alerts are now active.</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex gap-2 border-b border-slate-700">
        {[
          { id: 'navigation', label: 'Navigation by Stars', icon: Navigation2 },
          { id: 'alerts', label: 'Night Driving Alerts', icon: AlertTriangle },
          { id: 'constellations', label: 'Constellation Guide', icon: Compass },
          { id: 'james-webb', label: 'James Webb Views', icon: Eye },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {/* Navigation by Stars */}
        {activeTab === 'navigation' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Compass className="w-6 h-6 text-cyan-400" />
                Navigate Using Constellations
              </h2>
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="font-bold text-cyan-300 mb-2">How It Works</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>✦ Find Polaris (North Star) using the Big Dipper or Cassiopeia</li>
                    <li>✦ Polaris is directly above true north - never moves</li>
                    <li>✦ Use constellations to orient yourself when GPS unavailable</li>
                    <li>✦ Backup navigation for remote highways and truck stops</li>
                  </ul>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="font-bold text-cyan-300 mb-2">Current Night Sky</h3>
                  <p className="text-sm text-slate-300 mb-3">{constellation.visibility}</p>
                  <p className="text-sm text-slate-400">{constellation.navigation}</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-lg p-4 border border-yellow-700/30">
                  <h3 className="font-bold text-yellow-300 mb-2">Pro Tip</h3>
                  <p className="text-sm text-slate-300">Memorize the Big Dipper and Polaris. These two help you find true north anywhere in the northern hemisphere, any time of year.</p>
                </div>
              </div>
            </div>

            {/* Star Map Visualization */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-cyan-300">Interactive Sky Map</h3>
              <div className="relative w-full aspect-square bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-slate-700 overflow-hidden">
                {/* Simulated star field */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Big Dipper stars */}
                    {constellationView === 'ursa-major' && (
                      <>
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '20%', left: '30%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '25%', left: '40%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '30%', left: '50%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '35%', left: '60%'}} />
                        <div className="absolute w-2 h-2 bg-yellow-200 rounded-full" style={{top: '50%', left: '50%'}} />
                        <div className="absolute w-2 h-2 bg-yellow-200 rounded-full" style={{top: '55%', left: '55%'}} />
                        <div className="absolute w-2 h-2 bg-yellow-200 rounded-full" style={{top: '60%', left: '60%'}} />
                        {/* Connecting lines */}
                        <svg className="absolute inset-0 w-full h-full" style={{opacity: 0.5}}>
                          <line x1="30%" y1="20%" x2="40%" y2="25%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <line x1="40%" y1="25%" x2="50%" y2="30%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <line x1="50%" y1="30%" x2="60%" y2="35%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <line x1="50%" y1="30%" x2="50%" y2="50%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <line x1="50%" y1="50%" x2="55%" y2="55%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                          <line x1="55%" y1="55%" x2="60%" y2="60%" stroke="rgba(253, 224, 71, 0.3)" strokeWidth="1" />
                        </svg>
                      </>
                    )}

                    {/* Orion stars */}
                    {constellationView === 'orion' && (
                      <>
                        <div className="absolute w-3 h-3 bg-red-400 rounded-full" style={{top: '10%', left: '35%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '25%', left: '30%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '30%', left: '50%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '35%', left: '70%'}} />
                        <div className="absolute w-3 h-3 bg-orange-400 rounded-full" style={{top: '50%', left: '40%'}} />
                        <div className="absolute w-3 h-3 bg-orange-400 rounded-full" style={{top: '50%', left: '50%'}} />
                        <div className="absolute w-3 h-3 bg-orange-400 rounded-full" style={{top: '50%', left: '60%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '70%', left: '35%'}} />
                        <div className="absolute w-3 h-3 bg-yellow-300 rounded-full" style={{top: '75%', left: '65%'}} />
                      </>
                    )}

                    {/* Default stars */}
                    {!['ursa-major', 'orion'].includes(constellationView) && (
                      <>
                        {[...Array(15)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute bg-yellow-200 rounded-full"
                            style={{
                              width: Math.random() > 0.7 ? '3px' : '2px',
                              height: Math.random() > 0.7 ? '3px' : '2px',
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              opacity: Math.random() * 0.7 + 0.3,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-slate-900/80 to-transparent rounded p-2 text-xs text-slate-400">
                  {constellation.name} • {constellation.stars} bright stars • Brightness {(constellation.brightness * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Night Driving Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
              Night Driving Safety Alerts
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-red-950/30 border border-red-700/50 rounded-lg p-6">
                <h3 className="font-bold text-red-300 mb-3 flex items-center gap-2">
                  <Moon className="w-5 h-5" />
                  Fatigue Risk
                </h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Active at: 2 AM - 6 AM, 10 PM - Midnight</p>
                  <p>• Risk Level: CRITICAL during peak fatigue hours</p>
                  <p>• Recommendation: Pull over for 20-min power nap</p>
                  <p>• Next safe rest area: 14 miles ahead</p>
                </div>
              </div>

              <div className="bg-yellow-950/30 border border-yellow-700/50 rounded-lg p-6">
                <h3 className="font-bold text-yellow-300 mb-3">Road Visibility</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Current: 150 feet (fog/low light)</p>
                  <p>• Headlight Brightness: Adjust for clarity</p>
                  <p>• Wildlife Alert: High activity 10 PM - 4 AM</p>
                  <p>• Recommendation: Reduce speed 10% on rural routes</p>
                </div>
              </div>

              <div className="bg-blue-950/30 border border-blue-700/50 rounded-lg p-6">
                <h3 className="font-bold text-blue-300 mb-3">Weather Impact</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Dew Point: High (moisture on windshield)</p>
                  <p>• Temperature: Dropping (potential black ice)</p>
                  <p>• Wind: Gusts 12-18 mph (affects high-profile loads)</p>
                  <p>• Recommendation: Extra caution on bridges</p>
                </div>
              </div>

              <div className="bg-purple-950/30 border border-purple-700/50 rounded-lg p-6">
                <h3 className="font-bold text-purple-300 mb-3">HOS Compliance</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• Hours Remaining: 6 hours 23 minutes</p>
                  <p>• Next mandatory break: 1 hour 37 minutes</p>
                  <p>• Restart window: Expires tomorrow 4 AM</p>
                  <p>• Recommendation: Plan stop within 45 min</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg p-6 border border-slate-700">
              <h3 className="font-bold text-cyan-300 mb-4">Fatigue Prevention Strategy</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
                <div className="flex gap-3">
                  <span className="text-cyan-400 font-bold min-w-8">1.</span>
                  <p><strong>Bright light:</strong> Keep cabin well-lit, avoid blue light before sleep</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-cyan-400 font-bold min-w-8">2.</span>
                  <p><strong>Movement:</strong> 20-min rest every 2 hours (walk, stretch, breathe)</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-cyan-400 font-bold min-w-8">3.</span>
                  <p><strong>Sleep:</strong> 7-8 hrs daily; power naps 20-30 min only</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Constellation Guide */}
        {activeTab === 'constellations' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="w-6 h-6 text-cyan-400" />
              Constellation Library
            </h2>

            <div className="grid gap-4">
              {Object.entries(constellations).map(([key, const_data]) => (
                <div
                  key={key}
                  onClick={() => setConstellationView(key)}
                  className={`p-6 rounded-lg border-2 transition cursor-pointer ${
                    constellationView === key
                      ? 'bg-slate-800/50 border-cyan-400 shadow-lg shadow-cyan-400/20'
                      : 'bg-slate-800/20 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-cyan-300">{const_data.name}</h3>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded">{const_data.season}</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{const_data.visibility}</p>
                  <p className="text-sm text-yellow-200 mb-3">🧭 Navigation: {const_data.navigation}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>⭐ {const_data.stars} major stars</span>
                    <span>✨ Brightness: {(const_data.brightness * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* James Webb Views */}
        {activeTab === 'james-webb' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-400" />
              James Webb Space Telescope Views
            </h2>

            <p className="text-slate-400 text-lg">See what humanity's most powerful telescope reveals about the constellations you navigate by.</p>

            <div className="space-y-6">
              {Object.entries(jamesWebbViews).map(([key, view]) => (
                <div
                  key={key}
                  className="bg-gradient-to-br from-purple-950/30 to-slate-900/30 rounded-lg border border-purple-700/30 p-8 overflow-hidden relative"
                >
                  {/* Infrared glow effect */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                  <h3 className="text-xl font-bold text-purple-300 mb-4 relative z-10">{constellations[key]?.name}</h3>

                  <div className="grid md:grid-cols-2 gap-8 relative z-10">
                    <div>
                      <h4 className="font-bold text-purple-300 mb-3">Infrared View</h4>
                      <div className="w-full h-64 bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 rounded-lg border border-purple-600/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🔭</div>
                          <p className="text-xs text-slate-300">{view.imageDesc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-purple-300 mb-2">Discovery</h4>
                        <p className="text-slate-300">{view.discovery}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-purple-300 mb-2">What James Webb Revealed</h4>
                        <p className="text-slate-300">{view.description}</p>
                      </div>

                      <div>
                        <h4 className="font-bold text-purple-300 mb-2">Stellar Temperature Range</h4>
                        <p className="text-slate-300">{view.temperature}</p>
                      </div>

                      <div className="bg-purple-900/30 rounded p-3 border border-purple-700/30">
                        <p className="text-xs text-purple-200">
                          <strong>Did you know?</strong> James Webb sees in infrared, piercing through dust clouds that hide newborn stars. It's like seeing the universe through heat-vision glasses.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-lg p-6 border border-slate-700">
              <h3 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Fun Fact
              </h3>
              <p className="text-slate-400 text-sm">
                The same constellations you navigate by at night contain some of the most dramatic stellar nurseries in our galaxy. Stars are being born right now in Orion's nebula, just like they were when ancient astronomers first mapped these patterns thousands of years ago.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstronomyNavigationPage;
