import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { Upload, Save, Eye, Grid3x3, Palette, LogOut } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function FleetDashboardCustomizer() {
  const [fleetEmail, setFleetEmail] = useState('');
  const [dashboardSettings, setDashboardSettings] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [brandColor, setBrandColor] = useState(NAVY);
  const [accentColor, setAccentColor] = useState(ORANGE);
  const [widgets, setWidgets] = useState([
    { id: 'quick-stats', name: 'Quick Stats', enabled: true, position: 1 },
    { id: 'fleet-map', name: 'Live Fleet Map', enabled: true, position: 2 },
    { id: 'compliance', name: 'Compliance Status', enabled: true, position: 3 },
    { id: 'profitability', name: 'Profitability', enabled: true, position: 4 },
    { id: 'alerts', name: 'Active Alerts', enabled: true, position: 5 },
    { id: 'drivers', name: 'Driver Performance', enabled: true, position: 6 },
  ]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    const email = sessionStorage.getItem('signup_email');
    if (email) {
      setFleetEmail(email);
      loadDashboardSettings(email);
    }
  }, []);

  async function loadDashboardSettings(email) {
    try {
      const records = await pb.collection('dashboard_settings').getList(1, 1, {
        filter: `fleet_email = "${email}"`,
      });
      if (records.items.length > 0) {
        const settings = records.items[0];
        setDashboardSettings(settings);
        setLogoUrl(settings.logo_url || '');
        setBrandColor(settings.brand_color || NAVY);
        setAccentColor(settings.accent_color || ORANGE);
        setWidgets(settings.widgets || widgets);
      }
    } catch (e) {
      console.log('No dashboard settings found yet');
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function toggleWidget(id) {
    setWidgets(widgets.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  }

  function reorderWidget(id, direction) {
    const index = widgets.findIndex(w => w.id === id);
    if (direction === 'up' && index > 0) {
      const newWidgets = [...widgets];
      [newWidgets[index].position, newWidgets[index - 1].position] = [newWidgets[index - 1].position, newWidgets[index].position];
      newWidgets.sort((a, b) => a.position - b.position);
      setWidgets(newWidgets);
    } else if (direction === 'down' && index < widgets.length - 1) {
      const newWidgets = [...widgets];
      [newWidgets[index].position, newWidgets[index + 1].position] = [newWidgets[index + 1].position, newWidgets[index].position];
      newWidgets.sort((a, b) => a.position - b.position);
      setWidgets(newWidgets);
    }
  }

  async function saveDashboardSettings() {
    setLoading(true);
    try {
      const settings = {
        fleet_email: fleetEmail,
        logo_url: logoUrl,
        brand_color: brandColor,
        accent_color: accentColor,
        widgets: widgets,
      };

      if (dashboardSettings?.id) {
        await pb.collection('dashboard_settings').update(dashboardSettings.id, settings);
      } else {
        await pb.collection('dashboard_settings').create(settings);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: DARK, minHeight: '100vh', color: '#fff', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div style={{ background: NAVY, padding: '32px 24px', borderBottom: `2px solid ${AMBER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Fleet Dashboard Customizer</h1>
          <p style={{ fontSize: '0.95rem', color: '#a0b4d8' }}>Upload your logo, choose brand colors, and arrange your dashboard widgets exactly how you want them.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
          {/* Left Column: Settings */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24, color: AMBER }}>Branding & Settings</h2>

            {/* Logo Upload */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#e0e0e0' }}>
                Fleet Logo
              </label>
              <div style={{
                border: `2px dashed ${AMBER}`,
                borderRadius: 12,
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 180, 0, 0.05)',
                transition: 'all 0.2s'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  id="logo-input"
                />
                <label htmlFor="logo-input" style={{ cursor: 'pointer', display: 'block' }}>
                  <Upload size={32} style={{ margin: '0 auto 8px', color: AMBER }} />
                  <p style={{ margin: 0, color: '#a0b4d8', fontSize: '0.9rem' }}>Click to upload or drag and drop</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>PNG, JPG, GIF up to 5MB</p>
                </label>
              </div>
              {logoUrl && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(255, 180, 0, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                  <img src={logoUrl} alt="Fleet Logo" style={{ maxHeight: 80, maxWidth: '100%' }} />
                </div>
              )}
            </div>

            {/* Brand Color */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#e0e0e0' }}>
                Primary Brand Color
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={{ width: 60, height: 60, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#0B2A6B"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: NAVY2,
                    border: `1px solid rgba(255, 180, 0, 0.3)`,
                    borderRadius: 8,
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Accent Color */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#e0e0e0' }}>
                Accent Color
              </label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ width: 60, height: 60, border: 'none', borderRadius: 8, cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#FF6B00"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: NAVY2,
                    border: `1px solid rgba(255, 180, 0, 0.3)`,
                    borderRadius: 8,
                    color: '#fff',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveDashboardSettings}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                opacity: loading ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>

            {saved && (
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: GREEN,
                color: '#fff',
                borderRadius: 8,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                ✓ Settings saved successfully!
              </div>
            )}
          </div>

          {/* Right Column: Widget Management */}
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 24, color: AMBER }}>Dashboard Widgets</h2>
            <p style={{ color: '#a0b4d8', marginBottom: 20, fontSize: '0.9rem' }}>Enable/disable widgets and drag to reorder your dashboard.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {widgets.map((widget, index) => (
                <div
                  key={widget.id}
                  style={{
                    background: NAVY2,
                    border: `1px solid rgba(255, 180, 0, 0.2)`,
                    borderRadius: 8,
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: widget.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Grid3x3 size={18} style={{ color: AMBER }} />
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, color: '#fff' }}>{widget.name}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#666' }}>Position {widget.position}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => reorderWidget(widget.id, 'up')}
                      disabled={index === 0}
                      style={{
                        padding: '6px 12px',
                        background: index === 0 ? '#444' : NAVY,
                        color: '#fff',
                        border: `1px solid ${AMBER}`,
                        borderRadius: 4,
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => reorderWidget(widget.id, 'down')}
                      disabled={index === widgets.length - 1}
                      style={{
                        padding: '6px 12px',
                        background: index === widgets.length - 1 ? '#444' : NAVY,
                        color: '#fff',
                        border: `1px solid ${AMBER}`,
                        borderRadius: 4,
                        cursor: index === widgets.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ↓
                    </button>

                    <button
                      onClick={() => toggleWidget(widget.id)}
                      style={{
                        padding: '6px 12px',
                        background: widget.enabled ? GREEN : RED,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {widget.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button
            onClick={() => setPreview(!preview)}
            style={{
              padding: '12px 32px',
              background: AMBER,
              color: '#000',
              border: 'none',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s'
            }}
          >
            <Eye size={18} />
            {preview ? 'Hide Preview' : 'Preview Dashboard'}
          </button>
        </div>

        {/* Live Preview */}
        {preview && (
          <div style={{
            marginTop: 40,
            background: NAVY2,
            border: `2px solid ${AMBER}`,
            borderRadius: 12,
            padding: 24,
            minHeight: 400
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 16, paddingBottom: 16, borderBottom: `1px solid rgba(255, 180, 0, 0.2)` }}>
              {logoUrl && <img src={logoUrl} alt="Fleet Logo" style={{ height: 50, maxWidth: 150 }} />}
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: brandColor }}>Fleet Dashboard Preview</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {widgets.filter(w => w.enabled).map(widget => (
                <div
                  key={widget.id}
                  style={{
                    background: NAVY,
                    borderLeft: `4px solid ${accentColor}`,
                    borderRadius: 8,
                    padding: 20,
                    minHeight: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0b4d8', marginBottom: 8 }}>Position {widget.position}</p>
                    <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{widget.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
