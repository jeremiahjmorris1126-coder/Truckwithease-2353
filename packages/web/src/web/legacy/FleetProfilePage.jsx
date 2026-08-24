import React, { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import { Users, Briefcase, MapPin, Phone, Mail, TrendingUp, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const pb = new PocketBase();

const NAVY = '#0B2A6B';
const NAVY2 = '#081E4D';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';

export default function FleetProfilePage() {
  const [fleetData, setFleetData] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fleetName: '',
    companySize: '',
    operatingStates: '',
    specialization: '', // tanker, flatbed, reefer, hazmat, general
    yearsInBusiness: '',
    avgFleetSize: '',
    primaryContact: '',
    contactEmail: '',
    contactPhone: '',
    maintenanceRating: '', // 1-10
    safetyRating: '', // 1-10
    linkedinProfile: '',
    companyWebsite: '',
    customNeeds: '',
  });

  useEffect(() => {
    // Load checkout data if coming from signup
    const checkoutData = sessionStorage.getItem('checkout_data');
    if (checkoutData) {
      try {
        const data = JSON.parse(checkoutData);
        setFormData(prev => ({
          ...prev,
          primaryContact: data.name || '',
          contactEmail: data.email || '',
          contactPhone: data.phone || '',
        }));
      } catch (e) {
        console.log('Error parsing checkout data');
      }
    }

    // Try to load existing fleet profile
    const email = sessionStorage.getItem('signup_email');
    if (email) {
      loadFleetProfile(email);
    }
  }, []);

  async function loadFleetProfile(email) {
    try {
      const records = await pb.collection('fleet_profiles').getList(1, 1, {
        filter: `contact_email = "${email}"`,
      });
      if (records.items.length > 0) {
        setFleetData(records.items[0]);
        populateForm(records.items[0]);
      }
    } catch (e) {
      // Profile doesn't exist yet
    }
  }

  function populateForm(data) {
    setFormData({
      fleetName: data.fleet_name || '',
      companySize: data.company_size || '',
      operatingStates: data.operating_states || '',
      specialization: data.specialization || '',
      yearsInBusiness: data.years_in_business || '',
      avgFleetSize: data.avg_fleet_size || '',
      primaryContact: data.primary_contact || '',
      contactEmail: data.contact_email || '',
      contactPhone: data.contact_phone || '',
      maintenanceRating: data.maintenance_rating || '',
      safetyRating: data.safety_rating || '',
      linkedinProfile: data.linkedin_profile || '',
      companyWebsite: data.company_website || '',
      customNeeds: data.custom_needs || '',
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setError('');
    setLoading(true);

    try {
      const payload = {
        fleet_name: formData.fleetName,
        company_size: formData.companySize,
        operating_states: formData.operatingStates,
        specialization: formData.specialization,
        years_in_business: parseInt(formData.yearsInBusiness) || 0,
        avg_fleet_size: parseInt(formData.avgFleetSize) || 0,
        primary_contact: formData.primaryContact,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        maintenance_rating: parseInt(formData.maintenanceRating) || 0,
        safety_rating: parseInt(formData.safetyRating) || 0,
        linkedin_profile: formData.linkedinProfile,
        company_website: formData.companyWebsite,
        custom_needs: formData.customNeeds,
      };

      if (fleetData?.id) {
        // Update existing
        const updated = await pb.collection('fleet_profiles').update(fleetData.id, payload);
        setFleetData(updated);
      } else {
        // Create new
        const created = await pb.collection('fleet_profiles').create(payload);
        setFleetData(created);
      }

      // Mark onboarding as complete
      sessionStorage.setItem('onboarding_completed', 'true');
      setStep(2);
    } catch (e) {
      setError(e.message || 'Failed to save fleet profile');
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    // Clear onboarding session data
    sessionStorage.removeItem('checkout_data');
    sessionStorage.removeItem('signup_email');
    sessionStorage.removeItem('onboarding_shown');
    sessionStorage.removeItem('subscription_id');
    
    // Redirect to main app
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ color: NAVY }}>
            Fleet Profile & Onboarding
          </h1>
          <p className="text-slate-600">Build a seamless transition into your Traxes account</p>
        </div>

        {step === 1 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 border-t-4" style={{ borderTopColor: ORANGE }}>
            <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: NAVY }}>
              Tell Us About Your Fleet
            </h2>
            <p className="text-slate-600 text-center mb-8">
              We'll use this information to personalize your experience and ensure you're set up for success from day one.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Fleet Info */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Fleet Name</label>
                <input
                  type="text"
                  name="fleetName"
                  value={formData.fleetName}
                  onChange={handleChange}
                  placeholder="e.g., Jones Family Trucking"
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:ring-2"
                  style={{ focusRingColor: ORANGE }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Company Size</label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 trucks</option>
                  <option value="11-50">11-50 trucks</option>
                  <option value="51-100">51-100 trucks</option>
                  <option value="101+">101+ trucks</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Average Fleet Size</label>
                <input
                  type="number"
                  name="avgFleetSize"
                  value={formData.avgFleetSize}
                  onChange={handleChange}
                  placeholder="e.g., 15"
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Years in Business</label>
                <input
                  type="number"
                  name="yearsInBusiness"
                  value={formData.yearsInBusiness}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-slate-700">Primary Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                >
                  <option value="">Select specialization</option>
                  <option value="tanker">Tanker</option>
                  <option value="flatbed">Flatbed</option>
                  <option value="reefer">Reefer</option>
                  <option value="hazmat">Hazmat</option>
                  <option value="dry_van">Dry Van</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-slate-700">Operating States</label>
                <input
                  type="text"
                  name="operatingStates"
                  value={formData.operatingStates}
                  onChange={handleChange}
                  placeholder="e.g., TX, CA, FL"
                  className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: NAVY }}>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Primary Contact Name</label>
                  <input
                    type="text"
                    name="primaryContact"
                    value={formData.primaryContact}
                    onChange={handleChange}
                    placeholder="e.g., John Smith"
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="john@fleet.com"
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Company Website</label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://yourfleet.com"
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Operations Metrics */}
            <div className="bg-slate-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold mb-4" style={{ color: NAVY }}>Operations Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Safety Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    name="safetyRating"
                    value={formData.safetyRating}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Maintenance Rating (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    name="maintenanceRating"
                    value={formData.maintenanceRating}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Custom Needs */}
            <div className="mb-8">
              <label className="block text-sm font-semibold mb-2 text-slate-700">Any Special Requirements or Concerns?</label>
              <textarea
                name="customNeeds"
                value={formData.customNeeds}
                onChange={handleChange}
                placeholder="E.g., California AB5 compliance, multi-state operations, specific integrations needed..."
                rows="4"
                className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none"
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 rounded font-semibold text-white transition"
              style={{ backgroundColor: loading ? '#ccc' : ORANGE, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Saving Profile...' : 'Complete Fleet Profile'}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: GREEN }} />
            <h2 className="text-3xl font-bold mb-4" style={{ color: NAVY }}>
              Welcome to Traxes!
            </h2>
            <p className="text-slate-600 mb-6 text-lg">
              Your fleet profile has been created. We're personalizing your account based on your information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: NAVY }}>
                <Users className="w-6 h-6 mx-auto mb-2" style={{ color: NAVY }} />
                <p className="font-semibold text-slate-800">{formData.fleetName || 'Your Fleet'}</p>
                <p className="text-xs text-slate-600">{formData.companySize}</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: GREEN }}>
                <TrendingUp className="w-6 h-6 mx-auto mb-2" style={{ color: GREEN }} />
                <p className="font-semibold text-slate-800">Safety First</p>
                <p className="text-xs text-slate-600">Rating: {formData.safetyRating}/10</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4" style={{ borderLeftColor: ORANGE }}>
                <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: ORANGE }} />
                <p className="font-semibold text-slate-800">Specialized</p>
                <p className="text-xs text-slate-600">{formData.specialization || 'General'}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg mb-8 text-left">
              <h3 className="font-semibold mb-4 text-slate-800">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <span className="text-slate-700"><strong>Fleet Command Center:</strong> Manage all drivers, routes, and compliance from one dashboard</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <span className="text-slate-700"><strong>HRease Agent:</strong> Automate driver management, payroll, and compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <span className="text-slate-700"><strong>Dispatch Intelligence:</strong> AI-powered routing optimized for your specialization</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <span className="text-slate-700"><strong>Custom Integrations:</strong> We'll connect your existing systems seamlessly</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleFinish}
              className="inline-block px-8 py-3 rounded font-semibold text-white transition"
              style={{ backgroundColor: NAVY, border: 'none', cursor: 'pointer' }}
            >
              Go to Your Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
