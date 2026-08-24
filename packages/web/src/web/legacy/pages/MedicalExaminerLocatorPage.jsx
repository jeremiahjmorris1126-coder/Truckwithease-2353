import React, { useState } from 'react';
import { MapPin, Clock, Phone, Building2, Users, AlertCircle, CheckCircle } from 'lucide-react';
import {
  searchExaminersByState,
  findWalkInExaminers,
  findExaminersOpenNow,
  getAvailableStates,
  formatHours,
} from '../lib/medicalExaminersIndex';

const C = {
  black: '#060A10',
  white: '#f0ede8',
  white60: 'rgba(240, 237, 232, 0.6)',
  white30: 'rgba(240, 237, 232, 0.3)',
  white10: 'rgba(240, 237, 232, 0.1)',
  card: '#0f1419',
  gold: '#c9a84c',
  green: '#22c55e',
  red: '#ef4444',
  blue: '#3b82f6',
  cyan: '#06b6d4',
};

export default function MedicalExaminerLocatorPage() {
  const [selectedState, setSelectedState] = useState(null);
  const [searchMode, setSearchMode] = useState('all'); // all, walkin, open-now
  const [examiners, setExaminers] = useState([]);
  const states = getAvailableStates();

  const handleSelectState = (stateCode) => {
    setSelectedState(stateCode);
    const stateData = searchExaminersByState(stateCode);
    if (stateData) {
      setExaminers(stateData.examiners);
    }
  };

  const getFilteredExaminers = () => {
    if (!selectedState) return [];

    if (searchMode === 'walkin') {
      return findWalkInExaminers(selectedState);
    }
    if (searchMode === 'open-now') {
      return findExaminersOpenNow(selectedState);
    }
    return examiners;
  };

  const filteredExaminers = getFilteredExaminers();

  return (
    <div style={{ minHeight: '100vh', background: C.black, color: C.white, padding: '24px 16px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: '12px', background: `linear-gradient(135deg, ${C.gold}, ${C.cyan})`, backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: C.gold }}>
            🏥 Medical Examiner Locator
          </h1>
          <p style={{ fontSize: 16, color: C.white60, lineHeight: 1.7 }}>
            Find FMCSA-certified medical examiners in your state. Walk-in friendly. Company partnerships. Hours, location, direct contact.
          </p>
        </div>

        {/* State Selection */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Select Your State</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
            {states.map(state => (
              <button
                key={state.code}
                onClick={() => handleSelectState(state.code)}
                style={{
                  padding: '12px',
                  background: selectedState === state.code ? C.gold : C.card,
                  color: selectedState === state.code ? C.black : C.white,
                  border: `2px solid ${selectedState === state.code ? C.gold : C.white10}`,
                  borderRadius: '6px',
                  fontWeight: selectedState === state.code ? '700' : '600',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'all 0.2s',
                }}
              >
                <div>{state.code}</div>
                <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px' }}>
                  {state.examinerCount} offices
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search Filters */}
        {selectedState && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Search Filters</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Examiners', icon: '📋' },
                { id: 'walkin', label: 'Walk-In Friendly', icon: '👥' },
                { id: 'open-now', label: 'Open Now', icon: '🕐' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSearchMode(filter.id)}
                  style={{
                    padding: '10px 16px',
                    background: searchMode === filter.id ? C.cyan : C.card,
                    color: searchMode === filter.id ? C.black : C.white,
                    border: `1px solid ${searchMode === filter.id ? C.cyan : C.white10}`,
                    borderRadius: '6px',
                    fontWeight: searchMode === filter.id ? '700' : '600',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {selectedState && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
              {filteredExaminers.length} Medical Examiner{filteredExaminers.length !== 1 ? 's' : ''} Found
            </h2>

            {filteredExaminers.length === 0 ? (
              <div style={{
                background: C.card,
                border: `1px solid ${C.white10}`,
                borderRadius: '8px',
                padding: '32px',
                textAlign: 'center',
              }}>
                <AlertCircle size={32} color={C.gold} style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: '14px', color: C.white60, margin: 0 }}>
                  No examiners match your search. Try a different filter or state.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
                {filteredExaminers.map((examiner, idx) => (
                  <div key={idx} style={{
                    background: C.card,
                    border: `1px solid ${C.white10}`,
                    borderRadius: '8px',
                    padding: '20px',
                    transition: 'all 0.2s',
                  }}>
                    {/* Name & Walk-In Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.cyan, margin: 0 }}>
                        {examiner.name}
                      </h3>
                      {examiner.walkInFriendly && (
                        <span style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: C.green,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                        }}>
                          Walk-In OK
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <MapPin size={16} color={C.gold} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <p style={{ fontSize: '12px', color: C.white60, margin: 0, lineHeight: 1.4 }}>
                          {examiner.address}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      <Phone size={16} color={C.gold} style={{ flexShrink: 0 }} />
                      <a href={`tel:${examiner.phone}`} style={{ fontSize: '12px', color: C.cyan, textDecoration: 'none', fontWeight: '600' }}>
                        {examiner.phone}
                      </a>
                    </div>

                    {/* Hours */}
                    <div style={{ marginBottom: '12px', background: C.black, borderRadius: '4px', padding: '12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: C.gold, margin: '0 0 8px 0' }}>
                        Hours:
                      </p>
                      <div style={{ fontSize: '10px', color: C.white60, lineHeight: 1.6 }}>
                        {formatHours(examiner.hours).length > 0 ? (
                          formatHours(examiner.hours).map((hour, hIdx) => (
                            <div key={hIdx}>{hour}</div>
                          ))
                        ) : (
                          <div>Call for hours</div>
                        )}
                      </div>
                    </div>

                    {/* Services */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '700', color: C.gold, margin: '0 0 6px 0' }}>
                        Services:
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {examiner.services.map((service, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '10px',
                              background: 'rgba(106, 17, 203, 0.15)',
                              color: '#a855f7',
                              padding: '3px 6px',
                              borderRadius: '3px',
                            }}
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Company Partners */}
                    {examiner.trucksCompanyPartners.length > 0 && (
                      <div style={{ marginBottom: '12px', background: 'rgba(106, 17, 203, 0.1)', borderRadius: '4px', padding: '12px' }}>
                        <p style={{ fontSize: '11px', fontWeight: '700', color: '#a855f7', margin: '0 0 6px 0' }}>
                          Partner Companies:
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {examiner.trucksCompanyPartners.map((company, cIdx) => (
                            <span
                              key={cIdx}
                              style={{
                                fontSize: '10px',
                                background: C.black,
                                border: `1px solid #a855f7`,
                                color: '#a855f7',
                                padding: '4px 6px',
                                borderRadius: '3px',
                              }}
                            >
                              ✓ {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px', color: C.white60, padding: '12px 0', borderTop: `1px solid ${C.white10}`, marginTop: '12px' }}>
                      <div>
                        <p style={{ margin: '0 0 2px 0' }}>Wait Time:</p>
                        <p style={{ margin: 0, color: C.cyan, fontWeight: '600' }}>{examiner.avgWaitTime}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 2px 0' }}>Insurance:</p>
                        <p style={{ margin: 0, color: examiner.acceptsInsurance ? C.green : C.red, fontWeight: '600' }}>
                          {examiner.acceptsInsurance ? '✓ Accepted' : '× Not Accepted'}
                        </p>
                      </div>
                    </div>

                    {/* Call Button */}
                    <a
                      href={`tel:${examiner.phone}`}
                      style={{
                        display: 'block',
                        marginTop: '12px',
                        padding: '10px',
                        background: C.gold,
                        color: C.black,
                        textAlign: 'center',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      📞 Call Now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedState && (
          <div style={{
            background: C.card,
            border: `1px solid ${C.white10}`,
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <MapPin size={40} color={C.cyan} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: '16px', color: C.white60, margin: 0 }}>
              Select a state above to find medical examiners
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
