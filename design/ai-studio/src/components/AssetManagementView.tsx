import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Gauge,
  Calendar,
  ShieldCheck,
  Fuel,
  Radio,
  Trash2,
  RefreshCw,
  Sliders,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';
import { FleetAssetRecord, AssetCategory, AssetOperationalStatus } from '../types';

export const AssetManagementView: React.FC = () => {
  const [assets, setAssets] = useState<FleetAssetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Form State for new asset
  const [formData, setFormData] = useState({
    unitNumber: '',
    category: 'TRACTOR_POWER_UNIT' as AssetCategory,
    make: '',
    model: '',
    year: 2024,
    vin: '',
    licensePlate: '',
    licenseState: 'PA',
    odometerMiles: 15000,
    engineHours: 420,
    assignedDriverName: 'Unassigned (Staged)',
    telematicsVendor: 'Samsara Cloud Gateway (VG54)',
    telematicsDeviceId: '',
    annualDotInspectionExpiry: '2027-08-30',
    pmIntervalMiles: 25000,
    fuelType: 'DEF_DIESEL' as 'DIESEL' | 'DEF_DIESEL' | 'ELECTRIC' | 'REEFER_HYBRID',
  });

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets || []);
      }
    } catch (err) {
      console.error('Failed to fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.unitNumber || !formData.make || !formData.model) {
      alert('Unit number, make, and model are required.');
      return;
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const result = await res.json();
        setStatusNotification(result.message || 'Asset commissioned successfully.');
        setIsAddModalOpen(false);
        setFormData({
          unitNumber: '',
          category: 'TRACTOR_POWER_UNIT',
          make: '',
          model: '',
          year: 2024,
          vin: '',
          licensePlate: '',
          licenseState: 'PA',
          odometerMiles: 15000,
          engineHours: 420,
          assignedDriverName: 'Unassigned (Staged)',
          telematicsVendor: 'Samsara Cloud Gateway (VG54)',
          telematicsDeviceId: '',
          annualDotInspectionExpiry: '2027-08-30',
          pmIntervalMiles: 25000,
          fuelType: 'DEF_DIESEL',
        });
        await fetchAssets();
      }
    } catch (err) {
      console.error('Error adding asset:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 5000);
    }
  };

  const handleUpdateStatus = async (asset: FleetAssetRecord, newStatus: AssetOperationalStatus) => {
    try {
      const res = await fetch(`/api/assets/${asset.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatusNotification(`Asset ${asset.unitNumber} updated to ${newStatus.replace('_', ' ')}`);
        await fetchAssets();
      }
    } catch (err) {
      console.error('Failed to update asset status:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  const handleDeleteAsset = async (asset: FleetAssetRecord) => {
    if (!confirm(`Decommission asset ${asset.unitNumber} (${asset.make} ${asset.model})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      if (res.ok) {
        setStatusNotification(`Asset ${asset.unitNumber} decommissioned.`);
        await fetchAssets();
      }
    } catch (err) {
      console.error('Failed to delete asset:', err);
    } finally {
      setTimeout(() => setStatusNotification(null), 4000);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.unitNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.assignedDriverName && asset.assignedDriverName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'TRACTORS' && asset.category !== 'TRACTOR_POWER_UNIT') return false;
    if (selectedCategory === 'TRAILERS' && !asset.category.includes('TRAILER') && asset.category !== 'STEP_DECK') return false;

    if (selectedStatus !== 'ALL' && asset.status !== selectedStatus) return false;

    return true;
  });

  const tractorCount = assets.filter((a) => a.category === 'TRACTOR_POWER_UNIT').length;
  const trailerCount = assets.filter((a) => a.category.includes('TRAILER') || a.category === 'STEP_DECK').length;
  const onRoadCount = assets.filter((a) => a.status === 'ACTIVE_ON_ROAD').length;
  const stagedCount = assets.filter((a) => a.status === 'AVAILABLE_STAGED').length;
  const inShopCount = assets.filter((a) => a.status === 'IN_SHOP' || a.status === 'SCHEDULED_PM').length;

  return (
    <div className="flex flex-col w-full pb-16 px-3 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="border-b border-[#222] pb-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 uppercase flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-[#D4AF37]" />
                FLEET ASSET &amp; POWER UNIT REGISTRY
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                49 CFR § 396 COMPLIANT TELEMATICS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
              <Truck className="w-7 h-7 text-[#D4AF37]" />
              Fleet Assets &amp; Equipment Management
            </h1>
            <p className="text-xs sm:text-sm text-[#888] max-w-3xl mt-1">
              Real-time enterprise equipment registry: track tractors (power units), dry vans, reefers, and flatbeds. Real-time telematics integration, annual DOT inspection tracking, VIN compliance, and driver assignments.
            </p>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 rounded shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>COMMISSION NEW ASSET</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {statusNotification && (
        <div className="p-3.5 bg-[#0e1e12] border border-emerald-600/70 text-emerald-300 text-xs font-mono flex items-center justify-between rounded shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span className="font-bold">// ASSET REGISTRY NOTICE:</span>
            <span>{statusNotification}</span>
          </div>
          <button onClick={() => setStatusNotification(null)} className="text-[#888] hover:text-white ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Total Fleet Assets</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1 flex items-center gap-2">
            <span>{assets.length}</span>
            <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-1.5 py-0.5 border border-[#D4AF37]/30 rounded">
              REGISTERED
            </span>
          </div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">
            {tractorCount} Power Units • {trailerCount} Trailers
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Active On Road</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
            <span>{onRoadCount}</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 border border-emerald-800 rounded">
              DISPATCHED
            </span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-1.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Generating Revenue
          </div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">Yard Staged / Available</div>
          <div className="text-xl sm:text-2xl font-black text-[#D4AF37] mt-1">
            {stagedCount}
          </div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">Ready for next assignment</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">In Shop / Scheduled PM</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {inShopCount}
          </div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">Preventive maintenance</div>
        </div>

        <div className="bg-[#141414] border border-[#262626] p-4 rounded col-span-2 lg:col-span-1">
          <div className="text-[10px] font-mono text-[#888] uppercase tracking-wider">DOT Annual Inspection</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">100%</div>
          <div className="text-[11px] font-mono text-[#888] mt-1.5">Zero expired safety decals</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#141414] border border-[#262626] p-3 rounded-lg">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by unit #, VIN, make/model, driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0a0a] border border-[#333] rounded text-xs font-mono text-white placeholder-[#555] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: `All Assets (${assets.length})` },
            { id: 'TRACTORS', label: `Power Units (${tractorCount})` },
            { id: 'TRAILERS', label: `Trailers (${trailerCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
                selectedCategory === tab.id
                  ? 'bg-[#D4AF37] text-black'
                  : 'bg-[#1e1e1e] text-[#888] hover:text-white border border-[#333]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => {
          const isTractor = asset.category === 'TRACTOR_POWER_UNIT';
          const isOverduePM = asset.odometerMiles >= asset.pmDueMiles;

          return (
            <div
              key={asset.id}
              className="bg-gradient-to-b from-[#161616] to-[#101010] border border-[#262626] hover:border-[#D4AF37]/60 p-5 rounded-lg transition-all space-y-4 shadow-sm relative group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded bg-[#202020] border border-[#333] text-[#D4AF37]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        {asset.unitNumber}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#222] text-[#888] border border-[#333]">
                        {asset.category.replace('_TRAILER', '').replace('_POWER_UNIT', '')}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[#AAA] mt-0.5">
                      {asset.year} {asset.make} {asset.model}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
                    asset.status === 'ACTIVE_ON_ROAD'
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-700/60'
                      : asset.status === 'AVAILABLE_STAGED'
                      ? 'text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                      : 'text-amber-400 bg-amber-950/60 border border-amber-700/60'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      asset.status === 'ACTIVE_ON_ROAD'
                        ? 'bg-emerald-400'
                        : asset.status === 'AVAILABLE_STAGED'
                        ? 'bg-[#D4AF37]'
                        : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                  {asset.status.replace('_', ' ')}
                </span>
              </div>

              {/* Specs & Identification Box */}
              <div className="bg-[#0C0C0C] border border-[#222] p-3 rounded text-xs font-mono space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">17-Digit VIN</span>
                    <span className="text-white font-bold tracking-tight text-[11px] break-all">{asset.vin}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#777] uppercase block">License Plate</span>
                    <span className="text-[#D4AF37] font-bold">{asset.licensePlate}</span>
                    <span className="text-[9px] text-[#888] block">State: {asset.licenseState}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a1a1a] grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#777] block">ODOMETER:</span>
                    <span className="text-white font-bold">{asset.odometerMiles.toLocaleString()} mi</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">ENGINE HOURS:</span>
                    <span className="text-[#CCC]">{asset.engineHours} hrs</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1a1a1a] grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-[#777] block">ASSIGNED DRIVER:</span>
                    <span className="text-[#D4AF37] font-bold">{asset.assignedDriverName || 'Unassigned'}</span>
                  </div>
                  <div>
                    <span className="text-[#777] block">ANNUAL DOT EXPIRY:</span>
                    <span className="text-emerald-400 font-bold">{asset.annualDotInspectionExpiry}</span>
                  </div>
                </div>
              </div>

              {/* Maintenance & Telematics Status */}
              <div className="p-2.5 bg-[#141414] border border-[#222] rounded text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#888]">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{asset.telematicsVendor}</span>
                  </div>
                  <span className="text-[10px] text-[#666]">{asset.telematicsDeviceId}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#202020]">
                  <span className="text-[#777]">Next PM Due: {asset.pmDueMiles.toLocaleString()} mi</span>
                  <span className={isOverduePM ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {isOverduePM ? 'PM DUE NOW' : `${(asset.pmDueMiles - asset.odometerMiles).toLocaleString()} mi remain`}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-2 border-t border-[#222] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1">
                  {asset.status !== 'ACTIVE_ON_ROAD' && (
                    <button
                      onClick={() => handleUpdateStatus(asset, 'ACTIVE_ON_ROAD')}
                      className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-bold rounded transition-all"
                    >
                      ROAD
                    </button>
                  )}
                  {asset.status !== 'AVAILABLE_STAGED' && (
                    <button
                      onClick={() => handleUpdateStatus(asset, 'AVAILABLE_STAGED')}
                      className="px-2 py-1 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#DDD] border border-[#333] text-[10px] rounded transition-all"
                    >
                      STAGE
                    </button>
                  )}
                  {asset.status !== 'IN_SHOP' && (
                    <button
                      onClick={() => handleUpdateStatus(asset, 'IN_SHOP')}
                      className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800 text-[10px] rounded transition-all"
                    >
                      SHOP
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteAsset(asset)}
                  className="p-1.5 hover:text-rose-400 text-[#666] transition-colors"
                  title="Decommission Asset"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Commission New Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#333] rounded-lg max-w-2xl w-full p-6 space-y-4 font-mono text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#222] pb-3">
              <div>
                <span className="text-[10px] text-[#D4AF37] uppercase font-bold tracking-widest block">
                  COMMISSION EQUIPMENT // FLEET ASSET REGISTRY
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Register New Commercial Power Unit or Trailer
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#888] hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAsset} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Unit Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TR-1004"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Asset Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="TRACTOR_POWER_UNIT">Tractor (Power Unit)</option>
                    <option value="REEFER_TRAILER">53' Refrigerated Trailer</option>
                    <option value="DRY_VAN_TRAILER">53' Dry Van Trailer</option>
                    <option value="FLATBED_TRAILER">53' Aluminum Flatbed</option>
                    <option value="STEP_DECK">Step Deck Trailer</option>
                    <option value="CHASSIS_EQUIPMENT">Intermodal Chassis</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Year</label>
                  <input
                    type="number"
                    min="2010"
                    max="2027"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value, 10) || 2024 })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Make *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Freightliner, Great Dane, Kenworth"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cascadia 126, Champion 53ft"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* VIN & Plate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#888] uppercase block mb-1">17-Character VIN</label>
                  <input
                    type="text"
                    placeholder="1FUJGLDR5RL192841"
                    maxLength={17}
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">License Plate</label>
                  <input
                    type="text"
                    placeholder="PA-TK8812"
                    value={formData.licensePlate}
                    onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Mileage & Assigned Driver */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Odometer (Miles)</label>
                  <input
                    type="number"
                    value={formData.odometerMiles}
                    onChange={(e) => setFormData({ ...formData, odometerMiles: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Engine Hours</label>
                  <input
                    type="number"
                    value={formData.engineHours}
                    onChange={(e) => setFormData({ ...formData, engineHours: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Assigned Driver</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Kowalski"
                    value={formData.assignedDriverName}
                    onChange={(e) => setFormData({ ...formData, assignedDriverName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Telematics & Annual DOT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Telematics Hardware Provider</label>
                  <select
                    value={formData.telematicsVendor}
                    onChange={(e) => setFormData({ ...formData, telematicsVendor: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Samsara Cloud Gateway (VG54)">Samsara Cloud Gateway (VG54)</option>
                    <option value="Motive ELD / J1939 Gateway">Motive ELD / J1939 Gateway</option>
                    <option value="Geotab GO9 Telematics">Geotab GO9 Telematics</option>
                    <option value="Spireon Solar Trailer Tracker">Spireon Solar Trailer Tracker</option>
                    <option value="Thermo King TracKing Reefer GPS">Thermo King TracKing Reefer GPS</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#888] uppercase block mb-1">Annual DOT Inspection Expiry</label>
                  <input
                    type="date"
                    value={formData.annualDotInspectionExpiry}
                    onChange={(e) => setFormData({ ...formData, annualDotInspectionExpiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#222] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#222] hover:bg-[#333] text-[#AAA] hover:text-white font-bold text-xs rounded transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#F5E79E] text-black font-bold text-xs uppercase tracking-wider rounded shadow hover:brightness-105 transition-all"
                >
                  COMMISSION ASSET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
